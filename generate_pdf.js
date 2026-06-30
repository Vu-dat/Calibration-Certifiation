'use strict';

/**
 * generate_pdf.js — Tạo Giấy Chứng Nhận Hiệu Chuẩn với bố cục giống file Word
 * Kết nối trực tiếp cơ sở dữ liệu SQLite, đọc đúng schema thực tế.
 * Sử dụng: node generate_pdf.js <CERT_NO>
 */

const fs          = require('fs');
const path        = require('path');
const PDFDocument = require('pdfkit');
const QRCode      = require('qrcode');
const sqlite3     = require('sqlite3').verbose();

// ─────────────────────── KIỂM TRA CLI ───────────────────────
const certNo = process.argv[2];
const downloadUrl = process.argv[3] || '';

if (!certNo) {
    console.error('Lỗi: Vui lòng cung cấp mã số chứng nhận. Ví dụ: node generate_pdf.js 328344');
    process.exit(1);
}

// ─────────────────────── CẤU HÌNH ĐƯỜNG DẪN ───────────────────────
const BASE_DIR   = __dirname;
const DB_PATH    = path.join(BASE_DIR, 'labmaster_enterprise.db');
const STATIC_DIR = path.join(BASE_DIR, 'static');

if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });

const SAFE_NAME   = certNo.replace(/[^a-zA-Z0-9]/g, '_');
const OUTPUT_FILE = path.join(STATIC_DIR, `GCN_${SAFE_NAME}.pdf`);

// ─────────────────────── CẤU HÌNH FONT (SỬA LỖI TIẾNG VIỆT) ───────────────────────
const fontSearchPaths = {
    regular: [
        path.join(BASE_DIR, 'arial.ttf'),
        'C:\\Windows\\Fonts\\arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
    ],
    bold: [
        path.join(BASE_DIR, 'arial-bold.ttf'),
        path.join(BASE_DIR, 'arialbd.ttf'),
        'C:\\Windows\\Fonts\\arialbd.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
    ]
};

function findFirstExistingPath(paths) {
    for (const p of paths) {
        try {
            if (fs.existsSync(p)) return p;
        } catch (e) { continue; }
    }
    return null;
}

const FINAL_FONT_REGULAR_PATH = findFirstExistingPath(fontSearchPaths.regular);
const FINAL_FONT_BOLD_PATH    = findFirstExistingPath(fontSearchPaths.bold);

// ─────────────────────── KẾT NỐI DATABASE ───────────────────────
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) { console.error('Không thể kết nối SQLite:', err.message); process.exit(1); }
});

db.run("PRAGMA journal_mode = WAL");
db.configure("busyTimeout", 5000);

function dbGet(sql, params) {
    return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
}
function dbAll(sql, params) {
    return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}

// ─────────────────────── HELPERS ───────────────────────
const FONT_REGULAR = 'ArialCustom';
const FONT_BOLD    = 'ArialCustom-Bold';

function parseDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

function setFont(doc, bold = false) {
    if (bold && FINAL_FONT_BOLD_PATH) {
        try { doc.font(FONT_BOLD); } catch (e) { doc.font('Helvetica-Bold'); }
    } else if (!bold && FINAL_FONT_REGULAR_PATH) {
        try { doc.font(FONT_REGULAR); } catch (e) { doc.font('Helvetica'); }
    } else {
        if (!FINAL_FONT_REGULAR_PATH) {
            console.error("CRITICAL WARNING: Không tìm thấy font hỗ trợ Tiếng Việt (Arial). PDF sẽ bị lỗi hiển thị!");
        }
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
    }
}

// ─────────────────────── BẢNG HỖ TRỢ ───────────────────────

/**
 * Vẽ bảng đơn giản: [
 *   { text: 'Header 1', bold: true, width: 150 },
 *   ...
 * ],
 * data: [
 *   [cell1, cell2, ...],
 *   ...
 * ]
 */
