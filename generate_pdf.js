const fs = require('fs');
const PDFDocument = require('pdfkit');
const sqlite3 = require('sqlite3').verbose();

const certNo = process.argv[2];
if (!certNo) process.exit(1);

const db = new sqlite3.Database('labmaster_enterprise.db');

db.get("SELECT * FROM CERTIFICATES WHERE CERT_NO = ?", [certNo], (err, certInfo) => {
    if (err || !certInfo) {
        db.close();
        process.exit(1);
    }

    db.all("SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ?", [certNo], (err, points) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const outputDir = './static/certificates';
        
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const pdfPath = `${outputDir}/GCN_${certNo}.pdf`;
        doc.pipe(fs.createWriteStream(pdfPath));

        // Vẽ đường viền khung trang giấy chứng nhận chuẩn chỉnh doanh nghiệp
        doc.rect(25, 25, 545, 792).stroke('#1a365d');

        // TIÊU ĐỀ SONG NGỮ CHUẨN QUỐC TẾ
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#1a365d').text('GIẤY CHỨNG NHẬN HIỆU CHUẨN', { align: 'center' });
        doc.fontSize(12).fillColor('#4a5568').text('CERTIFICATE OF CALIBRATION', { align: 'center' });
        doc.moveDown(1.5);

        // THÔNG TIN CHI TIẾT HÀNH CHÍNH DO NGƯỜI DÙNG NHẬP
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111');
        let currentY = doc.y;
        
        doc.text(`Tên thiết bị (Instrument):`, 45, currentY).font('Helvetica').text(certInfo.INSTRUMENT_NAME, 200, currentY);
        currentY += 18;
        doc.font('Helvetica-Bold').text(`Nhà sản xuất (Manufacturer):`, 45, currentY).font('Helvetica').text(certInfo.MANUFACTURER, 200, currentY);
        currentY += 18;
        doc.font('Helvetica-Bold').text(`Kiểu (Model) / ID:`, 45, currentY).font('Helvetica').text(`${certInfo.MODEL} / ${certInfo.EQUIPMENT_ID}`, 200, currentY);
        currentY += 18;
        doc.font('Helvetica-Bold').text(`Số sản xuất (Serial No.):`, 45, currentY).font('Helvetica').text(certInfo.SERIAL_NUMBER, 200, currentY);
        currentY += 18;
        doc.font('Helvetica-Bold').text(`Khách hàng (Customer):`, 45, currentY).font('Helvetica').text(certInfo.CUSTOMER_NAME, 200, currentY);
        currentY += 18;
        doc.font('Helvetica-Bold').text(`Ngày hiệu chuẩn (Cal Date):`, 45, currentY).font('Helvetica').text(certInfo.CAL_DATE, 200, currentY);
        
        doc.moveDown(2);

        // ĐỔ BẢNG DỮ LIỆU ĐO ĐỘNG MÀ KỸ THUẬT VIÊN ĐÃ NHẬP TRÊN WEB
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a365d').text('KẾT QUẢ HIỆU CHUẨN (CALIBRATION RESULTS):');
        doc.moveDown(0.5);

        let tableTop = doc.y;
        doc.fontSize(9).fillColor('#2d3748');
        doc.text('Thông số (Parameter)', 45, tableTop, { width: 150 });
        doc.text('Điểm Chuẩn', 200, tableTop);
        doc.text('Giá trị đo', 270, tableTop);
        doc.text('Độ KĐBĐ', 340, tableTop);
        doc.text('Dung sai', 410, tableTop);
        doc.text('Phù hợp', 480, tableTop);
        
        doc.moveTo(45, tableTop + 15).lineTo(540, tableTop + 15).stroke('#cbd5e0');
        
        let rowY = tableTop + 22;
        doc.font('Helvetica').fillColor('#111111');
        
        // Vòng lặp in ra toàn bộ số điểm đo người dùng vừa nhập
        points.forEach((row) => {
            doc.text(row.PARAMETER_NAME, 45, rowY, { width: 150 });
            doc.text(row.CAL_POINT.toString(), 200, rowY);
            doc.text(row.AS_FOUND_VALUE.toString(), 270, rowY);
            doc.text(row.UNCERTAINTY.toString(), 340, rowY);
            doc.text(row.TOLERANCE, 410, rowY);
            doc.text(row.CONFORMITY, 480, rowY);
            rowY += 18;
        });

        doc.moveTo(45, rowY).lineTo(540, rowY).stroke('#cbd5e0');
        doc.moveDown(3);

        // KHU VỰC KÝ TÊN XÁC THỰC PHÍA DƯỚI BẢN IN
        let signY = doc.y + 20;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('PHỤ TRÁCH PHÒNG LAB', 50, signY);
        doc.text('GIÁM ĐỐC (DIRECTOR)', 380, signY);
        
        doc.font('Helvetica').text(certInfo.HEAD_OF_LAB, 50, signY + 60);
        doc.text(certInfo.DIRECTOR, 380, signY + 60);

        doc.end();
        db.close();
    });
});