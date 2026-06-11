const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 18080;
app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Khởi tạo và kết nối Database SQLite
const db = new sqlite3.Database(path.join(__dirname, 'labmaster_enterprise.db'));
db.serialize(() => {
    // 1. Bảng quản lý tiến độ Dự án
    db.run(`CREATE TABLE IF NOT EXISTS PROJECTS (
        ID TEXT PRIMARY KEY, 
        TITLE TEXT, 
        TECH TEXT, 
        STATUS TEXT, 
        CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Bảng quản lý thông tin khách hàng (Bổ sung bảng bị thiếu)
    db.run(`CREATE TABLE IF NOT EXISTS CUSTOMERS (
        ID TEXT PRIMARY KEY, NAME TEXT, COMPANY TEXT, PHONE TEXT, TAX TEXT, EMAIL TEXT, ADDRESS TEXT, NOTE TEXT
    )`);

    // 3. Bảng thông tin chung của Giấy Chứng Nhận
    db.run(`CREATE TABLE IF NOT EXISTS CERTIFICATES (
        CERT_NO TEXT PRIMARY KEY, INSTRUMENT_NAME TEXT, MANUFACTURER TEXT, MODEL TEXT, 
        EQUIPMENT_ID TEXT, SERIAL_NUMBER TEXT, CUSTOMER_NAME TEXT, CAL_DATE TEXT, 
        RE_CAL_DATE TEXT, PROCEDURE TEXT, REF_STANDARD TEXT, TEMP_ENV TEXT, HUMI_ENV TEXT,
        HEAD_OF_LAB TEXT, DIRECTOR TEXT
    )`);

    // 4. Bảng chi tiết lưu kết quả các điểm thông số đo
    db.run(`CREATE TABLE IF NOT EXISTS CALIBRATION_POINTS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        CERT_NO TEXT,
        PARAMETER_NAME TEXT,
        CAL_POINT TEXT,
        AS_FOUND_VALUE TEXT,
        UNCERTAINTY TEXT,
        TOLERANCE TEXT,
        CONFORMITY TEXT,
        FOREIGN KEY(CERT_NO) REFERENCES CERTIFICATES(CERT_NO) ON DELETE CASCADE
    )`);

    // 5. Bảng lưu trữ danh sách thiết bị chuẩn sử dụng cho Chứng nhận này
    db.run(`CREATE TABLE IF NOT EXISTS CERTIFICATE_STANDARDS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        CERT_NO TEXT,
        EQ_CODE TEXT,
        EQ_NAME TEXT,
        LINK TEXT,
        VALIDITY TEXT,
        FOREIGN KEY(CERT_NO) REFERENCES CERTIFICATES(CERT_NO) ON DELETE CASCADE
    )`);

    // 6. Bảng ghi lịch sử chỉnh sửa (Audit Trail)
    db.run(`CREATE TABLE IF NOT EXISTS ACTIVITY_LOGS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USER_NAME TEXT DEFAULT 'Hệ thống / KTV',
        ACTION_TYPE TEXT,
        TARGET_TABLE TEXT,
        TARGET_ID TEXT,
        DESCRIPTION TEXT,
        TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 7. Bảng quản lý tài khoản nhân viên (Bổ sung cho phần Đăng nhập)
    db.run(`CREATE TABLE IF NOT EXISTS USERS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME TEXT UNIQUE,
        PASSWORD TEXT,          -- Trong thực tế sẽ mã hóa bằng thư viện bcrypt
        FULL_NAME TEXT,
        ROLE TEXT               -- 'admin', 'head_of_lab', 'technician'
    )`);

    // 8. Bảng lưu trữ mẫu thiết bị (Database Equipment)
    db.run(`CREATE TABLE IF NOT EXISTS EQUIPMENT_TEMPLATES (
        NAME TEXT PRIMARY KEY,
        MANUFACTURER TEXT,
        NEXT_DUE TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS TEMPLATE_POINTS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        TEMPLATE_NAME TEXT,
        PARAMETER_NAME TEXT,
        CAL_POINT TEXT,
        UNCERTAINTY TEXT,
        TOLERANCE TEXT,
        CONFORMITY TEXT,
        FOREIGN KEY(TEMPLATE_NAME) REFERENCES EQUIPMENT_TEMPLATES(NAME) ON DELETE CASCADE
    )`);
});

