const db = require('./db');

async function main() {
    try {
        console.log('⚡ Đang quét và xóa các dòng dữ liệu lỗi (NULL/Rỗng)...');
        const result = await db`
            DELETE FROM CUSTOMERS 
            WHERE NAME IS NULL 
               OR NAME = '' 
               OR COMPANY IS NULL 
               OR COMPANY = ''
        `;
        console.log('✅ Thành công! Đã dọn sạch hoàn toàn dữ liệu rác.');
    } catch (err) {
        console.error('❌ Lỗi khi thực thi lệnh xóa:', err.message);
    }
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Lỗi nghiêm trọng:', err.message);
    process.exit(1);
});