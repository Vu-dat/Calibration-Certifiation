const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 18080;

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

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

    // 2. Bảng quản lý thông tin khách hàng
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

    // 5. Bảng ghi lịch sử chỉnh sửa (Audit Trail)
    db.run(`CREATE TABLE IF NOT EXISTS ACTIVITY_LOGS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USER_NAME TEXT DEFAULT 'Hệ thống / KTV',
        ACTION_TYPE TEXT,
        TARGET_TABLE TEXT,
        TARGET_ID TEXT,
        DESCRIPTION TEXT,
        TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // 6. Bảng quản lý tài khoản nhân viên (Bổ sung cho phần Đăng nhập)
    db.run(`CREATE TABLE IF NOT EXISTS USERS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME TEXT UNIQUE,
        PASSWORD TEXT,          -- Trong thực tế sẽ mã hóa bằng thư viện bcrypt
        FULL_NAME TEXT,
        ROLE TEXT               -- 'admin', 'head_of_lab', 'technician'
    )`);

    // Chèn thử 3 tài khoản mẫu ứng với 3 phân quyền nếu bảng trống
    db.get("SELECT COUNT(*) as count FROM USERS", [], (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare(`INSERT INTO USERS (USERNAME, PASSWORD, FULL_NAME, ROLE) VALUES (?, ?, ?, ?)`);
            stmt.run("ktv1", "123456", "KTV. Nguyễn Văn A", "technician");
            stmt.run("tplab", "123456", "Trưởng Phòng B", "head_of_lab");
            stmt.run("admin", "admin123", "Quản Trị Viên Hệ Thống", "admin");
            stmt.finalize();
        }
    });
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
    const { id, title, tech, status } = req.body;
    
    db.get("SELECT ID FROM PROJECTS WHERE ID = ?", [id], (err, row) => {
        const isNew = !row;
        const action = isNew ? "CREATE" : "UPDATE";
        const desc = isNew ? `Tạo mới dự án: "${title}"` : `Cập nhật trạng thái dự án "${title}" thành [${status}]`;

        const stmt = db.prepare(`INSERT OR REPLACE INTO PROJECTS (ID, TITLE, TECH, STATUS) VALUES (?, ?, ?, ?)`);
        stmt.run([id, title, tech, status], function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            logActivity(tech || "Hệ thống / KTV", action, "PROJECTS", id, desc);
            res.json({ success: true, id: id });
        });
        stmt.finalize();
    });
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
        
        db.all("SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [certNo], (err, points) => {
            res.json({ cert, points });
        });
    });
});

app.post('/api/calibration/save', (req, res) => {
    const data = req.body;
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

app.get('/api/calibration/export-pdf/:certNo', (req, res) => {
    const certNo = req.params.certNo;
    exec(`node generate_pdf.js ${certNo}`, (error) => {
        if (error) return res.status(500).json({ success: false, msg: "Lỗi render PDF" });
        res.json({ success: true, pdf_url: `/static/certificates/GCN_${certNo}.pdf` });
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
