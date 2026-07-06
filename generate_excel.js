'use strict';

/**
 * generate_excel.js — Tạo file Excel (.xlsx) Giấy Chứng Nhận Hiệu Chuẩn
 * Sử dụng: node generate_excel.js <CERT_NO>
 * Hoặc được gọi từ server.js qua child_process
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Database connection (centralized) — Postgres via db.js
const db = require('./db');

// Adapter: SQLite ? → PostgreSQL $1, $2 for backward-compatible queries
async function dbGet(query, params) {
  dbGet._idx = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++dbGet._idx}`);
  const rows = await db.unsafe(pgQuery, params);
  return rows[0] || null;
}
async function dbAll(query, params) {
  dbAll._idx = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++dbAll._idx}`);
  return await db.unsafe(pgQuery, params);
}

// ─────────────────────── CẤU HÌNH ĐƯỜNG DẪN ───────────────────────
const certNo = process.argv[2];
const BASE_DIR   = __dirname;



function parseDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

const primaryColor = '007a78';
const lightBg = 'e6f7f7';
const borderColor = 'b8b5ae';

function defaultBorder() {
    return {
        top: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
    };
}

async function main(opts) {
    try {
        // Accept params from both CLI (process.argv) and direct call (opts object)
        const cNo = (opts && opts.certNo) || certNo;
        if (!cNo) {
            if (require.main === module) { console.error('Lỗi: Vui lòng cung cấp mã số chứng nhận.'); process.exit(1); }
            else throw new Error('Lỗi: Vui lòng cung cấp mã số chứng nhận.');
        }
        // Compute output paths inside main() (cNo is guaranteed valid here)
        const STATIC_DIR = process.env.VERCEL ? require('os').tmpdir() : path.join(BASE_DIR, 'static');
        if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });
        const SAFE_NAME   = cNo.replace(/[^a-zA-Z0-9]/g, '_');
        const OUTPUT_FILE = path.join(STATIC_DIR, `GCN_${SAFE_NAME}.xlsx`);
        const cert = await dbGet('SELECT * FROM CERTIFICATES WHERE CERT_NO = ?', [cNo]);
        if (!cert) {
            var errMsg = 'Loi: Khong tim thay du lieu cho ma [' + cNo + '] trong bang CERTIFICATES.';
            if (require.main === module) { console.error(errMsg); process.exit(1); }
            else throw new Error(errMsg);
        }

        const points = await dbAll('SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC', [cNo]);
        const standards = await dbAll('SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC', [cNo]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LabMaster Enterprise';
        workbook.created = new Date();

        // ===== SHEET 1: CHUNG NHAN HIEU CHUAN =====
        const ws = workbook.addWorksheet('Giấy Chứng Nhận', {
            pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true,
                margins: { left: 0.7, right: 0.7, top: 0.7, bottom: 0.7 } }
        });

        // --- TITLE ---
        ws.mergeCells('A1:G1');
        ws.getCell('A1').value = 'GIẤY CHỨNG NHẬN HIỆU CHUẨN';
        ws.getCell('A1').font = { name: 'Arial', size: 18, bold: true, color: { argb: primaryColor } };
        ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 30;

        ws.mergeCells('A2:G2');
        ws.getCell('A2').value = 'CERTIFICATE OF CALIBRATION';
        ws.getCell('A2').font = { name: 'Arial', size: 12, color: { argb: '6b6860' } };
        ws.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(2).height = 22;

        ws.mergeCells('A3:G3');
        var infoLineText = 'Số / No.: ' + (cert.CERT_NO || cNo) + '    ·    Ngày HC / Cal. Date: ' + parseDate(cert.CAL_DATE || '') + '    ·    HC kế tiếp / Re-cal: ' + parseDate(cert.RE_CAL_DATE || '');
        ws.getCell('A3').value = infoLineText;
        ws.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '6b6860' } };
        ws.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(3).height = 20;

        // --- INFO ---
        const infoRows = [
            ['1. Tên thiết bị / Instrument', cert.INSTRUMENT_NAME || '–'],
            ['2. Nhà sản xuất / Manufacturer', cert.MANUFACTURER || '–'],
            ['3. Kiểu / Model', cert.MODEL || '–'],
            ['4. Mã nhận diện / Equipment ID', cert.EQUIPMENT_ID || '–'],
            ['5. Số sê-ri / Serial No.', cert.SERIAL_NUMBER || '–'],
            ['6. Khách hàng / Customer', cert.CUSTOMER_NAME || '–'],
            ['7. Địa chỉ KH / Address', cert.CUSTOMER_ADDRESS || '–'],
            ['8. Quy trình HC / Procedure', cert.PROCEDURE || '–'],
            ['8. Tiêu chuẩn TK / Ref. Standard', cert.REF_STANDARD || '–'],
            ['9. Môi trường / Environment', 'Nhiệt độ: ' + (cert.TEMP_ENV || '–') + '   /   Độ ẩm: ' + (cert.HUMI_ENV || '–')]
        ];

        let r = 5;
        infoRows.forEach(function(item) {
            var label = item[0], val = item[1];
            ws.getRow(r).height = 22;
            ws.getCell('A' + r).value = label;
            ws.getCell('A' + r).font = { name: 'Arial', size: 10, bold: true, color: { argb: '1a1917' } };
            ws.getCell('A' + r).alignment = { vertical: 'middle' };
            ws.mergeCells('B' + r + ':G' + r);
            ws.getCell('B' + r).value = val;
            ws.getCell('B' + r).font = { name: 'Arial', size: 10, color: { argb: '1a1917' } };
            ws.getCell('B' + r).alignment = { vertical: 'middle', wrapText: true };
            r++;
        });

        

        // --- RESULTS TABLE ---
        r += 1;
        ws.mergeCells('A' + r + ':G' + r);
        ws.getCell('A' + r).value = '16. KẾT QUẢ HIỆU CHUẨN / CALIBRATION RESULTS:';
        ws.getCell('A' + r).font = { name: 'Arial', size: 11, bold: true, color: { argb: primaryColor } };
        ws.getCell('A' + r).alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(r).height = 24;
        r++;

        // Results header (7 columns: A through G)
        var resH = ['Thông số', 'Điểm HC', 'Giá trị đo được', 'KĐBĐ ±', 'Dung sai', 'Phù hợp', 'TB chuẩn'];
        ws.getRow(r).height = 28;
        var resColLetters = ['A','B','C','D','E','F','G'];
        resH.forEach(function(h, i) {
            var cell = ws.getCell(resColLetters[i] + r);
            cell.value = h;
            cell.font = { name: 'Arial', size: 8, bold: true, color: { argb: primaryColor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = defaultBorder();
        });
        r++;

        if (points.length === 0) {
            ws.mergeCells('A' + r + ':G' + r);
            ws.getCell('A' + r).value = 'Chưa có dữ liệu điểm đo';
            ws.getCell('A' + r).font = { name: 'Arial', size: 10, color: { argb: '9e9c96' } };
            ws.getCell('A' + r).alignment = { horizontal: 'center', vertical: 'middle' };
            r++;
        } else {
            // Group by PARAMETER_NAME
            var grouped = [];
            var curGroup = null;
            for (var pi = 0; pi < points.length; pi++) {
                var pn = points[pi].PARAMETER_NAME || points[pi].parameter_name || '–';
                if (!curGroup || curGroup.paramName !== pn) {
                    curGroup = { paramName: pn, rows: [] };
                    grouped.push(curGroup);
                }
                curGroup.rows.push(points[pi]);
            }

            for (var gi = 0; gi < grouped.length; gi++) {
                var group = grouped[gi];
                for (var ri = 0; ri < group.rows.length; ri++) {
                    var p = group.rows[ri];
                    ws.getRow(r).height = 22;

                    var paramName = ri === 0 ? group.paramName : '';
                    var calPt = String(p.CAL_POINT || p.cal_point || '–');
                    var asFound = String(p.AS_FOUND_VALUE || p.as_found_value || '–');
                    var unc = String(p.UNCERTAINTY || p.uncertainty || '–');
                    var tol = String(p.TOLERANCE || p.tolerance || '–');
                    var conf = String(p.CONFORMITY || p.conformity || '–');
                    var refEq = String(p.REF_EQUIPMENT || p.ref_equipment || '–');

                    var vals = [paramName, calPt, asFound, unc, tol, conf, refEq];
                    for (var vi = 0; vi < vals.length; vi++) {
                        var cell = ws.getCell(resColLetters[vi] + r);
                        cell.value = vals[vi];
                        cell.font = { name: 'Arial', size: 9, color: { argb: '1a1917' }, bold: vi === 0 };
                        cell.alignment = { horizontal: vi === 0 ? 'left' : 'center', vertical: 'middle', wrapText: true };
                        cell.border = defaultBorder();
                    }
                    r++;
                }
            }
        }

        // --- OTHER INFO ---
        r += 1;
        ws.mergeCells('A' + r + ':G' + r);
        ws.getCell('A' + r).value = '17. THÔNG TIN KHÁC / OTHER INFORMATION:';
        ws.getCell('A' + r).font = { name: 'Arial', size: 11, bold: true, color: { argb: primaryColor } };
        ws.getCell('A' + r).alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(r).height = 24;
        r++;

        var otherInfo = [
            ['17.1 Độ không đảm bảo đo / Uncertainty:', true],
            ['Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy.', false],
            ['The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.', false],
            ['', false],
            ['17.2. Công bố về sự phù hợp / Statements of conformity:', true],
            ['+ A: Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép. Within tolerance.', false],
            ['+ B: Kết quả đo nằm ngoài giới hạn cho phép. Out of tolerance.', false],
            ['+ C: Kết quả đo có thể nằm ngoài giới hạn. Không có kết luận. May be out of tolerance. No conclusion.', false],
            ['+ D: Tiêu chuẩn kỹ thuật không quy định dung sai. No tolerance stated.', false]
        ];

        otherInfo.forEach(function(item) {
            var text = item[0], isBold = item[1];
            ws.mergeCells('A' + r + ':G' + r);
            var cell = ws.getCell('A' + r);
            cell.value = text;
            cell.font = { name: 'Arial', size: 9, color: { argb: '1a1917' }, bold: isBold };
            cell.alignment = { vertical: 'middle', wrapText: true };
            ws.getRow(r).height = isBold ? 22 : 18;
            r++;
        });

        // --- SIGNATURE ---
        r += 2;
        var sigRow = r;
        ws.mergeCells('A' + sigRow + ':C' + (sigRow + 2));
        ws.getCell('A' + sigRow).value = 'NGƯỜI SOÁT XÉT / REVIEWED BY';
        ws.getCell('A' + sigRow).font = { name: 'Arial', size: 10, bold: true, color: { argb: primaryColor } };
        ws.getCell('A' + sigRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } };
        ws.getCell('A' + sigRow).alignment = { horizontal: 'center', vertical: 'center' };
        ws.getCell('A' + sigRow).border = defaultBorder();
        ws.getCell('A' + (sigRow + 2)).value = cert.HEAD_OF_LAB || '';
        ws.getCell('A' + (sigRow + 2)).font = { name: 'Arial', size: 10, color: { argb: '1a1917' } };
        ws.getCell('A' + (sigRow + 2)).alignment = { horizontal: 'center', vertical: 'bottom' };

        ws.mergeCells('E' + sigRow + ':G' + (sigRow + 2));
        ws.getCell('E' + sigRow).value = 'GIÁM ĐỐC / DIRECTOR';
        ws.getCell('E' + sigRow).font = { name: 'Arial', size: 10, bold: true, color: { argb: primaryColor } };
        ws.getCell('E' + sigRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } };
        ws.getCell('E' + sigRow).alignment = { horizontal: 'center', vertical: 'center' };
        ws.getCell('E' + sigRow).border = defaultBorder();
        ws.getCell('E' + (sigRow + 2)).value = cert.DIRECTOR || '';
        ws.getCell('E' + (sigRow + 2)).font = { name: 'Arial', size: 10, color: { argb: '1a1917' } };
        ws.getCell('E' + (sigRow + 2)).alignment = { horizontal: 'center', vertical: 'bottom' };

        for (var is = 0; is < 3; is++) {
            ws.getRow(sigRow + is).height = 28;
        }

        // --- FOOTER ---
        r = sigRow + 5;
        ws.mergeCells('A' + r + ':G' + r);
        ws.getCell('A' + r).value = 'www.labmaster.vn  |  Textile – Footwear – Children Products Safety Tester';
        ws.getCell('A' + r).font = { name: 'Arial', size: 8, color: { argb: '6b6860' }, italic: true };
        ws.getCell('A' + r).alignment = { horizontal: 'center', vertical: 'middle' };

        ws.getColumn(1).width = 24;
        ws.getColumn(2).width = 16;
        ws.getColumn(3).width = 16;
        ws.getColumn(4).width = 14;
        ws.getColumn(5).width = 14;
        ws.getColumn(6).width = 14;
        ws.getColumn(7).width = 16;

        // ===== SHEET 2: RAW DATA =====
        var ws2 = workbook.addWorksheet('Dữ Liệu Chi Tiết');
        ws2.getRow(1).height = 22;
        var rawH = ['STT', 'Thông số', 'Điểm HC', 'Giá trị đo được', 'KĐBĐ ±', 'Dung sai', 'Phù hợp', 'Thiết bị chuẩn'];
        rawH.forEach(function(h, i) {
            var cell = ws2.getCell(String.fromCharCode(65 + i) + '1');
            cell.value = h;
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: primaryColor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = defaultBorder();
        });

        points.forEach(function(p, i) {
            var row = ws2.getRow(i + 2);
            row.height = 20;
            var vals = [
                i + 1,
                p.PARAMETER_NAME || '–',
                p.CAL_POINT || '–',
                p.AS_FOUND_VALUE || '–',
                p.UNCERTAINTY || '–',
                p.TOLERANCE || '–',
                p.CONFORMITY || '–',
                p.REF_EQUIPMENT || '–'
            ];
            vals.forEach(function(v, j) {
                var cell = row.getCell(j + 1);
                cell.value = v;
                cell.font = { name: 'Arial', size: 9, color: { argb: '1a1917' } };
                cell.alignment = { horizontal: j === 1 ? 'left' : 'center', vertical: 'middle' };
                cell.border = defaultBorder();
            });
        });

        for (var ic = 1; ic <= 8; ic++) {
            ws2.getColumn(ic).width = 18;
        }

        await workbook.xlsx.writeFile(OUTPUT_FILE);
        console.log('[SUCCESS] Da xuat: GCN_' + SAFE_NAME + '.xlsx');
        // IMPORTANT: Do NOT call process.exit(0) here - it would kill the Express server!
        // Just return normally so the server can send the response.

    } catch (err) {
        console.error('LOI CRITICAL KHI SINH EXCEL:', err);
        if (require.main === module) process.exit(1);
        else throw err;
    }
}

module.exports = { generateExcel: main };

if (require.main === module) { main(); }
