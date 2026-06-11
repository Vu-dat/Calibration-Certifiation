'use strict';

/**
 * generate_pdf.js — Tạo Giấy Chứng Nhận Hiệu Chuẩn Động 100%
 * Kết nối trực tiếp cơ sở dữ liệu SQLite, đọc đúng schema thực tế.
 * Sử dụng: node generate_pdf.js <CERT_NO>
 */

const fs          = require('fs');
const path        = require('path');
const PDFDocument = require('pdfkit');
const sqlite3     = require('sqlite3').verbose();

// ─────────────────────── KIỂM TRA CLI ───────────────────────
const certNo = process.argv[2];
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
// Chiến lược tìm kiếm font: Ưu tiên local -> Windows System -> Linux System
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

function dbGet(sql, params) {
    return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
}
function dbAll(sql, params) {
    return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}

// ─────────────────────── HELPERS ───────────────────────
// Tên alias đăng ký với PDFKit — dùng nhất quán ở mọi nơi
const FONT_REGULAR = 'ArialCustom';
const FONT_BOLD    = 'ArialCustom-Bold';

function setFont(doc, bold = false) {
    if (bold && FINAL_FONT_BOLD_PATH) {
        try { doc.font(FONT_BOLD); } catch (e) { doc.font('Helvetica-Bold'); }
    } else if (!bold && FINAL_FONT_REGULAR_PATH) {
        try { doc.font(FONT_REGULAR); } catch (e) { doc.font('Helvetica'); }
    } else {
        if (!FINAL_FONT_REGULAR_PATH) {
            console.error("CRITICAL WARNING: Không tìm thấy font hỗ trợ Tiếng Việt (Arial). PDF sẽ bị lỗi hiển thị!");
        }
        // Fallback sang font mặc định (sẽ bị lỗi dấu tiếng Việt nếu rơi vào đây)
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
    }
}

