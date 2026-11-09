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
const BASE_DIR = __dirname;


function parseDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

function cleanParamName(name) {
    if (!name) return '';
    return String(name)
        .replace(/\(x\)/gi, '')
        .replace(/\(X\)/gi, '')
        .trim();
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

// toUpperKeys: chuyển key của postgres row (Array với named properties lowercase) thành key UPPERCASE
function toUpperKeys(obj) {
    if (!obj) return null;
    if (Array.isArray(obj)) {
        if (obj.length === 0) return [];
        if (typeof obj[0] === 'object' || Array.isArray(obj[0])) {
            return obj.map(toUpperKeys);
        }
    }
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && isNaN(Number(key))) {
            result[key.toUpperCase()] = obj[key];
        }
    }
    return result;
}

async function main(opts) {
    try {
        // Accept params from both CLI (process.argv) and direct call (opts object)
        const compositeCNo = (opts && opts.certNo) || certNo;
        const eqName = (opts && opts.equipmentName) || equipmentName || '';
        let cNo = compositeCNo;
        if (eqName && cNo.endsWith('_' + eqName)) {
            cNo = cNo.substring(0, cNo.length - eqName.length - 1);
        }
        const accMethods = (opts && opts.accreditedMethods) || []; // danh sách máy/phép thử được công nhận (STT + tên + mã QT)
        if (!compositeCNo) {
            if (require.main === module) { console.error('Lỗi: Vui lòng cung cấp mã số chứng nhận.'); process.exit(1); }
            else throw new Error('Lỗi: Vui lòng cung cấp mã số chứng nhận.');
        }
        // Compute output paths inside main() (compositeCNo is guaranteed valid here)
        const STATIC_DIR = process.env.VERCEL ? require('os').tmpdir() : path.join(BASE_DIR, 'static');
        if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });
        const SAFE_NAME = compositeCNo.replace(/[^a-zA-Z0-9]/g, '_');
        const OUTPUT_FILE = path.join(STATIC_DIR, `GCN_${SAFE_NAME}.xlsx`);

function mapDataToCert(data, cNo) {
    return {
        CERT_NO: cNo,
        CUSTOMER_NAME: data.customerName || data.customer_name || '',
        CUSTOMER_ADDRESS: data.customerAddress || data.customer_address || '',
        INSTRUMENT_NAME: data.instrumentName || data.instrument_name || '',
        INSTRUMENT_NAME_EN: data.instrumentNameEn || data.instrument_name_en || '',
        MANUFACTURER: data.manufacturer || '',
        MANUFACTURER_ID: data.manufacturerId || data.manufacturer_id || '',
        MODEL: data.model || '',
        MODEL_SERIAL: data.modelSerial || data.model_serial || '',
        EQUIPMENT_ID: data.equipmentId || data.equipment_id || '',
        SERIAL_NUMBER: data.serialNumber || data.serial_number || '',
        CAL_DATE: data.calDate || data.cal_date || '',
        RE_CAL_DATE: data.reCalDate || data.re_cal_date || '',
        TEMP_ENV: data.tempEnv || data.temp_env || '',
        HUMI_ENV: data.humiEnv || data.humi_env || '',
        PROCEDURE: data.procedure || '',
        REF_STANDARD: data.refStandard || data.ref_standard || '',
        SPEC_RANGE: data.specRange || data.spec_range || '',
        SPEC_RESOLUTION: data.specResolution || data.spec_resolution || '',
        HEAD_OF_LAB: data.headOfLab || data.head_of_lab || '',
        DIRECTOR: data.director || ''
    };
}

function mapDataToPoints(points) {
    if (!points || !Array.isArray(points)) return [];
    return points.map(p => ({
        PARAMETER_NAME: p.parameterName || p.param || '',
        CAL_POINT: p.calPoint || p.point || '',
        AS_FOUND_VALUE: p.asFoundValue || p.found || '',
        REFERENCE_VALUE: p.referenceValue || p.refValue || p.reference_value || '',
        UNCERTAINTY: p.uncertainty || p.unc || '',
        TOLERANCE: p.tolerance || p.tol || '',
        CONFORMITY: p.conformity || p.conf || '',
        REF_EQUIPMENT: p.refEq || p.standardEquipment || p.standard_equipment || '',
        STANDARD_EQUIPMENT: p.refEq || p.standardEquipment || p.standard_equipment || ''
    }));
}

