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

// CẤU HÌNH TỐI ƯU CHỐNG KHÓA DATABASE (SQLITE_BUSY)
db.run("PRAGMA journal_mode = WAL"); // Bật chế độ ghi nhật ký trước (tăng hiệu năng đa luồng)
db.configure("busyTimeout", 5000);   // Chờ tối đa 5 giây nếu DB đang bị khóa trước khi báo lỗi

// ================= QUẢN LÝ BẢNG CLOCK (THIẾT BỊ CHUẨN DÙNG ĐỂ HIỆU CHUẨN) =================
// CLOCK lưu danh sách "thiết bị chuẩn" (cân chuẩn, đồng hồ bấm giờ, panme, nhiệt kế chuẩn...).
// Hàm này tự đọc cấu trúc bảng CLOCK hiện có trong file .db; nếu là bảng cũ/thiếu cột so với
// cấu trúc đầy đủ mà Frontend (equipment.html) cần, nó sẽ TỰ ĐỘNG nâng cấp, đồng thời giữ lại
// toàn bộ dữ liệu cũ (đổi tên bảng cũ thành CLOCK_LEGACY_BACKUP, không xoá).
function initClockTable() {
    const FULL_COLUMNS = ['ID', 'KEY_FIELD', 'NAME', 'MANUFACTURER', 'MODEL', 'SERIAL_NUMBER', 'GCN', 'LINK', 'CAL_DATE', 'VALIDITY', 'TYPE', 'NOTES', 'CREATED_AT'];

    const createFullClockTable = (tableName, cb) => {
        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
            ID TEXT PRIMARY KEY,
            KEY_FIELD TEXT,
            NAME TEXT NOT NULL,
            MANUFACTURER TEXT,
            MODEL TEXT,
            SERIAL_NUMBER TEXT,
            GCN TEXT,
            LINK TEXT,
            CAL_DATE TEXT,
            VALIDITY TEXT,
            TYPE TEXT DEFAULT 'standard',
            NOTES TEXT,
            CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, cb);
    };

    db.all("PRAGMA table_info(CLOCK)", [], (err, cols) => {
        if (err) { console.error("❌ Lỗi đọc cấu trúc bảng CLOCK:", err.message); return; }
        const existingCols = cols.map(c => c.name);

        // Chưa từng có bảng CLOCK -> tạo mới với cấu trúc đầy đủ
        if (existingCols.length === 0) {
            return createFullClockTable('CLOCK', (e) => {
                if (e) console.error("❌ Lỗi tạo bảng CLOCK:", e.message);
                else {
                    console.log("✅ Đã tạo bảng CLOCK (thiết bị chuẩn) với cấu trúc đầy đủ.");
                    seedDefaultClockData();
                }
            });
        }

        const missing = FULL_COLUMNS.filter(c => !existingCols.includes(c));
        if (missing.length === 0) {
            seedDefaultClockData();
            return; // Cấu trúc đã chuẩn, không cần làm gì
        }

        console.warn(`⚠️  Bảng CLOCK đang thiếu cột [${missing.join(', ')}] -> tự động nâng cấp cấu trúc...`);

        db.all("SELECT * FROM CLOCK", [], (err2, oldRows) => {
            if (err2) { console.error("❌ Lỗi đọc dữ liệu CLOCK cũ:", err2.message); return; }

            db.run("ALTER TABLE CLOCK RENAME TO CLOCK_LEGACY_BACKUP", (err3) => {
                if (err3) { console.error("❌ Lỗi đổi tên bảng CLOCK cũ:", err3.message); return; }

                createFullClockTable('CLOCK', (err4) => {
                    if (err4) { console.error("❌ Lỗi tạo bảng CLOCK mới:", err4.message); return; }

                    const insertStmt = db.prepare(`
                        INSERT OR REPLACE INTO CLOCK (ID, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, VALIDITY, TYPE, NOTES, CREATED_AT)
                        VALUES (?, ?, ?, ?, ?, ?, 'standard', ?, ?)
                    `);

                    oldRows.forEach((row, idx) => {
                        // Map dữ liệu cũ sang cấu trúc mới, không làm mất thông tin
                        const rawId = (row.ID !== undefined) ? row.ID : idx;
                        const newId = (typeof rawId === 'string' && /[A-Za-z]/.test(rawId)) ? rawId : `STD-${rawId}`;
                        const name = row.NAME || row.CLOCK_NAME || `Thiết bị chuẩn ${newId}`;
                        insertStmt.run([
                            newId, name, row.MANUFACTURER || '', row.MODEL || '', row.SERIAL_NUMBER || '',
                            row.VALIDITY || '', row.DESCRIPTION || row.NOTES || '', row.CREATED_AT || new Date().toISOString()
                        ]);
                    });

                    insertStmt.finalize((err5) => {
                        if (err5) console.error("❌ Lỗi nâng cấp dữ liệu CLOCK:", err5.message);
                        else {
                            console.log(`✅ Đã nâng cấp bảng CLOCK xong (${oldRows.length} dòng dữ liệu cũ được giữ lại, xem trong CLOCK_LEGACY_BACKUP).`);
                            seedDefaultClockData();
                        }
                    });
                });
            });
        });
    });
}