function drawTable(doc, headers, rows, options = {}) {
    const startX = options.startX || 45;
    const startY = options.startY || doc.y;
    const rowHeight = options.rowHeight || 25;
    const borderColor = options.borderColor || '#000000';
    const headerBgColor = options.headerBgColor || '#e6f7f7';
    
    let currentY = startY;
    
    // Calculate column widths
    const pageWidth = 505;
    const colWidths = headers.map((h, i) => h.width || (pageWidth / headers.length));
    
    // Draw header
    doc.lineWidth(0.5).strokeColor(borderColor);
    
    let currentX = startX;
    headers.forEach((header, i) => {
        // Header background
        doc.rect(currentX, currentY, colWidths[i], rowHeight).fill(headerBgColor);
        doc.rect(currentX, currentY, colWidths[i], rowHeight).stroke();
        
        // Header text
        setFont(doc, true);            doc.fontSize(header.size || 9).fillColor('#004d4d').text(
            header.text,
            currentX + 3,
            currentY + 5,
            { width: colWidths[i] - 6, align: header.align || 'center' }
        );
        
        currentX += colWidths[i];
    });
    
    currentY += rowHeight;
    
    // Draw rows
    rows.forEach((row) => {
        currentX = startX;
        row.forEach((cell, i) => {
            // Cell border
            doc.rect(currentX, currentY, colWidths[i], rowHeight).stroke();
            
            // Cell text
            setFont(doc, false);
            doc.fontSize(cell.size || 8.5).fillColor('#1a1a1a').text(
                String(cell.text || ''),
                currentX + 3,
                currentY + 5,
                { width: colWidths[i] - 6, align: cell.align || 'center' }
            );
            
            currentX += colWidths[i];
        });
        
        currentY += rowHeight;
    });
    
    return currentY;
}