function mapDataToStandards(standards) {
    if (!standards || !Array.isArray(standards)) return [];
    return standards.map(s => ({
        EQ_CODE: s.id || s.code || '',
        EQ_NAME: s.name || '',
        STD_CERT_NO: s.certNo || '',
        LINK: s.trace || s.link || '',
        VALIDITY: s.due || s.validity || ''
    }));
}

function getBalanceRawData(data, cert) {
    const candidates = [data && data.balanceRawData, data && data.raw_data, cert && cert.RAW_DATA, cert && cert.raw_data];
    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            const parsed = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
            if (parsed && parsed.division && Array.isArray(parsed.indication)) return parsed;
        } catch (_) { /* Ignore non-Balance raw data, such as oven data. */ }
    }
    return null;
}

function excelNumber(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const number = Number(String(value).trim().replace(',', '.'));
    return Number.isFinite(number) ? number : null;
}

function symmetricTolerance(value) {
    const matches = String(value ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/g) || [];
    return matches.length === 1 ? Math.abs(Number(matches[0])) : null;
}

function balanceConformity(error, uncertainty, tolerance, toleranceText) {
    if (error === null) return '';
    if (!String(toleranceText ?? '').trim()) return 'D';
    if (tolerance === null) return '';
    const e = Math.abs(error);
    const u = uncertainty === null ? null : Math.abs(uncertainty);
    if (u === null) return e <= tolerance + 1e-12 ? 'A' : 'B';
    if (e + u <= tolerance + 1e-12) return 'A';
    if (e - u > tolerance + 1e-12) return 'B';
    return 'C';
}

