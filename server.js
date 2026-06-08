const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 18080;

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// Khởi tạo và kết nối Database SQLite
const db = new sqlite3.Database(path.join(__dirname, 'labmaster_enterprise.db'));

db.serialize(() => {
    // 1. Bảng quản lý tiến độ Dự án (Đồng bộ với project.html)
    db.run(`CREATE TABLE IF NOT EXISTS PROJECTS (
        ID TEXT PRIMARY KEY, 
        TITLE TEXT, 
        TECH TEXT, 
        STATUS TEXT, 
        CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Bảng quản lý thông tin khách hàng hiển thị
    db.run(`CREATE TABLE IF NOT EXISTS CUSTOMERS (
        ID TEXT PRIMARY KEY, NAME TEXT, COMPANY TEXT, PHONE TEXT, TAX TEXT, EMAIL TEXT, ADDRESS TEXT, NOTE TEXT
    )`);

    // 3. Bảng đầu não thông tin chung của Giấy Chứng Nhận
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
});

// ================= API QUẢN LÝ DỰ ÁN (PROJECTS - BỔ SUNG MỚI) =================

// Lấy toàn bộ danh sách dự án hiển thị lên màn hình chính
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM PROJECTS ORDER BY CREATED_AT DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

// Tạo mới hoặc cập nhật một dự án từ thanh tiến độ workspace
app.post('/api/projects', (req, res) => {
    const { id, title, tech, status } = req.body;
    const stmt = db.prepare(`INSERT OR REPLACE INTO PROJECTS (ID, TITLE, TECH, STATUS) VALUES (?, ?, ?, ?)`);
    stmt.run([id, title, tech, status], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, id: id });
    });
    stmt.finalize();
});

// Xóa dự án theo mã ID
app.delete('/api/projects/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM PROJECTS WHERE ID = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});


// ================= API HIỆU CHUẨN & LƯU WORKSPACE DỮ LIỆU =================

// Lấy thông tin chứng nhận cùng các điểm đo chi tiết đổ vào form sửa
app.get('/api/calibration/:certNo', (req, res) => {
    const certNo = req.params.certNo;
    db.get("SELECT * FROM CERTIFICATES WHERE CERT_NO = ?", [certNo], (err, cert) => {
        if (err || !cert) return res.status(404).json({ success: false, message: "Không tìm thấy số GCN" });
        
        db.all("SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [certNo], (err, points) => {
            res.json({ cert, points });
        });
    });
});

// Lưu hoặc Ghi đè cập nhật dữ liệu từ biểu mẫu Lab sang Database SQL
app.post('/api/calibration/save', (req, res) => {
    const data = req.body;
    
    db.serialize(() => {
        // 1. Lưu/Ghi đè thông tin chung giấy chứng nhận trước
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
        
        // 2. XÓA BỎ các điểm đo cũ của số chứng nhận này để chuẩn bị ghi đè dữ liệu mới tinh
        db.run("DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [data.certNo], (err) => {
            if (err) console.error("Lỗi dọn dẹp điểm đo cũ:", err.message);
            
            // 3. Tiến hành chèn hàng loạt điểm đo mới gửi từ giao diện
            const pointStmt = db.prepare(`
                INSERT INTO CALIBRATION_POINTS 
                (CERT_NO, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY) 
                VALUES (?,?,?,?,?,?,?)
            `);
            
            data.points.forEach(p => {
                pointStmt.run(data.certNo, p.parameterName, p.calPoint, p.asFoundValue, p.uncertainty, p.tolerance, p.conformity);
            });
            
            pointStmt.finalize((finalErr) => {
                if (finalErr) {
                    return res.status(500).json({ success: false, error: finalErr.message });
                }
                // CHỈ PHẢN HỒI KHI TẤT CẢ TIẾN TRÌNH SQL ĐÃ CHẠY XONG HOÀN TOÀN TRONG DATABASE
                res.json({ success: true, message: "Dữ liệu hiệu chuẩn đã được ghi nhận vào SQL ổn định!" });
            });
        });
    });
});

// Gọi công cụ thực thi render xuất PDF
app.get('/api/calibration/export-pdf/:certNo', (req, res) => {
    const certNo = req.params.certNo;
    exec(`node generate_pdf.js ${certNo}`, (error) => {
        if (error) return res.status(500).json({ success: false, msg: "Lỗi render PDF hệ thống" });
        res.json({ success: true, pdf_url: `/static/certificates/GCN_${certNo}.pdf` });
    });
});


// ================= API QUẢN LÝ DANH MỤC KHÁCH HÀNG =================

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

// ĐÃ SỬA LỖI BẢO MẬT: Chuyển sang dùng prepared statement ? tránh SQL Injection phá hủy cấu trúc DB
app.delete('/api/customers/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM CUSTOMERS WHERE ID = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});

// KHỞI CHẠY HỆ THỐNG SERVER
app.listen(port, () => {
    console.log(`[LabMaster Enterprise OS] Backend API đang chạy mượt mà tại cổng: http://localhost:${port}`);
});