// ─────────────────────── LUỒNG CHÍNH ───────────────────────
async function main() {
    try {
        // 1. Lấy thông tin Giấy Chứng Nhận từ DB (đúng schema CERTIFICATES)
        const cert = await dbGet(`SELECT * FROM CERTIFICATES WHERE CERT_NO = ?`, [certNo]);

        if (!cert) {
            console.error(`Lỗi: Không tìm thấy dữ liệu cho mã [${certNo}] trong bảng CERTIFICATES.`);
            db.close(); process.exit(1);
        }

        // 2. Lấy danh sách điểm đo — đúng schema CALIBRATION_POINTS
        const points = await dbAll(
            `SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC`, [certNo]
        );

        // 3. Lấy thiết bị chuẩn sử dụng — bảng CERTIFICATE_STANDARDS
        const standards = await dbAll(
            `SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC`, [certNo]
        );

        // ─────────────────────── KHỞI TẠO PDF ───────────────────────
        const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 50, left: 45, right: 45 } });
        const writeStream = fs.createWriteStream(OUTPUT_FILE);
        doc.pipe(writeStream);

        // Đăng ký font với alias nhất quán — chỉ đăng ký khi file thực sự tồn tại
        try {
            if (FINAL_FONT_REGULAR_PATH) doc.registerFont(FONT_REGULAR, FINAL_FONT_REGULAR_PATH);
            if (FINAL_FONT_BOLD_PATH)    doc.registerFont(FONT_BOLD,    FINAL_FONT_BOLD_PATH);
        } catch (err) {
            console.error("Lỗi nghiêm trọng khi đăng ký font TrueType:", err.message);
        }

        const C = {
            PRIMARY:       '#007a78',
            PRIMARY_LIGHT: '#e6f7f7',
            BODY:          '#1a1917',
            MUTED:         '#6b6860',
            BORDER:        '#b8b5ae'
        };

        // ─────────────────────── HEADER ───────────────────────
        setFont(doc, true);
        doc.fontSize(16).fillColor(C.PRIMARY).text('GIẤY CHỨNG NHẬN HIỆU CHUẨN', { align: 'center' });
        setFont(doc, false);
        doc.fontSize(11).fillColor(C.MUTED).text('CERTIFICATE OF CALIBRATION', { align: 'center' });
        doc.moveDown(0.6);

        // Số GCN + Ngày tháng dưới tiêu đề
        doc.fontSize(9).fillColor(C.MUTED)
           .text(`Số / No.: ${cert.CERT_NO || certNo}   ·   Ngày HC / Cal. Date: ${cert.CAL_DATE || ''}   ·   HC kế tiếp / Re-cal: ${cert.RE_CAL_DATE || ''}`,
                 { align: 'center' });
        doc.moveDown(1.2);

        // ─────────────────────── THÔNG TIN THIẾT BỊ & KH ───────────────────────
        const renderRow = (label, engLabel, val, startX = 45, labelW = 170, valX = 215, valW = 335) => {
            const y = doc.y;
            setFont(doc, true);
            doc.fontSize(10).fillColor(C.BODY).text(label, startX, y, { width: labelW });
            setFont(doc, false);
            doc.fontSize(8.5).fillColor(C.MUTED).text(engLabel, startX, y + 12, { width: labelW });
            doc.fontSize(10).fillColor(C.BODY).text(`: ${val || '–'}`, valX, y, { width: valW });
            doc.moveDown(0.75);
        };

        renderRow('Tên thiết bị',   'Instrument',    cert.INSTRUMENT_NAME);
        renderRow('Nhà sản xuất',   'Manufacturer',  cert.MANUFACTURER);
        renderRow('Kiểu mẫu',       'Model',         cert.MODEL);
        renderRow('Mã nhận diện',   'Equipment ID',  cert.EQUIPMENT_ID);
        renderRow('Số sê-ri',       'Serial No.',    cert.SERIAL_NUMBER);
        renderRow('Khách hàng',     'Customer',      cert.CUSTOMER_NAME);
        renderRow('Quy trình HC',   'Procedure',     cert.PROCEDURE);
        renderRow('Tiêu chuẩn TK',  'Ref. Standard', cert.REF_STANDARD);
        renderRow('Môi trường',     'Environment',   `Nhiệt độ: ${cert.TEMP_ENV || '–'}   /   Độ ẩm: ${cert.HUMI_ENV || '–'}`);
        doc.moveDown(0.8);

        // ─────────────────────── BẢNG THIẾT BỊ CHUẨN SỬ DỤNG ───────────────────────
        setFont(doc, true);
        doc.fontSize(11).fillColor(C.PRIMARY).text('CHUẨN SỬ DỤNG / STANDARDS USED:', { align: 'center' });
        doc.moveDown(0.4);

        const sx   = 60; // Căn lề trái 60 để bảng nằm giữa trang A4 (595pt)
        const sW   = [170, 80, 135, 90];   // cột: Tên, Mã, Liên kết, Hiệu lực
        const sX   = [sx, sx+170, sx+250, sx+385]; 
        const sRowH = 22;
        let   sY   = doc.y;
        const sTotalW = sW.reduce((a,b)=>a+b, 0);  // 475

        // Header bảng chuẩn
        doc.rect(sx, sY, sTotalW, sRowH).fill(C.PRIMARY_LIGHT);
        doc.lineWidth(0.5).strokeColor(C.BORDER);
        doc.moveTo(sx, sY).lineTo(sx + sTotalW, sY).stroke();

        setFont(doc, true);
        doc.fontSize(8.5).fillColor(C.PRIMARY);
        doc.text('Tên thiết bị chuẩn (Name)',     sX[0]+4, sY+6, { width: sW[0]-4 });
        doc.text('Mã số (ID)',                     sX[1],   sY+6, { width: sW[1], align: 'center' });
        doc.text('Liên kết chuẩn (Traceable)',     sX[2],   sY+6, { width: sW[2], align: 'center' });
        doc.text('Hiệu lực (Due Date)',            sX[3],   sY+6, { width: sW[3], align: 'center' });
        doc.moveTo(sx, sY+sRowH).lineTo(sx+sTotalW, sY+sRowH).stroke();
        sY += sRowH;

        setFont(doc, false);
        doc.fontSize(9).fillColor(C.BODY);

        const stdList = standards.length > 0
            ? standards.map(s => ({ name: s.EQ_NAME, id: s.EQ_CODE, trace: s.LINK, due: s.VALIDITY }))
            : [{ name: '–', id: '–', trace: '–', due: '–' }];

        stdList.forEach(s => {
            doc.text(s.name  || '–', sX[0]+4, sY+6, { width: sW[0]-4 });
            doc.text(s.id    || '–', sX[1],   sY+6, { width: sW[1], align: 'center' });
            doc.text(s.trace || '–', sX[2],   sY+6, { width: sW[2], align: 'center' });
            doc.text(s.due   || '–', sX[3],   sY+6, { width: sW[3], align: 'center' });
            doc.moveTo(sx, sY+sRowH).lineTo(sx+sTotalW, sY+sRowH).stroke();
            sY += sRowH;
        });
        doc.moveDown(1.5);

        // ─────────────────────── BẢNG KẾT QUẢ HIỆU CHUẨN ───────────────────────
        setFont(doc, true);
        doc.fontSize(11).fillColor(C.PRIMARY).text('KẾT QUẢ HIỆU CHUẨN / CALIBRATION RESULTS:', { align: 'center' });
        doc.moveDown(0.4);

        const rx   = 60; // Căn lề trái đồng bộ với bảng trên
        // Điều chỉnh lại độ rộng các cột để tránh lệch phải và vỡ chữ Conformity
        const rW6  = [155, 60, 90, 60, 55, 55]; // Tổng vẫn là 475
        const rX   = [rx, rx+155, rx+215, rx+305, rx+365, rx+420];
        const rRowH = 24;
        let   rY   = doc.y;

        // Header bảng kết quả
        doc.rect(rx, rY, 475, rRowH).fill(C.PRIMARY_LIGHT);
        doc.lineWidth(0.5).strokeColor(C.BORDER);
        doc.moveTo(rx, rY).lineTo(rx+475, rY).stroke();

        setFont(doc, true);
        doc.fontSize(8.5).fillColor(C.PRIMARY);
        doc.text('Thông số (Parameter)',      rX[0]+4, rY+7, { width: rW6[0]-4 });
        doc.text('Điểm HC\nCal. Point',       rX[1],   rY+3, { width: rW6[1], align: 'center' });
        doc.text('Giá trị đo\nAs Found',      rX[2],   rY+3, { width: rW6[2], align: 'center' });
        doc.text('KĐBĐ ±\nUncert.',           rX[3],   rY+3, { width: rW6[3], align: 'center' });
        doc.text('Dung sai\nTolerance',        rX[4],   rY+3, { width: rW6[4], align: 'center' });
        doc.text('Phù hợp\nConform.',          rX[5],   rY+3, { width: rW6[5], align: 'center' });
        doc.moveTo(rx, rY+rRowH).lineTo(rx+475, rY+rRowH).stroke();
        rY += rRowH;

        setFont(doc, false);
        doc.fontSize(9).fillColor(C.BODY);

        if (points.length === 0) {
            doc.text('Chưa có dữ liệu điểm đo cho chứng nhận này.', rx+8, rY+7);
            doc.moveTo(rx, rY+rRowH).lineTo(rx+475, rY+rRowH).stroke();
            rY += rRowH;
        } else {
            for (const p of points) {
                // Ngắt trang tự động
                if (rY > 710) {
                    doc.addPage();
                    rY = 45;
                    doc.lineWidth(0.5).strokeColor(C.BORDER).moveTo(rx, rY).lineTo(rx+475, rY).stroke();
                }

                // Map đúng tên cột schema CALIBRATION_POINTS
                const param    = String(p.PARAMETER_NAME  || p.parameter_name  || '–');
                const calPt    = String(p.CAL_POINT        || p.cal_point        || '–');
                const asFound  = String(p.AS_FOUND_VALUE   || p.as_found_value   || '–');
                const unc      = String(p.UNCERTAINTY      || p.uncertainty      || '–');
                const tol      = String(p.TOLERANCE        || p.tolerance        || '–');
                const conf     = String(p.CONFORMITY       || p.conformity       || '–');

                doc.text(param,   rX[0]+4, rY+7, { width: rW6[0]-4 });
                doc.text(calPt,   rX[1],   rY+7, { width: rW6[1], align: 'center' });
                doc.text(asFound, rX[2],   rY+7, { width: rW6[2], align: 'center' });
                doc.text(unc,     rX[3],   rY+7, { width: rW6[3], align: 'center' });
                doc.text(tol,     rX[4],   rY+7, { width: rW6[4], align: 'center' });
                doc.text(conf,    rX[5],   rY+7, { width: rW6[5], align: 'center' });

                doc.moveTo(rx, rY+rRowH).lineTo(rx+475, rY+rRowH).stroke();
                rY += rRowH;
            }
        }

        // ─────────────────────── KHU VỰC CHỮ KÝ ───────────────────────
        doc.moveDown(2);
        let sigY = doc.y;
        if (sigY > 670) { doc.addPage(); sigY = 45; }

        const sigW = 210, sigBoxH = 75, startX2 = 45;
        const sigRightX = startX2 + sigW + 55;

        // Khung trái — Người soát xét
        doc.rect(startX2, sigY, sigW, sigBoxH).lineWidth(0.5).strokeColor(C.BORDER).stroke();
        doc.rect(startX2, sigY, sigW, 16).fill(C.PRIMARY_LIGHT);
        setFont(doc, true);
        doc.fontSize(8.5).fillColor(C.PRIMARY).text('NGƯỜI SOÁT XÉT / REVIEWED BY', startX2+5, sigY+4, { width: sigW-10, align: 'center' });
        setFont(doc, false);
        doc.fontSize(9).fillColor(C.BODY).text(cert.HEAD_OF_LAB || '', startX2+5, sigY+45, { width: sigW-10, align: 'center' });

        // Khung phải — Giám đốc
        doc.rect(sigRightX, sigY, sigW, sigBoxH).lineWidth(0.5).strokeColor(C.BORDER).stroke();
        doc.rect(sigRightX, sigY, sigW, 16).fill(C.PRIMARY_LIGHT);
        setFont(doc, true);
        doc.fontSize(8.5).fillColor(C.PRIMARY).text('GIÁM ĐỐC / DIRECTOR', sigRightX+5, sigY+4, { width: sigW-10, align: 'center' });
        setFont(doc, false);
        doc.fontSize(9).fillColor(C.BODY).text(cert.DIRECTOR || '', sigRightX+5, sigY+45, { width: sigW-10, align: 'center' });

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
