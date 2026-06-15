const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Kết nối tới Database LabMaster
const db = new sqlite3.Database(path.join(__dirname, 'labmaster_enterprise.db'));

db.serialize(() => {
    console.log("⚡ Đang quét và xóa các dòng dữ liệu lỗi (NULL/Rỗng)...");

    const sql = `
        DELETE FROM CUSTOMERS 
        WHERE NAME IS NULL 
           OR NAME = '' 
           OR COMPANY IS NULL 
           OR COMPANY = ''
    `;

    db.run(sql, function(err) {
        if (err) {
            console.error("❌ Lỗi khi thực thi lệnh xóa:", err.message);
        } else {
            console.log(`✅ Thành công! Đã dọn sạch hoàn toàn ${this.changes} dòng rác dữ liệu.`);
        }
        
        // Đóng kết nối để giải phóng file ngay lập tức
        db.close(() => {
            console.log("🔒 Đã đóng kết nối database an toàn.");
            process.exit(0);
        });
    });
});