// Hàm tự động seed dữ liệu 72 thiết bị chuẩn từ seed_clock_data.json vào SQLite
function seedDefaultClockData() {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, 'seed_clock_data.json');
    
    if (!fs.existsSync(jsonPath)) {
        console.warn("⚠️  Không tìm thấy seed_clock_data.json để seed dữ liệu CLOCK.");
        return;
    }

    try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const items = JSON.parse(raw);
        
        db.serialize(() => {
            const stmt = db.prepare(`
                INSERT OR IGNORE INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'standard')
            `);

            items.forEach(item => {
                stmt.run([
                    item.id,
                    item.key || '',
                    item.name || `Thiết bị chuẩn ${item.id}`,
                    item.nsx || '',
                    item.model || '',
                    item.serial || '',
                    item.gcn || '',
                    item.lienKet || '',
                    item.calDate || '1900-12-31',
                    item.validity || '1900-12-31'
                ]);
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error("❌ Lỗi khi seed dữ liệu CLOCK:", err.message);
                } else {
                    console.log("✅ Đã kiểm tra và seed dữ liệu CLOCK từ seed_clock_data.json thành công.");
                }
            });
        });
    } catch (err) {
        console.error("❌ Lỗi đọc và seed dữ liệu CLOCK:", err.message);
    }
}