function addBalanceWorksheet(workbook, balance) {
    const ws = workbook.addWorksheet('Balance Calibration');
    const divisionDecimals = Math.max((String(balance.division || '').match(/\.(\d+)/) || [])[1]?.length || 0, 1);
    const measurementNumFmt = divisionDecimals ? `0.${'0'.repeat(divisionDecimals)}` : '0';
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } };
    const styleHeader = cell => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: primaryColor } };
        cell.fill = headerFill;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = defaultBorder();
    };
    const styleBody = (cell, align = 'center') => {
        cell.font = { name: 'Arial', size: 10, color: { argb: '1a1917' } };
        cell.alignment = { horizontal: align, vertical: 'middle', wrapText: true };
        cell.border = defaultBorder();
    };

    ws.mergeCells('A1:G1');
    ws.getCell('A1').value = 'BALANCE — CALIBRATION RESULTS';
    ws.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: primaryColor } };
    ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 26;
    ws.getCell('A3').value = 'Division'; ws.getCell('B3').value = balance.division || '';
    ws.getCell('D3').value = 'Capacity'; ws.getCell('E3').value = balance.maxLabel || balance.maxNumeric || '';
    ws.getCell('F3').value = 'Unit'; ws.getCell('G3').value = balance.unit || 'g';

    // Indication error and decision rule: e=|load-indication|; A if e+U<=T,
    // B if e-U>T, C otherwise. D means no tolerance is stated.
    ws.mergeCells('A5:G5');
    ws.getCell('A5').value = '1. Difference of Indication';
    ws.getCell('A5').font = { name: 'Arial', size: 11, bold: true };
    const indicationHeaders = ['Load', 'Indication', 'Expanded uncertainty U', 'Correction (load − indication)', 'Tolerance', 'Tolerance T (numeric)', 'Conclusion'];
    indicationHeaders.forEach((label, i) => { const cell = ws.getCell(7, i + 1); cell.value = label; styleHeader(cell); });
    const indication = Array.isArray(balance.indication) ? balance.indication : [];
    indication.forEach((item, i) => {
        const row = 8 + i;
        const load = excelNumber(item.load);
        const indicated = excelNumber(item.indicated);
        const uncertainty = excelNumber(item.uncertainty);
        const toleranceText = item.tolerance || '';
        const tolerance = symmetricTolerance(toleranceText);
        const error = load !== null && indicated !== null ? load - indicated : null;
        [load, indicated, uncertainty, null, toleranceText, tolerance, null].forEach((value, j) => {
            const cell = ws.getCell(row, j + 1);
            cell.value = value === null ? '' : value;
            styleBody(cell);
        });
        const correctionCell = ws.getCell(row, 4);
        correctionCell.value = { formula: `IF(OR(A${row}="",B${row}=""),"",A${row}-B${row})`, result: error ?? '' };
        const conclusion = balanceConformity(error, uncertainty, tolerance, toleranceText);
        ws.getCell(row, 7).value = {
            formula: `IF(OR(A${row}="",B${row}=""),"",IF(E${row}="","D",IF(F${row}="","",IF(C${row}="",IF(ABS(D${row})<=F${row}+1E-12,"A","B"),IF(ABS(D${row})+ABS(C${row})<=F${row}+1E-12,"A",IF(ABS(D${row})-ABS(C${row})>F${row}+1E-12,"B","C"))))))`,
            result: conclusion
        };
        styleBody(correctionCell); styleBody(ws.getCell(row, 7));
        correctionCell.numFmt = measurementNumFmt;
        ws.getCell(row, 2).numFmt = measurementNumFmt;
        ws.getCell(row, 3).numFmt = measurementNumFmt;
        ws.getCell(row, 6).numFmt = measurementNumFmt;
    });

    const repeatTitleRow = 10 + indication.length;
    ws.mergeCells(`A${repeatTitleRow}:K${repeatTitleRow}`);
    ws.getCell(`A${repeatTitleRow}`).value = '2. Repeatability — sample standard deviation (Bessel, STDEV.S)';
    ws.getCell(`A${repeatTitleRow}`).font = { name: 'Arial', size: 11, bold: true };
    const repeatHeaderRow = repeatTitleRow + 2;
    ['Load', ...Array.from({ length: 10 }, (_, i) => `Reading ${i + 1}`), 'Count', 'Standard deviation s'].forEach((label, i) => {
        const cell = ws.getCell(repeatHeaderRow, i + 1); cell.value = label; styleHeader(cell);
    });
    const repeatRow = repeatHeaderRow + 1;
    const repeatability = balance.repeatability || {};
    const readings = Array.isArray(repeatability.readings) ? repeatability.readings.slice(0, 10) : [];
    while (readings.length < 10) readings.push('');
    const repeatLoad = excelNumber(repeatability.load ?? balance.repeatabilityLoad);
    ws.getCell(repeatRow, 1).value = repeatLoad ?? '';
    readings.forEach((reading, i) => { ws.getCell(repeatRow, i + 2).value = excelNumber(reading) ?? ''; });
    const readingRange = `B${repeatRow}:K${repeatRow}`;
    const validReadings = readings.map(excelNumber).filter(value => value !== null);
    const countCell = ws.getCell(repeatRow, 12);
    countCell.value = { formula: `COUNT(${readingRange})`, result: validReadings.length };
    const stdDev = validReadings.length >= 6
        ? Math.sqrt(validReadings.reduce((sum, value) => sum + (value - validReadings.reduce((a, b) => a + b, 0) / validReadings.length) ** 2, 0) / (validReadings.length - 1))
        : null;
    const stdCell = ws.getCell(repeatRow, 13);
    stdCell.value = { formula: `IF(L${repeatRow}>=6,STDEV.S(${readingRange}),"")`, result: stdDev ?? '' };
    for (let col = 1; col <= 13; col++) styleBody(ws.getCell(repeatRow, col));
    stdCell.numFmt = measurementNumFmt;

    const eccTitleRow = repeatRow + 3;
    ws.mergeCells(`A${eccTitleRow}:G${eccTitleRow}`);
    ws.getCell(`A${eccTitleRow}`).value = '3. Eccentricity — absolute difference from center';
    ws.getCell(`A${eccTitleRow}`).font = { name: 'Arial', size: 11, bold: true };
    const eccHeaderRow = eccTitleRow + 2;
    ['Position', 'Center (0)', 'Left (1)', 'Front (2)', 'Right (3)', 'Back (4)', 'Max difference'].forEach((label, i) => {
        const cell = ws.getCell(eccHeaderRow, i + 1); cell.value = label; styleHeader(cell);
    });
    const eccRow = eccHeaderRow + 1;
    const ecc = balance.eccentricity || {};
    const values = Array.isArray(ecc.values) ? ecc.values.slice(0, 5) : [];
    while (values.length < 5) values.push('');
    values.forEach((value, i) => { ws.getCell(eccRow, i + 2).value = excelNumber(value) ?? ''; });
    ws.getCell(eccRow, 1).value = ecc.load ?? balance.eccentricityLoad ?? '';
    for (let i = 0; i < 4; i++) {
        const col = i + 3;
        const cell = ws.getCell(eccRow + 1, col);
        const centerValue = excelNumber(values[0]);
        const pointValue = excelNumber(values[i + 1]);
        const point = centerValue !== null && pointValue !== null ? Math.abs(pointValue - centerValue) : '';
        cell.value = { formula: `IF(OR(${String.fromCharCode(64 + col)}${eccRow}="",B${eccRow}=""),"",ABS(${String.fromCharCode(64 + col)}${eccRow}-B${eccRow}))`, result: point };
    }
    ws.getCell(eccRow + 1, 1).value = 'Difference';
    ws.getCell(eccRow + 1, 2).value = { formula: '0', result: 0 };
    const validEcc = values.map(excelNumber);
    const center = validEcc[0];
    const diffs = validEcc.slice(1).map(value => value !== null && center !== null ? Math.abs(value - center) : null);
    const maxDiff = diffs.filter(value => value !== null).length ? Math.max(...diffs.filter(value => value !== null)) : null;
    ws.getCell(eccRow + 1, 7).value = { formula: `IF(COUNT(C${eccRow + 1}:F${eccRow + 1})=0,"",MAX(C${eccRow + 1}:F${eccRow + 1}))`, result: maxDiff ?? '' };
    for (let col = 1; col <= 7; col++) styleBody(ws.getCell(eccRow + 1, col));
    for (let col = 2; col <= 7; col++) {
        ws.getCell(eccRow, col).numFmt = measurementNumFmt;
        ws.getCell(eccRow + 1, col).numFmt = measurementNumFmt;
    }

    [22, 16, 15, 17, 17, 15, 18, 15, 15, 15, 15, 12, 24].forEach((width, i) => { ws.getColumn(i + 1).width = width; });
    ws.views = [{ state: 'frozen', ySplit: 7 }];
}

        let cert = null;
        let points = [];
        let standards = [];
        let balanceData = null;

        if (opts && opts.data) {
            cert = mapDataToCert(opts.data, cNo);
            points = mapDataToPoints(opts.data.points);
            standards = mapDataToStandards(opts.data.standards);
        } else {
            cert = toUpperKeys(await dbGet('SELECT * FROM CERTIFICATES WHERE CERT_NO = ?', [compositeCNo]));
            if (!cert && compositeCNo !== cNo) {
                cert = toUpperKeys(await dbGet('SELECT * FROM CERTIFICATES WHERE CERT_NO = ?', [cNo]));
            }
            if (!cert) {
                var errMsg = 'Loi: Khong tim thay du lieu cho ma [' + compositeCNo + '] trong bang CERTIFICATES.';
                if (require.main === module) { console.error(errMsg); process.exit(1); }
                else throw new Error(errMsg);
            }

            points = toUpperKeys(await dbAll('SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC', [compositeCNo]));
            standards = toUpperKeys(await dbAll('SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC', [compositeCNo]));
        }

        balanceData = getBalanceRawData(opts && opts.data, cert);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LabMaster Enterprise';
        workbook.created = new Date();
        workbook.calcProperties = { fullCalcOnLoad: true, forceFullCalc: true, calcMode: 'auto' };

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
        var infoLineText = 'Số / No.: ' + cNo + '    ·    Ngày HC / Cal. Date: ' + parseDate(cert.CAL_DATE || '') + '    ·    HC kế tiếp / Re-cal: ' + parseDate(cert.RE_CAL_DATE || '');
        ws.getCell('A3').value = infoLineText;
        ws.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '6b6860' } };
        ws.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(3).height = 20;

        // --- INFO ---
        const accProcText = (accMethods && accMethods.length)
            ? accMethods.map(m => (m.stt != null ? m.stt + '. ' : '') + (m.tenVn || '') + (m.tenEn ? ' (' + m.tenEn + ')' : '') + (m.quyTrinh ? ' — QT: ' + m.quyTrinh : '')).join('\n')
            : (cert.PROCEDURE || '–');
        const infoRows = [
            ['1. Tên thiết bị / Instrument', cert.INSTRUMENT_NAME || '–'],
            ['2. Nhà sản xuất / Manufacturer', cert.MANUFACTURER || '–'],
            ['3. Kiểu / Model', cert.MODEL || '–'],
            ['4. Mã nhận diện / Equipment ID', cert.EQUIPMENT_ID || '–'],
            ['5. Số sê-ri / Serial No.', cert.SERIAL_NUMBER || '–'],
            ['6. Khách hàng / Customer', cert.CUSTOMER_NAME || '–'],
            ['7. Địa chỉ KH / Address', cert.CUSTOMER_ADDRESS || '–'],
            ['8. Quy trình HC / Procedure', accProcText],
            ['8. Tiêu chuẩn TK / Ref. Standard', cert.REF_STANDARD || '–'],
            ['9. Môi trường / Environment', 'Nhiệt độ: ' + (cert.TEMP_ENV || '–') + '   /   Độ ẩm: ' + (cert.HUMI_ENV || '–')]
        ];

        let r = 5;
        infoRows.forEach(function(item) {
            var label = item[0], val = item[1];
            // Dòng Quy trình HC chứa danh sách máy (nhiều dòng) → nới chiều cao hàng để không bị cắt
            var isProcRow = label.indexOf('Quy trình HC') === 0;
            ws.getRow(r).height = (isProcRow && accMethods.length) ? 22 + accMethods.length * 15 : 22;
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

        const sigRow = r + 2;

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

        if (balanceData) addBalanceWorksheet(workbook, balanceData);

        // ===== SHEET 3: THAM CHÍ DỮ LIỆU (sourceMatrix) =====
        // Dành cho các mảnh dữ liệu khác nhau (tỷ lệ dung sai chung) đã trích xuất
        // từ file Excel nguồn, giúp người dùng đối chiếu khi xuất PDF/xlsx.
        try {
            const sourceMatrixPath = path.join(BASE_DIR, 'public', 'data', 'balance_matrix.json');
            const sourceMatrix = JSON.parse(fs.readFileSync(sourceMatrixPath, 'utf-8'));
            const wsS = workbook.addWorksheet('Tham Chỉ Dữ Liệu');
            wsS.getRow(1).height = 24;
            const header = ['Mức độ chia / Resolution', 'Mức cân Max', 'Đơn vị', 'Điểm HC', 'Tolerance', 'Uncertainty', 'Lặp lại', 'Lệch góc'];
            header.forEach(function(h, i) {
                const cell = wsS.getCell(String.fromCharCode(65 + i) + '1');
                cell.value = h;
                cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: primaryColor } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = defaultBorder();
            });

            let rowIdx = 2;
            for (const resolution of Object.keys(sourceMatrix).sort()) {
                const entries = sourceMatrix[resolution];
                if (!Array.isArray(entries)) continue;

                for (const entry of entries) {
                    if (typeof entry === 'string' || typeof entry === 'number' || Array.isArray(entry)) {
                        continue;
                    }
                    const testPoints = entry.testPoints || [];
                    const tolerances = entry.tolerances || [];
                    const uncertainties = entry.uncertainties || [];
                    const repeated = entry.repeatabilityLoad || '';
                    const eccentric = entry.eccentricityLoad || '';

                    wsS.getCell('A' + rowIdx).value = resolution;
                    wsS.getCell('B' + rowIdx).value = entry.maxLabel || '';
                    wsS.getCell('C' + rowIdx).value = entry.unit || '';
                    wsS.getCell('D' + rowIdx).value = Array.isArray(testPoints) ? testPoints.join(', ') : '';
                    wsS.getCell('E' + rowIdx).value = Array.isArray(tolerances) ? tolerances.join(', ') : '';
                    wsS.getCell('F' + rowIdx).value = Array.isArray(uncertainties) ? uncertainties.join(', ') : '';
                    wsS.getCell('G' + rowIdx).value = repeated;
                    wsS.getCell('H' + rowIdx).value = eccentric;

                    for (let c = 1; c <= 8; c++) {
                        wsS.getCell(String.fromCharCode(64 + c) + rowIdx).font = { name: 'Arial', size: 9, color: { argb: '1a1917' } };
                        wsS.getCell(String.fromCharCode(64 + c) + rowIdx).alignment = { horizontal: c === 1 ? 'left' : 'center', vertical: 'middle' };
                        wsS.getCell(String.fromCharCode(64 + c) + rowIdx).border = defaultBorder();
                    }
                    rowIdx++;
                }
            }

            for (let c = 1; c <= 8; c++) {
                wsS.getColumn(c).width = 30;
            }
        } catch (err) {
            console.error('⚠️ Không thể sinh sheet tham chiếu sourceMatrix:', err.message);
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
