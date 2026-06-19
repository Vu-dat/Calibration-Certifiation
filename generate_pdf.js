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

// ĐỒNG BỘ CẤU HÌNH VỚI SERVER CHÍNH ĐỂ TRÁNH TRANH CHẤP KHI ĐỌC DỮ LIỆU
db.run("PRAGMA journal_mode = WAL");
db.configure("busyTimeout", 5000);

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

// Format ngày tháng từ YYYY-MM-DD sang DD.MM.YYYY (giống preview)
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
           .text(`Số / No.: ${cert.CERT_NO || certNo}   ·   Ngày HC / Cal. Date: ${parseDate(cert.CAL_DATE || '')}   ·   HC kế tiếp / Re-cal: ${parseDate(cert.RE_CAL_DATE || '')}`,
                 { align: 'center' });
        doc.moveDown(1.2);

        // ─────────────────────── THÔNG TIN THIẾT BỊ & KH ───────────────────────
        const renderRow = (label, engLabel, val, startX = 45, labelW = 105, valX = 155, valW = 395) => {
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

        

        // ─────────────────────── BẢNG KẾT QUẢ HIỆU CHUẨN ───────────────────────
        setFont(doc, true);
        doc.fontSize(11).fillColor(C.PRIMARY).text('16. KẾT QUẢ HIỆU CHUẨN / CALIBRATION RESULTS:', { align: 'center' });
        doc.moveDown(0.4);

        // Tổng chiều rộng khả dụng: A4 = 595pt, lề trái 45, lề phải 45 → 505pt
        // 7 cột: giống hệt preview: Thông số | Điểm HC | Giá trị đo được (gộp) | KĐBĐ | Dung sai | Phù hợp | Thiết bị chuẩn
        const rx   = 45;
        const PAGE_W = 505;
        const rW   = [150, 55, 80, 50, 50, 50, 70]; // 7 cột, tổng = 505
        const rX   = rW.reduce((acc, w, i) => {
            acc.push(i === 0 ? rx : acc[i-1] + rW[i-1]);
            return acc;
        }, []);
        const rRowH = 26;
        let   rY   = doc.y;

        // Header bảng kết quả
        doc.rect(rx, rY, PAGE_W, rRowH).fill(C.PRIMARY_LIGHT);
        doc.lineWidth(0.5).strokeColor(C.BORDER);
        doc.moveTo(rx, rY).lineTo(rx + PAGE_W, rY).stroke();

        setFont(doc, true);
        doc.fontSize(7.5).fillColor(C.PRIMARY);
        doc.text('Thông số (Parameters)',       rX[0]+3, rY+3, { width: rW[0]-3, align: 'left' });
        doc.text('Điểm HC\nCalibration Points',    rX[1],   rY+3, { width: rW[1], align: 'center' });
        doc.text('Giá trị đo được\nAs Found Value', rX[2],   rY+3, { width: rW[2], align: 'center' });
        doc.text('Độ KĐBĐ (±)\nUncertainty',       rX[3],   rY+3, { width: rW[3], align: 'center' });
        doc.text('Dung sai\nTolerance',            rX[4],   rY+3, { width: rW[4], align: 'center' });
        doc.text('Sự phù hợp\nConformity',         rX[5],   rY+3, { width: rW[5], align: 'center' });
        doc.text('Thiết bị chuẩn\nRef. Equipment', rX[6],   rY+3, { width: rW[6], align: 'center' });

        // Vẽ đường kẻ dọc phân cách cột header
        rX.forEach((x, i) => {
            doc.moveTo(x, rY).lineTo(x, rY + rRowH).stroke();
        });
        doc.moveTo(rx + PAGE_W, rY).lineTo(rx + PAGE_W, rY + rRowH).stroke();
        doc.moveTo(rx, rY + rRowH).lineTo(rx + PAGE_W, rY + rRowH).stroke();
        rY += rRowH;

        setFont(doc, false);
        doc.fontSize(8.5).fillColor(C.BODY);

        if (points.length === 0) {
            doc.text('Chưa có dữ liệu điểm đo cho chứng nhận này.', rx + 8, rY + 7);
            doc.moveTo(rx, rY + rRowH).lineTo(rx + PAGE_W, rY + rRowH).stroke();
            rY += rRowH;
        } else {
            // Nhóm theo PARAMETER_NAME để tính rowspan cho in
            const grouped = [];
            let curGroup = null;
            for (const p of points) {
                const pn = p.PARAMETER_NAME || p.parameter_name || '–';
                if (!curGroup || curGroup.paramName !== pn) {
                    curGroup = { paramName: pn, rows: [] };
                    grouped.push(curGroup);
                }
                curGroup.rows.push(p);
            }

            for (const group of grouped) {
                const rowCount = group.rows.length;
                const paramRowH = rRowH * rowCount;

                // Kiểm tra ngắt trang
                if (rY + paramRowH > 750) {
                    doc.addPage();
                    rY = 45;
                    doc.lineWidth(0.5).strokeColor(C.BORDER);
                    doc.moveTo(rx, rY).lineTo(rx + PAGE_W, rY).stroke();
                }

                group.rows.forEach((p, idx) => {
                    // Cột Thông số — chỉ in ở hàng đầu của nhóm
                    if (idx === 0) {
                        setFont(doc, true);
                        doc.fontSize(8.5).fillColor(C.BODY)
                           .text(group.paramName, rX[0]+3, rY+5, { width: rW[0]-6, height: paramRowH-4 });
                        setFont(doc, false);
                        doc.fontSize(8.5).fillColor(C.BODY);
                    }

                    // Các cột dữ liệu — giống preview: gộp 3 lần đo thành 1 cột "As Found Value"
                    const calPt   = String(p.CAL_POINT       || p.cal_point       || '–');
                    const asFound = String(p.AS_FOUND_VALUE  || p.as_found_value  || '–');
                    const unc     = String(p.UNCERTAINTY     || p.uncertainty     || '–');
                    const tol     = String(p.TOLERANCE       || p.tolerance       || '–');
                    const conf    = String(p.CONFORMITY      || p.conformity      || '–');
                    const refEq   = String(p.REF_EQUIPMENT   || p.ref_equipment   || '–');

                    doc.text(calPt, rX[1],   rY+7, { width: rW[1], align: 'center' });
                    doc.text(asFound, rX[2], rY+7, { width: rW[2], align: 'center' });
                    doc.text(unc,   rX[3],   rY+7, { width: rW[3], align: 'center' });
                    doc.text(tol,   rX[4],   rY+7, { width: rW[4], align: 'center' });
                    doc.text(conf,  rX[5],   rY+7, { width: rW[5], align: 'center' });
                    doc.text(refEq, rX[6],   rY+7, { width: rW[6]-4, align: 'center' });

                    // Đường kẻ ngang dưới mỗi hàng con
                    doc.moveTo(rx, rY + rRowH).lineTo(rx + PAGE_W, rY + rRowH).stroke();
                    rY += rRowH;
                });

                // Đường kẻ dọc phân cột — vẽ theo chiều cao cả nhóm
                const groupTop = rY - paramRowH;
                rX.forEach((x) => {
                    doc.moveTo(x, groupTop).lineTo(x, rY).stroke();
                });
                doc.moveTo(rx + PAGE_W, groupTop).lineTo(rx + PAGE_W, rY).stroke();
            }
        }

        // ─────────────────────── SECTION 17: THÔNG TIN KHÁC ───────────────────────
        doc.moveDown(1.5);
        let otherY = doc.y;
        if (otherY > 680) { doc.addPage(); otherY = 45; }

        setFont(doc, true);
        doc.fontSize(11).fillColor(C.PRIMARY).text('17. THÔNG TIN KHÁC / OTHER INFORMATION:', { align: 'center' });
        doc.moveDown(0.8);

        setFont(doc, true);
        doc.fontSize(9).fillColor(C.BODY);
        doc.text('17.1 Độ không đảm bảo đo / Uncertainty:', { align: 'left' });
        setFont(doc, false);
        doc.fontSize(8.5).fillColor(C.BODY);
        doc.text('Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy.', { align: 'left' });
        doc.fontSize(8).fillColor(C.MUTED);
        doc.text('The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.', { align: 'left' });
        doc.moveDown(0.8);

        setFont(doc, true);
        doc.fontSize(9).fillColor(C.BODY);
        doc.text('17.2. Công bố về sự phù hợp / Statements of conformity:', { align: 'left' });
        setFont(doc, false);
        doc.fontSize(8.5).fillColor(C.BODY);
        doc.text('+ A: Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép. Within tolerance.', { align: 'left' });
        doc.text('+ B: Kết quả đo nằm ngoài giới hạn cho phép. Out of tolerance.', { align: 'left' });
        doc.text('+ C: Kết quả đo có thể nằm ngoài giới hạn. Không có kết luận. May be out of tolerance. No conclusion.', { align: 'left' });
        doc.text('+ D: Tiêu chuẩn kỹ thuật không quy định dung sai. No tolerance stated.', { align: 'left' });
        doc.moveDown(1.2);

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

        // ─────────────────────── FOOTER ───────────────────────
        doc.moveDown(2);
        let footerY = doc.y;
        if (footerY > 770) { doc.addPage(); footerY = 45; }
        setFont(doc, false);
        doc.fontSize(7).fillColor(C.MUTED).text('www.labmaster.vn  |  Textile – Footwear – Children Products Safety Tester', 45, footerY + 10, { align: 'center', width: 505 });

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