db.serialize(() => {
    // 1. Bảng quản lý tiến độ Dự án (Đã di chuyển ra khỏi seedDefaultClockDataFromHTML)
    db.run(`CREATE TABLE IF NOT EXISTS PROJECTS (
        ID TEXT PRIMARY KEY, 
        TITLE TEXT, 
        TECH TEXT, 
        STATUS TEXT, 
        CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Bảng quản lý thông tin khách hàng
    db.run(`CREATE TABLE IF NOT EXISTS CUSTOMERS (
        ID TEXT PRIMARY KEY, NAME TEXT, COMPANY TEXT, PHONE TEXT, TAX TEXT, EMAIL TEXT, BILLING_ADDRESS TEXT, CONTACT TEXT, NOTE TEXT
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
        REF_EQUIPMENT TEXT, -- Hoặc STANDARD_EQUIPMENT tùy thuộc vào cấu trúc của generate_pdf.js
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

    // 7. Bảng quản lý tài khoản nhân viên
    db.run(`CREATE TABLE IF NOT EXISTS USERS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME TEXT UNIQUE,
        PASSWORD TEXT,
        FULL_NAME TEXT,
        ROLE TEXT
    )`);

    // 8. Bảng lưu trữ mẫu thiết bị (Database Equipment)
    db.run(`CREATE TABLE IF NOT EXISTS EQUIPMENT_TEMPLATES (
        NAME TEXT PRIMARY KEY,
        MANUFACTURER TEXT,
        NEXT_DUE TEXT,
        EQUIPMENT_ID TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS TEMPLATE_POINTS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        TEMPLATE_NAME TEXT,
        PARAMETER_NAME TEXT,
        CAL_POINT TEXT,
        AS_FOUND_VALUE TEXT,
        UNCERTAINTY TEXT,
        TOLERANCE TEXT,
        CONFORMITY TEXT,
        STANDARD_EQUIPMENT TEXT,
        FOREIGN KEY(TEMPLATE_NAME) REFERENCES EQUIPMENT_TEMPLATES(NAME) ON DELETE CASCADE
    )`);

    // YÊU CẦU 1: Khởi tạo/nâng cấp bảng CLOCK quản lý danh sách thiết bị chuẩn
    initClockTable();

    // Migration an toàn: thêm cột mới cho DB cũ đã tồn tại từ trước (bỏ qua lỗi nếu cột đã có)
    db.run(`ALTER TABLE EQUIPMENT_TEMPLATES ADD COLUMN EQUIPMENT_ID TEXT`, () => {});
    db.run(`ALTER TABLE TEMPLATE_POINTS ADD COLUMN AS_FOUND_VALUE TEXT`, () => {});
    db.run(`ALTER TABLE TEMPLATE_POINTS ADD COLUMN STANDARD_EQUIPMENT TEXT`, () => {});
    db.run(`ALTER TABLE CALIBRATION_POINTS ADD COLUMN REF_EQUIPMENT TEXT`, () => {});
    db.run(`ALTER TABLE CALIBRATION_POINTS ADD COLUMN STANDARD_EQUIPMENT TEXT`, () => {}); // Bổ sung cột đồng bộ theo Yêu cầu số 4

    // Migration bảng CUSTOMERS
    db.run(`ALTER TABLE CUSTOMERS ADD COLUMN BILLING_ADDRESS TEXT`, () => {});
    db.run(`ALTER TABLE CUSTOMERS ADD COLUMN CONTACT TEXT`,         () => {});
    db.run(`ALTER TABLE CUSTOMERS ADD COLUMN TAX TEXT`,             () => {});
    db.run(`ALTER TABLE CUSTOMERS ADD COLUMN EMAIL TEXT`,           () => {});
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

// ================= YÊU CẦU 1: API CRUD CHO BẢNG CLOCK (THIẾT BỊ CHUẨN) =================

// Lấy danh sách thiết bị chuẩn (Phục vụ Yêu cầu 2 & Yêu cầu 3 tại frontend)
app.get('/api/clock', (req, res) => {
    db.all("SELECT * FROM CLOCK ORDER BY ID ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

// ============== TÌM KIẾM THIẾT BỊ CHUẨN KIỂU GỢI Ý TỨC THỜI (như thanh search YouTube) ==============
// Dùng để cắm vào BẤT KỲ ô input nào cần CHỌN một thiết bị chuẩn đã lưu trong CLOCK — ví dụ
// khi nhập điểm hiệu chuẩn cho một "thiết bị" (databasequipment.html) và cần chọn xem thiết bị
// chuẩn nào đã dùng để hiệu chuẩn nó. Gõ tới đâu, gợi ý hiện tới đó.
// Khớp theo: Mã (ID/CODE), Tên, Hãng sản xuất, Model, Số Serial, Key nội bộ.
// Trả kết quả ưu tiên: khớp tuyệt đối > khớp ở đầu chuỗi > khớp chứa ở bất kỳ vị trí nào.
app.get('/api/clock/search', (req, res) => {
    const q = (req.query.q || '').toString().trim();

    if (!q) {
        // Chưa gõ gì -> gợi ý sẵn một danh sách rút gọn (giống YouTube hiện gợi ý phổ biến khi ô search trống)
        return db.all("SELECT * FROM CLOCK ORDER BY NAME ASC LIMIT 10", [], (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json(rows);
        });
    }

    const contains = `%${q}%`;
    const startsWith = `${q}%`;

    const sql = `
        SELECT *,
            CASE
                WHEN UPPER(ID) = UPPER(?) OR UPPER(NAME) = UPPER(?) THEN 0
                WHEN UPPER(ID) LIKE UPPER(?) OR UPPER(NAME) LIKE UPPER(?) THEN 1
                ELSE 2
            END AS RELEVANCE
        FROM CLOCK
        WHERE UPPER(ID) LIKE UPPER(?)
           OR UPPER(NAME) LIKE UPPER(?)
           OR UPPER(MANUFACTURER) LIKE UPPER(?)
           OR UPPER(MODEL) LIKE UPPER(?)
           OR UPPER(SERIAL_NUMBER) LIKE UPPER(?)
           OR UPPER(KEY_FIELD) LIKE UPPER(?)
        ORDER BY RELEVANCE ASC, NAME ASC
        LIMIT 15
    `;

    db.all(sql, [
        q, q, startsWith, startsWith,
        contains, contains, contains, contains, contains, contains
    ], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

// Thêm mới thiết bị chuẩn vào bảng CLOCK (route mà form "Add New Standard Equipment" của equipment.html gọi)
app.post('/api/clock/add', (req, res) => {
    const b = req.body || {};
    const id = (b.EQUIPMENT_ID || b.id || b.ID || '').toString().trim();
    const name = (b.NAME || b.name || '').toString().trim();

    if (!id || !name) {
        return res.status(400).json({ success: false, message: "Thiếu Mã thiết bị (ID) hoặc Tên thiết bị chuẩn!" });
    }

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
        id,
        b.KEY_FIELD || b.key_field || '',
        name,
        b.MANUFACTURER || b.manufacturer || '',
        b.MODEL || b.model || '',
        b.SERIAL_NUMBER || b.serial_number || '',
        b.GCN || b.gcn || '',
        b.LINK || b.link || '',
        b.CAL_DATE || b.cal_date || '',
        b.VALIDITY || b.validity || '1900-12-31',
        b.TYPE || b.type || 'standard'
    ], function(err) {
        stmt.finalize();
        if (err) return res.status(500).json({ success: false, error: err.message });

        logActivity("Hệ thống / KTV", "CREATE", "CLOCK", id, `Thêm mới thiết bị chuẩn: ${name}`);
        res.json({ success: true, message: "Thêm mới thiết bị chuẩn thành công!" });
    });
});

// Thêm mới hoặc Cập nhật thiết bị chuẩn vào bảng CLOCK (giữ tương thích các nơi gọi route cũ)
app.post('/api/clock', (req, res) => {
    const b = req.body || {};
    const id = b.id || b.ID || b.EQUIPMENT_ID;
    const name = b.name || b.NAME;

    if (!id || !name) {
        return res.status(400).json({ success: false, message: "Thiếu mã định danh (ID) hoặc tên thiết bị!" });
    }

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
        id,
        b.key_field || b.KEY_FIELD || '',
        name,
        b.manufacturer || b.MANUFACTURER || '',
        b.model || b.MODEL || '',
        b.serial_number || b.SERIAL_NUMBER || '',
        b.gcn || b.GCN || '',
        b.link || b.LINK || '',
        b.cal_date || b.CAL_DATE || '',
        b.validity || b.VALIDITY || '',
        b.type || b.TYPE || 'standard'
    ], function(err) {
        stmt.finalize();
        if (err) return res.status(500).json({ success: false, error: err.message });

        logActivity("Hệ thống / KTV", "UPDATE", "CLOCK", id, `Cập nhật thiết bị chuẩn trong bảng CLOCK: ${name}`);
        res.json({ success: true, message: "Lưu thông tin thiết bị chuẩn thành công!" });
    });
});

// Thêm API import hàng loạt dữ liệu từ equipmentData vào bảng CLOCK
app.post('/api/clock/bulk', (req, res) => {
    const items = req.body; // Mảng các đối tượng thiết bị
    if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: "Dữ liệu gửi lên không phải là mảng!" });
    }

    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        items.forEach(item => {
            // Mapping: ID = code (nếu trống dùng stt)
            const finalId = item.code || `EQ-${item.stt}`;
            const nameLower = (item.name || '').toLowerCase();
            const type = (nameLower.includes('nhiệt') || nameLower.includes('temp')) ? 'temperature' : 'standard';
            stmt.run([
                finalId, item.key || '', item.name || '', item.nsx || '', item.model || '',
                item.serial || '', item.gcn || '', item.lienKet || '', item.calDate || '',
                item.nextDate || '', type
            ]);
        });

        stmt.finalize((err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            logActivity("Hệ thống", "IMPORT", "CLOCK", "ALL", `Đã import hàng loạt ${items.length} thiết bị vào bảng CLOCK`);
            res.json({ success: true, message: `Đã đồng bộ ${items.length} thiết bị vào Database thành công!` });
        });
    });
});

// Xóa thiết bị chuẩn khỏi bảng CLOCK
app.delete('/api/clock/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM CLOCK WHERE ID = ?", [id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        logActivity("Quản trị viên", "DELETE", "CLOCK", id, `Đã xóa thiết bị chuẩn ID: ${id}`);
        res.json({ success: true, message: "Xóa thiết bị chuẩn thành công!" });
    });
});


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
        db.get("SELECT ID FROM PROJECTS WHERE ID LIKE 'PRJ-%' ORDER BY CAST(SUBSTR(ID, 5) AS INTEGER) DESC LIMIT 1", (err, row) => {
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

        db.all("SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [certNo], (err, points) => {
            db.all("SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ?", [certNo], (err, standards) => {
                res.json({ cert, points, standards });
            });
        });
    });
});