// ─────────────────────── LUỒNG CHÍNH ───────────────────────
async function main() {
    try {
        // Sinh QR code từ URL tải file (nếu có)
        let qrBuffer = null;
        if (downloadUrl) {
            try {
                qrBuffer = await QRCode.toBuffer(downloadUrl, {
                    width: 120,
                    margin: 1,
                    color: { dark: '#004d4d', light: '#ffffff' }
                });
                console.log(`[QR] Đã sinh QR code: ${downloadUrl}`);
            } catch (e) {
                console.warn('Không thể sinh QR code:', e.message);
            }
        }

        // 1. Lấy thông tin Giấy Chứng Nhận từ DB
        const cert = await dbGet(`SELECT * FROM CERTIFICATES WHERE CERT_NO = ?`, [certNo]);

        if (!cert) {
            console.error(`Lỗi: Không tìm thấy dữ liệu cho mã [${certNo}] trong bảng CERTIFICATES.`);
            db.close(); process.exit(1);
        }

        // 2. Lấy danh sách điểm đo
        const points = await dbAll(
            `SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC`, [certNo]
        );

        // 3. Lấy thiết bị chuẩn sử dụng
        const standards = await dbAll(
            `SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC`, [certNo]
        );

        // ─────────────────────── KHỞI TẠO PDF ───────────────────────
        const doc = new PDFDocument({ size: 'A4', margins: { top: 20, bottom: 20, left: 20, right: 20 } });
        const writeStream = fs.createWriteStream(OUTPUT_FILE);
        doc.pipe(writeStream);

        try {
            if (FINAL_FONT_REGULAR_PATH) doc.registerFont(FONT_REGULAR, FINAL_FONT_REGULAR_PATH);
            if (FINAL_FONT_BOLD_PATH)    doc.registerFont(FONT_BOLD,    FINAL_FONT_BOLD_PATH);
        } catch (err) {
            console.error("Lỗi khi đăng ký font TrueType:", err.message);
        }

        // ═════════════════════════════════════════════════════════════════
        // PHẦN 1: TIÊU ĐỀ VÀ QR CODE
        // ═════════════════════════════════════════════════════════════════
        if (qrBuffer) {
            doc.image(qrBuffer, 485, 20, { width: 50, height: 50 });
        }

        setFont(doc, true);
        doc.fontSize(14).fillColor('#004d4d').text('GIẤY CHỨNG NHẬN HIỆU CHUẨN', 20, 20, { align: 'center', width: 515 });
        doc.moveDown(0.3);
        
        setFont(doc, false);
        doc.fontSize(9).fillColor('#555555').text('CALIBRATION CERTIFICATE', 20, doc.y, { align: 'center', width: 515 });
        doc.moveDown(0.5);

        // ═════════════════════════════════════════════════════════════════
        // PHẦN 2: BẢNG THÔNG TIN (2 CỘT)
        // ═════════════════════════════════════════════════════════════════
        const infoData = [
            [{ text: '1. Khách hàng:\nCustomer' }, { text: cert.CUSTOMER || '' }],
            [{ text: '2. Tên thiết bị:\nInstrument' }, { text: cert.INSTRUMENT_NAME || '' }],
            [{ text: '3. Nhà sản xuất:\nManufacturer' }, { text: cert.MANUFACTURER || '' }],
            [{ text: '4. Model/Series:\nModel/Series' }, { text: cert.MODEL || '' }],
            [{ text: '5. Serial No:\nSerial No' }, { text: cert.SERIAL_NO || '' }],
            [{ text: '6. Mã hiệu chuẩn:\nCalibration No' }, { text: certNo }],
            [{ text: '7. Ngày hiệu chuẩn:\nCalibration Date' }, { text: parseDate(cert.CALIBRATION_DATE || '') }],
            [{ text: '8. Ngày hết hạn:\nDue Date' }, { text: parseDate(cert.DUE_DATE || '') }],
            [{ text: '9. Điều kiện môi trường:\nEnvironmental Conditions' }, { text: cert.ENVIRONMENTAL_CONDITIONS || '' }],
            [{ text: '10. Tiêu chuẩn áp dụng:\nStandard Applied' }, { text: cert.STANDARD_APPLIED || '' }],
        ];

        const infoTable = drawTable(doc, 
            [
                { text: 'Mục / Item', width: 200, bold: true },
                { text: 'Nội dung / Content', width: 305, bold: true }
            ],
            infoData.map(row => [
                { text: row[0].text, size: 8, align: 'left' },
                { text: row[1].text, size: 8.5, align: 'left' }
            ]),
            {
                startX: 20,
                startY: doc.y,
                rowHeight: 22,
                borderColor: '#b8b5ae',
                headerBgColor: '#e6f7f7'
            }
        );

        doc.y = infoTable + 10;

        // ═════════════════════════════════════════════════════════════════
        // PHẦN 3: BẢNG KẾT QUẢ ĐO (6 CỘT)
        // ═════════════════════════════════════════════════════════════════
        setFont(doc, true);
        doc.fontSize(10).fillColor('#004d4d').text('KẾT QUẢ HIỆU CHUẨN / CALIBRATION RESULTS', 20, doc.y, { align: 'left' });
        doc.moveDown(0.3);

        // Prepare measurement table headers
        const measurementHeaders = [
            { text: 'Thông số\nParameter', width: 100 },
            { text: 'Giá trị đo được\nAs found value', width: 85 },
            { text: 'ĐKĐBĐ (±)\nUncertainty', width: 80 },
            { text: 'Giá trị tham chiếu\nReference Value', width: 90 },
            { text: 'Dung sai\nTolerance', width: 75 },
            { text: 'Ghi chú\nRemark', width: 75 }
        ];

        // Prepare measurement data
        const measurementData = points.map(p => [
            { text: p.PARAMETER_NAME || p.parameter_name || '–', size: 8.5, align: 'left' },
            { text: String(p.AS_FOUND_VALUE || p.as_found_value || '–'), size: 8.5, align: 'center' },
            { text: String(p.UNCERTAINTY || p.uncertainty || '–'), size: 8.5, align: 'center' },
            { text: String(p.REFERENCE_VALUE || '–'), size: 8.5, align: 'center' },
            { text: String(p.TOLERANCE || p.tolerance || '–'), size: 8.5, align: 'center' },
            { text: String(p.CONFORMITY || p.conformity || '–'), size: 8.5, align: 'center' }
        ]);

        const measurementTableEnd = drawTable(doc,
            measurementHeaders,
            measurementData,
            {
                startX: 20,
                startY: doc.y,
                rowHeight: 25,
                borderColor: '#b8b5ae',
                headerBgColor: '#e6f7f7'
            }
        );

        doc.y = measurementTableEnd + 10;

        // ═════════════════════════════════════════════════════════════════
        // PHẦN 4: BẢNG GHI CHÚ (1 CỘT)
        // ═════════════════════════════════════════════════════════════════
        const noteData = [
            [{ text: cert.NOTES || 'Không có ghi chú / No remarks' }]
        ];

        drawTable(doc,
            [{ text: 'Ghi chú / Notes', width: 505 }],
            noteData,
            {
                startX: 20,
                startY: doc.y,
                rowHeight: 20,
                borderColor: '#b8b5ae',
                headerBgColor: '#e6f7f7'
            }
        );

        // ─────────────────────── FOOTER ───────────────────────
        doc.moveDown(3);
        setFont(doc, false);
        doc.fontSize(7).fillColor('#555555').text('www.labmaster.vn  |  Textile – Footwear – Children Products Safety Tester', 20, 750, { align: 'center', width: 535 });

        // Kết thúc
        doc.end();
        writeStream.on('finish', () => {
            console.log(`[SUCCESS] Đã xuất: GCN_${SAFE_NAME}.pdf`);
            db.close();
            process.exit(0);
        });

    } catch (err) {
        console.error('LỖI CRITICAL KHI SINH PDF:', err);
        db.close();
        process.exit(1);
    }
}

main();