// Hàm tiện ích tự động ghi nhật ký hệ thống ngầm
function logActivity(userName, actionType, targetTable, targetId, description) {
    const stmt = db.prepare(`
        INSERT INTO ACTIVITY_LOGS (USER_NAME, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
        VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([userName, actionType, targetTable, targetId, description], (err) => {
        if (err) console.error("❌ Lỗi ghi log:", err.message);
    });
    stmt.finalize();
}

// ================= API QUẢN LÝ DỰ ÁN =================

app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM PROJECTS ORDER BY CREATED_AT DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects', (req, res) => {
    let { id, title, tech, status } = req.body;

    const saveToDb = (finalId) => {
        db.get("SELECT ID FROM PROJECTS WHERE ID = ?", [finalId], (err, row) => {
            const isNew = !row;
            const action = isNew ? "CREATE" : "UPDATE";
            const desc = isNew ? `Tạo mới dự án: "${title}"` : `Cập nhật trạng thái dự án "${title}" thành [${status}]`;

            const stmt = db.prepare(`INSERT OR REPLACE INTO PROJECTS (ID, TITLE, TECH, STATUS) VALUES (?, ?, ?, ?)`);
            stmt.run([finalId, title, tech, status], function(err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                logActivity(tech || "Hệ thống / KTV", action, "PROJECTS", finalId, desc);
                res.json({ success: true, id: finalId });
            });
            stmt.finalize();
        });
    };

    if (!id) {
        // Thuật toán tịnh tiến: Tìm mã PRJ-XXXXXX cao nhất trong DB
        db.get("SELECT ID FROM PROJECTS WHERE ID LIKE 'PRJ-%' ORDER BY ID DESC LIMIT 1", (err, row) => {
            let nextNum = 1;
            if (row && row.ID) {
                const lastNum = parseInt(row.ID.split('-')[1]);
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
            const nextId = `PRJ-${String(nextNum).padStart(6, '0')}`;
            saveToDb(nextId);
        });
    } else {
        saveToDb(id);
    }
});

app.delete('/api/projects/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT TITLE FROM PROJECTS WHERE ID = ?", [id], (err, row) => {
        const title = row ? row.TITLE : "Không rõ tên";
        
        db.run("DELETE FROM PROJECTS WHERE ID = ?", [id], (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            logActivity("Quản trị viên", "DELETE", "PROJECTS", id, `Đã xóa dự án: "${title}"`);
            res.json({ success: true });
        });
    });
});

// ================= API HIỆU CHUẨN & LƯU WORKSPACE =================

app.get('/api/calibration/:certNo', (req, res) => {
    const certNo = req.params.certNo;
    db.get("SELECT * FROM CERTIFICATES WHERE CERT_NO = ?", [certNo], (err, cert) => {
        if (err || !cert) return res.status(404).json({ success: false, message: "Không tìm thấy số GCN" });

        db.all("SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [certNo], (err, points) => { // Fetch points
            db.all("SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ?", [certNo], (err, standards) => { // Fetch standards
                res.json({ cert, points, standards });
            });
        });
    });
});

app.post('/api/calibration/save', (req, res) => {
    const data = req.body;
    const standards = data.standards || [];
    // Lấy thông tin người thực hiện từ body do frontend gửi lên
    const currentWorker = req.body.currentUser || "Hệ thống / KTV"; 

    // Kích hoạt ghi log với tên người dùng thực tế
    logActivity(currentWorker, "UPDATE", "CERTIFICATES", data.certNo, `Cập nhật số liệu đo...`);
    db.serialize(() => {
        // 1. Lưu thông tin chung giấy chứng nhận (Đã điền đầy đủ cấu trúc tham số)
        const certStmt = db.prepare(`
            INSERT OR REPLACE INTO CERTIFICATES 
            (CERT_NO, INSTRUMENT_NAME, MANUFACTURER, MODEL, EQUIPMENT_ID, SERIAL_NUMBER, CUSTOMER_NAME, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `);
        
        certStmt.run([
            data.certNo, data.instrumentName, data.manufacturer, data.model, data.equipmentId,
            data.serialNumber, data.customerName, data.calDate, data.reCalDate,
            data.procedure, data.refStandard, data.tempEnv, data.humiEnv, data.headOfLab, data.director
        ], (err) => {
            if (err) console.error("Lỗi lưu Certificates:", err.message);
        });
        certStmt.finalize();
        
        // 2. Xóa các điểm đo cũ để tránh trùng rác dữ liệu
        db.run("DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ?", [data.certNo]); // Delete old standards
        db.run("DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [data.certNo], (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            // 3. Ghi đè loạt điểm đo mới gửi từ Workspace
            const pointStmt = db.prepare(`
                INSERT INTO CALIBRATION_POINTS 
                (CERT_NO, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY) 
                VALUES (?,?,?,?,?,?,?)
            `);
            
            if (data.points && Array.from(data.points).length > 0) {
                data.points.forEach(p => {
                    pointStmt.run(data.certNo, p.parameterName, p.calPoint, p.asFoundValue, p.uncertainty, p.tolerance, p.conformity);
                });
            }
            
            pointStmt.finalize((finalErr) => {
                if (finalErr) return res.status(500).json({ success: false, error: finalErr.message });
                
                // GHI LOG THÀNH CÔNG VÀO DATABASE
                logActivity(
                    "KTV. Nhật Quang", 
                    "UPDATE", 
                    "CERTIFICATES", 
                    data.certNo, 
                    `Cập nhật số liệu kết quả đo cho thiết bị ${data.instrumentName} (Mã chuẩn: ${data.equipmentId})`
                );

                res.json({ success: true, message: "Dữ liệu hiệu chuẩn đã được ghi nhận vào SQL ổn định!" });
            });
        });
    });

});



// ================= API QUẢN LÝ MẪU THIẾT BỊ (DATABASE EQUIPMENT) =================

app.get('/api/equipment-templates', (req, res) => {
    db.all("SELECT * FROM EQUIPMENT_TEMPLATES", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        const fetchPoints = rows.map(template => {
            return new Promise((resolve) => {
                db.all("SELECT * FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ?", [template.NAME], (err, points) => {
                    template.formPoints = points || [];
                    resolve(template);
                });
            });
        });

        Promise.all(fetchPoints).then(results => res.json(results));
    });
});
// ─────────────────────────────────────────────────────────────────────────
// API TIẾP NHẬN THÊM MỚI THIẾT BỊ CHUẨN VÀ ĐỒNG BỘ LÊN GIAO DIỆN KHÔNG LỖI
// ĐÃ SỬA TRIỆT ĐỂ: Khớp Schema CERTIFICATES gốc, chặn đứng crash SQLITE
// ─────────────────────────────────────────────────────────────────────────
app.post('/api/equipment', (req, res) => {
    // Sử dụng khối try-catch tối cao để bảo vệ Server không bao giờ bị tắt/sập bất ngờ
    try {
        const { equipment_id, standard_name, manufacturer, due_date, points } = req.body;

        if (!equipment_id || !standard_name) {
            return res.status(400).json({ success: false, message: "Thiếu mã nhận diện hoặc tên thiết bị chuẩn!" });
        }

        db.serialize(() => {
            // Chuẩn hóa câu lệnh chuẩn theo đúng các cột gốc của bảng CERTIFICATES trong code của bạn:
            // CERT_NO, EQUIPMENT_ID, INSTRUMENT_NAME, MANUFACTURER, MODEL
            // Ta lưu tạm due_date vào cột MODEL đối với thiết bị chuẩn để không bị văng lỗi thiếu cột
            const stmtCert = db.prepare(`
                INSERT OR REPLACE INTO CERTIFICATES (
                    CERT_NO, EQUIPMENT_ID, INSTRUMENT_NAME, MANUFACTURER, MODEL
                ) VALUES (?, ?, ?, ?, ?)
            `);

            stmtCert.run(equipment_id, equipment_id, standard_name, manufacturer, due_date, function(err) {
                if (err) {
                    console.error("❌ Lỗi SQLite chèn thông tin chung:", err.message);
                    return res.status(500).json({ success: false, message: "Lỗi cấu trúc SQLite: " + err.message });
                }

                // 2. Ghi nhận mảng thông số điểm chuẩn mẫu đi kèm vào bảng CALIBRATION_POINTS
                if (points && points.length > 0) {
                    const stmtPoint = db.prepare(`
                        INSERT INTO CALIBRATION_POINTS (
                            CERT_NO, PARAMETER, STANDARD_VALUE, ACTUAL_VALUE, STATUS
                        ) VALUES (?, ?, ?, ?, 'A')
                    `);

                    points.forEach(p => {
                        const numValue = parseFloat(p.value) || 0;
                        stmtPoint.run(equipment_id, p.parameter, numValue, numValue);
                    });

                    stmtPoint.finalize();
                }

                // 3. PHẢN HỒI THÀNH CÔNG: Đóng Modal Frontend và re-render giao diện hiển thị lập tức
                return res.json({ 
                    success: true, 
                    message: `Thiết bị chuẩn ${equipment_id} đã được lưu trữ hoàn tất!` 
                });
            });

            stmtCert.finalize();
        });

    } catch (criticalServerError) {
        console.error("🔥 CRITICAL API SERVER ERROR THIẾT BỊ:", criticalServerError);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống xử lý endpoint.", error: criticalServerError.message });
    }
});

app.delete('/api/equipment-templates/:name', (req, res) => {
    const name = req.params.name;
    db.serialize(() => {
        db.run("DELETE FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ?", [name], (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            db.run("DELETE FROM EQUIPMENT_TEMPLATES WHERE NAME = ?", [name], (err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                logActivity("Hệ thống", "DELETE", "EQUIPMENT_TEMPLATES", name, `Đã xóa mẫu thiết bị: ${name}`);
                res.json({ success: true });
            });
        });
    });
});

// ================= API QUẢN LÝ KHÁCH HÀNG =================

app.get('/api/customers', (req, res) => {
    db.all("SELECT * FROM CUSTOMERS", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/customers', (req, res) => {
    const c = req.body;
    const stmt = db.prepare(`INSERT OR REPLACE INTO CUSTOMERS (ID, NAME, COMPANY, PHONE, TAX, EMAIL, ADDRESS, NOTE) VALUES (?,?,?,?,?,?,?,?)`);
    stmt.run([c.id, c.name, c.company, c.phone, c.tax, c.email, c.address, c.note]);
    stmt.finalize();
    res.json({ success: true });
});

app.delete('/api/customers/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM CUSTOMERS WHERE ID = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});

// API lấy lịch sử chỉnh sửa hệ thống (Audit Logs)
app.get('/api/audit-logs', (req, res) => {
    db.all("SELECT * FROM ACTIVITY_LOGS ORDER BY TIMESTAMP DESC LIMIT 200", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

app.get('/api/stats/summary', (req, res) => {
    db.get("SELECT COUNT(*) as certCount FROM CERTIFICATES", [], (err, row) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ certCount: row.certCount || 0 });
    });
});

// Tạo thư mục static nếu chưa tồn tại để tránh lỗi kẹt file
const staticDir = path.join(__dirname, 'static');
if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true });

/**
 * POST /api/calibration/export-pdf
 * Nhận toàn bộ dữ liệu workspace từ frontend, lưu vào DB, sau đó gọi generate_pdf.js để xuất file.
 * Body: { cert_no, instrumentName, manufacturer, model, equipmentId, serialNumber,
 *         customerName, calDate, reCalDate, procedure, refStandard, tempEnv, humiEnv,
 *         headOfLab, director, points: [{parameterName, calPoint, asFoundValue, uncertainty, tolerance, conformity}],
 *         standards: [{name, id, trace, due}] }
 */
app.post('/api/calibration/export-pdf', (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) {
        return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });
    }

    const scriptPath = path.join(__dirname, 'generate_pdf.js');

    // Hàm lưu dữ liệu vào DB rồi mới gọi script sinh PDF
    db.serialize(() => {
        // 1. Lưu / cập nhật bảng CERTIFICATES
        const certStmt = db.prepare(`
            INSERT OR REPLACE INTO CERTIFICATES 
            (CERT_NO, INSTRUMENT_NAME, MANUFACTURER, MODEL, EQUIPMENT_ID, SERIAL_NUMBER,
             CUSTOMER_NAME, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV,
             HEAD_OF_LAB, DIRECTOR)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `);
        certStmt.run([
            cert_no,
            data.instrumentName || data.instrument_name || '',
            data.manufacturer   || '',
            data.model          || '',
            data.equipmentId    || data.equipment_id    || '',
            data.serialNumber   || data.serial_number   || '',
            data.customerName   || data.customer_name   || '',
            data.calDate        || data.cal_date         || '',
            data.reCalDate      || data.re_cal_date      || '',
            data.procedure      || '',
            data.refStandard    || data.ref_standard     || '',
            data.tempEnv        || data.temp_env         || '',
            data.humiEnv        || data.humi_env         || '',
            data.headOfLab      || data.head_of_lab      || '',
            data.director       || ''
        ]);
        certStmt.finalize();

        // 2. Xóa điểm đo cũ và thiết bị chuẩn cũ
        db.run("DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [cert_no]);
        db.run("DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ?", [cert_no]);

        // 3. Ghi điểm đo mới — map đúng tên field gửi từ frontend
        const points = data.points || [];
        if (points.length > 0) {
            const ptStmt = db.prepare(`
                INSERT INTO CALIBRATION_POINTS
                (CERT_NO, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY)
                VALUES (?,?,?,?,?,?,?)
            `);
            points.forEach(p => {
                ptStmt.run([
                    cert_no,
                    p.parameterName || p.param    || '',
                    p.calPoint      || p.point    || '',
                    p.asFoundValue  || p.found    || '',
                    p.uncertainty   || p.unc      || '',
                    p.tolerance     || p.tol      || '',
                    p.conformity    || p.conf     || ''
                ]);
            });
            ptStmt.finalize();
        }

        // 4. Ghi thiết bị chuẩn mới — map đúng field gửi từ frontend
        // 5. Sau khi finalize() của bước cuối xác nhận DB ghi xong, mới gọi generate_pdf.js
        const runExec = () => {
            exec(`node "${scriptPath}" "${cert_no}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Lỗi thực thi generate_pdf.js: ${error.message}`);
                    if (stderr) console.error(`Chi tiết: ${stderr}`);
                    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi sinh PDF." });
                }

                const fileName = `GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
                logActivity("Hệ thống / KTV", "EXPORT_PDF", "CERTIFICATES", cert_no, `Xuất PDF: ${fileName}`);

                return res.json({
                    success: true,
                    message: `Đã xuất thành công GCN_${cert_no}.pdf`,
                    file_url: `http://localhost:${process.env.PORT || 18080}/static/${fileName}`
                });
            });
        };

        const stds = data.standards || [];
        if (stds.length > 0) {
            const stdStmt = db.prepare(`
                INSERT INTO CERTIFICATE_STANDARDS (CERT_NO, EQ_CODE, EQ_NAME, LINK, VALIDITY)
                VALUES (?,?,?,?,?)
            `);
            stds.forEach(s => {
                stdStmt.run([cert_no, s.id || s.code || '', s.name || '', s.trace || s.link || '', s.due || s.validity || '']);
            });
            // Chờ finalize hoàn tất (tất cả INSERT đã flush vào DB) rồi mới sinh PDF
            stdStmt.finalize((err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                runExec();
            });
        } else {
            // Không có standards — chờ bước serialize kết thúc rồi sinh PDF
            db.run("SELECT 1", [], () => runExec());
        }
    });
});

// KHỞI CHẠY SERVER
app.listen(port, () => {
    console.log(`[LabMaster Enterprise OS] Backend API đang chạy mượt mà tại cổng: http://localhost:${port}`);
});

// API xử lý đăng nhập tài khoản nhân viên
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get("SELECT * FROM USERS WHERE USERNAME = ? AND PASSWORD = ?", [username, password], (err, user) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
        }
        
        // Trả về thông tin đăng nhập thành công (Trong thực tế chuyên nghiệp sẽ dùng mã Token JWT)
        res.json({
            success: true,
            user: {
                username: user.USERNAME,
                fullName: user.FULL_NAME,
                role: user.ROLE
            }
        });
    });
});

// API lấy thông tin chi tiết của một dự án theo ID
app.get('/api/projects/:id', (req, res) => {
    const projectId = req.params.id;
    db.get("SELECT * FROM PROJECTS WHERE ID = ?", [projectId], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: "Không tìm thấy dự án!" });
        }
        res.json({ success: true, project: row });
    });
});