app.post('/api/calibration/save', (req, res) => {
    const data = req.body;
    const currentWorker = req.body.currentUser || "Hệ thống / KTV"; 

    logActivity(currentWorker, "UPDATE", "CERTIFICATES", data.certNo, `Cập nhật số liệu đo...`);
    db.serialize(() => {
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
        
        db.run("DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ?", [data.certNo]);
        db.run("DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [data.certNo], (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            const pointStmt = db.prepare(`
                INSERT INTO CALIBRATION_POINTS 
                (CERT_NO, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, REF_EQUIPMENT, STANDARD_EQUIPMENT) 
                VALUES (?,?,?,?,?,?,?,?,?)
            `);
            
            if (data.points && Array.from(data.points).length > 0) {
                data.points.forEach(p => {
                    // Đảm bảo đồng bộ lưu cả hai trường tương đương phòng ngừa
                    const refEqValue = p.refEq || p.standardEquipment || p.refEquipment || '';
                    pointStmt.run(data.certNo, p.parameterName, p.calPoint, p.asFoundValue, p.uncertainty, p.tolerance, p.conformity, refEqValue, refEqValue);
                });
            }
            
            pointStmt.finalize((finalErr) => {
                if (finalErr) return res.status(500).json({ success: false, error: finalErr.message });
                
                logActivity(
                    currentWorker, 
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

function getEquipmentTemplates(res) {
    db.all("SELECT * FROM EQUIPMENT_TEMPLATES", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        if (rows.length === 0) return res.json([]);

        const fetchPoints = rows.map(template => {
            return new Promise((resolve) => {
                db.all("SELECT * FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ? ORDER BY ID ASC", [template.NAME], (err, points) => {
                    template.formPoints = points || [];
                    resolve(template);
                });
            });
        });

        Promise.all(fetchPoints).then(results => res.json(results));
    });
}

app.get('/api/equipment-templates', (req, res) => {
    getEquipmentTemplates(res);
});

app.get('/api/equipment', (req, res) => {
    getEquipmentTemplates(res);
});

app.post('/api/equipment', (req, res) => {
    try {
        const { equipment_id, standard_name, manufacturer, due_date, points } = req.body;

        if (!equipment_id || !standard_name) {
            return res.status(400).json({ success: false, message: "Thiếu mã nhận diện hoặc tên thiết bị chuẩn!" });
        }

        // Lưu vào bảng EQUIPMENT_TEMPLATES và TEMPLATE_POINTS (không phải CERTIFICATES)
        db.serialize(() => {
            // Upsert vào EQUIPMENT_TEMPLATES
            const stmtTemplate = db.prepare(`
                INSERT OR REPLACE INTO EQUIPMENT_TEMPLATES (NAME, MANUFACTURER, NEXT_DUE, EQUIPMENT_ID)
                VALUES (?, ?, ?, ?)
            `);

            stmtTemplate.run([standard_name, manufacturer || '', due_date || '', equipment_id], function(err) {
                if (err) {
                    console.error("❌ Lỗi lưu EQUIPMENT_TEMPLATES:", err.message);
                    return res.status(500).json({ success: false, message: "Lỗi ghi dữ liệu: " + err.message });
                }
            });
            stmtTemplate.finalize();

            // Xóa điểm cũ và chèn điểm mới vào TEMPLATE_POINTS
            db.run("DELETE FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ?", [standard_name], (err) => {
                if (err) {
                    console.error("❌ Lỗi xóa TEMPLATE_POINTS cũ:", err.message);
                }

                if (points && points.length > 0) {
                    const stmtPoint = db.prepare(`
                        INSERT INTO TEMPLATE_POINTS (TEMPLATE_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, STANDARD_EQUIPMENT)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `);

                    points.forEach(p => {
                        stmtPoint.run([
                            standard_name,
                            p.parameter || p.parameterName || '',
                            p.value || p.calPoint || '',
                            p.asFoundValue || '',
                            p.uncertainty || '',
                            p.tolerance || '',
                            p.conformity || '',
                            p.standardEquipment || ''
                        ]);
                    });

                    stmtPoint.finalize((finalErr) => {
                        if (finalErr) {
                            console.error("❌ Lỗi lưu TEMPLATE_POINTS:", finalErr.message);
                            return res.status(500).json({ success: false, message: "Lỗi lưu điểm: " + finalErr.message });
                        }

                        logActivity("Hệ thống / KTV", "UPDATE", "EQUIPMENT_TEMPLATES", equipment_id, `Lưu mẫu thiết bị: ${standard_name}`);
                        return res.json({ 
                            success: true, 
                            message: `Thiết bị chuẩn "${standard_name}" đã được lưu thành công!` 
                        });
                    });
                } else {
                    logActivity("Hệ thống / KTV", "UPDATE", "EQUIPMENT_TEMPLATES", equipment_id, `Lưu mẫu thiết bị: ${standard_name}`);
                    return res.json({ 
                        success: true, 
                        message: `Thiết bị chuẩn "${standard_name}" đã được lưu thành công!` 
                    });
                }
            });
        });

    } catch (criticalServerError) {
        console.error("🔥 CRITICAL API SERVER ERROR:", criticalServerError);
        return res.status(500).json({ success: false, message: "Lỗi xử lý API nội bộ.", error: criticalServerError.message });
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

// ================= API QUẢN LÝ KHÁCH HÀNG (CUSTOMERS) =================

app.get('/api/customers', (req, res) => {
    db.all("SELECT * FROM CUSTOMERS ORDER BY ID DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

app.post('/api/customers', (req, res) => {
    let { id, name, company, phone, tax, email, billing_address, contact, note } = req.body;

    if (!name || !company || !phone) {
        return res.status(400).json({ 
            success: false, 
            error: "Thiếu thông tin bắt buộc: Tên đại diện, Công ty, Số điện thoại" 
        });
    }

    const executeInsert = (finalId) => {
        const isNew = (!id);
        const action = isNew ? "CREATE" : "UPDATE";
        const desc = isNew 
            ? `Thêm mới đối tác: "${name.trim()}" (${company.trim()})` 
            : `Cập nhật thông tin đối tác: "${name.trim()}" (${finalId})`;

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO CUSTOMERS 
            (ID, NAME, COMPANY, PHONE, TAX, EMAIL, BILLING_ADDRESS, CONTACT, NOTE) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
            finalId, name.trim(), company.trim(), phone.trim(), (tax || '').trim(), 
            (email || '').trim(), (billing_address || '').trim(), (contact || '').trim(), (note || '').trim()
        ], function(err) {
            stmt.finalize(); 
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            logActivity("Hệ thống / KTV", action, "CUSTOMERS", finalId, desc);
            return res.json({ 
                success: true, 
                id: finalId,
                message: isNew ? "Thêm khách hàng thành công" : "Cập nhật thành công"
            });
        });
    };

    if (!id) {
        db.get("SELECT ID FROM CUSTOMERS WHERE ID LIKE 'CUST-%' ORDER BY CAST(SUBSTR(ID, 6) AS INTEGER) DESC LIMIT 1", (err, row) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            let nextNum = 1;
            if (row && row.ID) {
                const match = row.ID.match(/CUST-(\d+)/);
                if (match) nextNum = parseInt(match[1]) + 1;
            }
            const nextId = `CUST-${String(nextNum).padStart(6, '0')}`;
            executeInsert(nextId);
        });
    } else {
        executeInsert(id);
    }
});

app.delete('/api/customers/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT NAME, COMPANY FROM CUSTOMERS WHERE ID = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        const info = row ? `${row.NAME || ''} - ${row.COMPANY || ''}` : id;

        db.run("DELETE FROM CUSTOMERS WHERE ID = ?", [id], function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (this.changes === 0) return res.status(404).json({ success: false, error: "Không tìm thấy khách hàng" });

            logActivity("Quản trị viên", "DELETE", "CUSTOMERS", id, `Đã xóa hồ sơ: ${info}`);
            res.json({ success: true, message: `Đã xóa thành công khách hàng ${id}` });
        });
    });
});

// API lấy lịch sử hệ thống & Thống kê
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

// Tạo thư mục static nếu chưa tồn tại
const staticDir = path.join(__dirname, 'static');
if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true });

// ================= YÊU CẦU 4: XUẤT FILE PDF & ĐỒNG BỘ CỘT STANDARD_EQUIPMENT =================
app.post('/api/calibration/export-pdf', (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) {
        return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });
    }

    const scriptPath = path.join(__dirname, 'generate_pdf.js');

    db.serialize(() => {
        const certStmt = db.prepare(`
            INSERT OR REPLACE INTO CERTIFICATES 
            (CERT_NO, INSTRUMENT_NAME, MANUFACTURER, MODEL, EQUIPMENT_ID, SERIAL_NUMBER,
             CUSTOMER_NAME, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `);
        certStmt.run([
            cert_no, data.instrumentName || data.instrument_name || '', data.manufacturer || '', data.model || '',
            data.equipmentId || data.equipment_id || '', data.serialNumber || data.serial_number || '',
            data.customerName || data.customer_name || '', data.calDate || data.cal_date || '', data.reCalDate || data.re_cal_date || '',
            data.procedure || '', data.refStandard || data.ref_standard || '', data.tempEnv || data.temp_env || '',
            data.humiEnv || data.humi_env || '', data.headOfLab || data.head_of_lab || '', data.director || ''
        ]);
        certStmt.finalize();

        db.run("DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [cert_no]);
        db.run("DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ?", [cert_no]);

        const points = data.points || [];
        if (points.length > 0) {
            // YÊU CẦU 4: Đảm bảo điền dữ liệu đồng bộ vào STANDARD_EQUIPMENT
            const ptStmt = db.prepare(`
                INSERT INTO CALIBRATION_POINTS
                (CERT_NO, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, REF_EQUIPMENT, STANDARD_EQUIPMENT)
                VALUES (?,?,?,?,?,?,?,?,?)
            `);
            points.forEach(p => {
                const standardVal = p.refEq || p.standardEquipment || p.standard_equipment || '';
                ptStmt.run([
                    cert_no, p.parameterName || p.param || '', p.calPoint || p.point || '', p.asFoundValue || p.found || '',
                    p.uncertainty || p.unc || '', p.tolerance || p.tol || '', p.conformity || p.conf || '', standardVal, standardVal
                ]);
            });
            ptStmt.finalize();
        }

        const runExec = () => {
            exec(`node "${scriptPath}" "${cert_no}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Lỗi thực thi generate_pdf.js: ${error.message}`);
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
            stdStmt.finalize((err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                runExec();
            });
        } else {
            db.run("SELECT 1", [], () => runExec());
        }
    });
});

// KHỞI CHẠY SERVER
app.listen(port, () => {
    console.log(`[LabMaster Enterprise OS] Backend API đang chạy mượt mà tại cổng: http://localhost:${port}`);
});

// API xử lý đăng nhập
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM USERS WHERE USERNAME = ? AND PASSWORD = ?", [username, password], (err, user) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!user) return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
        
        res.json({
            success: true,
            user: { username: user.USERNAME, fullName: user.FULL_NAME, role: user.ROLE }
        });
    });
});

app.get('/api/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const sql = `
        SELECT p.*, e.NAME as EQUIPMENT_NAME 
        FROM PROJECTS p
        LEFT JOIN EQUIPMENT_TEMPLATES e ON p.ID = e.EQUIPMENT_ID
        WHERE p.ID = ?
    `;
    db.get(sql, [projectId], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: "Không tìm thấy dự án!" });
        res.json({ success: true, data: row });
    });
});