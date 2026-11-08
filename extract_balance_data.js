/**
 * Trích xuất "Data Project Calibration Certificate/Balance.xlsx" → public/data/balance_matrix.json
 *
 * Cấu trúc file Excel:
 * - Các Sheet độ chia chính (0.0001g, 0.001g, 0.01g, 0.1g, 1g) chứa các khối 9 dòng
 *   liên tiếp, mỗi khối là thông số hiệu chuẩn cho một mức cân Max:
 *     Độ phân giải | Mức cân Max | Đơn vị | Các mức cân kiểm |
 *     Sai số cho phép | Độ KĐBĐ | Mức cân độ lặp lại | Mức cân độ lệch góc
 * - Các Sheet dung sai chung (0.01kg, 0.1kg, 1kg) chỉ chứa bảng tỉ lệ dung sai để
 *   so sánh, không chứa khối thông số riêng. Nơi đó xuất ra key `sourceMatrices`.
 *
 * Chạy: node extract_balance_data.js
 */

const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const SOURCE_PATH = path.join(__dirname, 'Data Project Calibration Certificate', 'Balance.xlsx');
const OUTPUT_PATH = path.join(__dirname, 'public', 'data', 'balance_matrix.json');

// Sheet chính chứa đủ khối thông số một mức cân.
const MAIN_SHEETS = ['0.0001g', '0.001g', '0.01g', '0.1g', '1g'];
// Sheet chỉ lưu bảng tỉ lệ dung sai chung, dùng làm nguồn tham chiếu và không
// chứa khối thông số riêng (bắt buộc nhất là "Mức cân" và "Dung sai").
const SHARED_SHEETS = ['0.01kg', '0.1kg', '1kg'];
const ALL_RESOLUTION_SHEETS = MAIN_SHEETS.concat(SHARED_SHEETS);

const LABELS = {
    resolution: 'Độ phân giải',
    max: 'Mức cân Max',
    unit: 'Đơn vị',
    points: 'Các mức cân kiểm',
    tolerance: 'Sai số cho phép',
    uncertainty: 'Độ KĐBĐ',
    repeatability: 'Mức cân độ lặp lại',
    eccentricity: 'Mức cân độ lệch góc'
};

/** Đọc text hiển thị của cell (hỗ trợ rich text, công thức, text thuần). */
function cellText(cell) {
    const v = cell.value;
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
        if (Array.isArray(v.richText)) return v.richText.map(t => t.text).join('').trim();
        if (v.formula !== undefined) {
            if (v.result === null || v.result === undefined) return '';
            if (typeof v.result === 'object') return cellText({ value: v.result });
            return String(v.result).trim();
        }
        if (v.text !== undefined) return String(v.text).trim();
        if (v.hyperlink !== undefined) return String(v.text || v.hyperlink).trim();
        return '';
    }
    return String(v).trim();
}

/** Số đầu tiên trong một giá trị, hỗ trợ "1000/1200" → 1000. */
function leadingNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const match = String(value ?? '').replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
    if (!match) return null;
    const num = Number(match[0].replace(',', '.'));
    return Number.isFinite(num) ? num : null;
}

function toNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const text = cellText({ value }).replace(/\s/g, '').replace(',', '.');
    if (!text) return null;
    const parsed = Number(text);
    if (Number.isFinite(parsed)) return parsed;
    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const extracted = Number(match[0]);
    return Number.isFinite(extracted) ? extracted : null;
}

/** Cấp chính xác suy ra từ độ phân giải d theo bảng "Tính Dung sai" trong chính file:
 * e = 10d; e ≤ 0.001g → Cấp I; e ≤ 0.1g → Cấp II; e ≤ 2g → Cấp III; còn lại Cấp IV. */
function classifyAccuracy(resolution) {
    const d = leadingNumber(resolution);
    if (d === null) return null;
    const e = d * 10;
    if (e <= 0.001) return 'Cấp I';
    if (e <= 0.1) return 'Cấp II';
    if (e <= 2) return 'Cấp III';
    return 'Cấp IV';
}

/** Quy đổi độ phân giải về gam để so khớp với tên Sheet. */
function resolutionInGrams(value, unit) {
    const num = leadingNumber(value);
    if (num === null) return null;
    const normalizedUnit = String(unit || 'g').toLowerCase().replace('\u0111', 'd');
    if (normalizedUnit === 'kg') return num * 1000;
    return num;
}

function readRowValues(ws, rowNumber, labelCol, endCol) {
    const values = [];
    const row = ws.getRow(rowNumber);
    for (let c = labelCol + 1; c <= endCol; c++) {
        const cell = row.getCell(c);
        values.push(cellText(cell) === '' ? null : cell.value);
    }
    while (values.length && values[values.length - 1] === null) values.pop();
    return values;
}

function findBlockLabels(ws, startRow) {
    const found = {};
    for (let r = startRow; r <= startRow + 8 && r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        row.eachCell({ includeEmpty: false }, (cell, col) => {
            const text = cellText(cell);
            for (const [key, label] of Object.entries(LABELS)) {
                if (text === label && !found[key]) {
                    found[key] = { row: r, col };
                }
            }
        });
    }
    return found;
}

function parseBlock(ws, startRow, labelMap, resolution) {
    const labelCol = labelMap.resolution.col;
    const endCol = ws.columnCount;

    const rawPoints = readRowValues(ws, labelMap.points.row, labelCol, endCol);
    const rawTolerances = readRowValues(ws, labelMap.tolerance.row, labelCol, endCol);
    const rawUncertainties = readRowValues(ws, labelMap.uncertainty.row, labelCol, endCol);

    const length = Math.min(rawPoints.length, rawTolerances.length, rawUncertainties.length);
    const testPoints = [];
    const tolerances = [];
    const uncertainties = [];

    for (let i = 0; i < length; i++) {
        const point = leadingNumber(rawPoints[i]);
        const tolerance = cellText({ value: rawTolerances[i] });
        const uncertainty = toNumber(rawUncertainties[i]);
        if (point === null || !tolerance || uncertainty === null) continue;
        testPoints.push(point);
        tolerances.push(tolerance);
        uncertainties.push(uncertainty);
    }

    // Bỏ điểm kiểm bị trùng lặp ở cuối (VD: 220/210g có 2 cột cùng là 200)
    while (testPoints.length > 1 && testPoints[testPoints.length - 1] === testPoints[testPoints.length - 2]) {
        testPoints.pop();
        tolerances.pop();
        uncertainties.pop();
    }

    if (!testPoints.length) return null;

    const valueOf = key => cellText(ws.getRow(labelMap[key].row).getCell(labelMap[key].col + 1));
    const maxRaw = valueOf('max');
    const unit = valueOf('unit');
    const repeatabilityLoad = leadingNumber(valueOf('repeatability'));
    const eccentricityLoad = leadingNumber(valueOf('eccentricity'));

    return {
        maxLabel: `${maxRaw} ${unit}`.trim(),
        maxNumeric: leadingNumber(maxRaw),
        unit,
        testPoints,
        tolerances,
        uncertainties,
        repeatabilityLoad,
        eccentricityLoad,
        accuracyClass: classifyAccuracy(resolution)
    };
}

/** Trả về source matrix cho sheet chỉ dùng làm tỉ lệ chung:
 *  [["Dung sai"],["Mức cân"],["Load"],["(g)"],[points...],[tolerance...]] */
function buildSharedMatrix(ws) {
    const rows = [];
    const endRow = Math.min(ws.rowCount, 30);
    const endCol = Math.min(ws.columnCount, 12);
    for (let r = 1; r <= endRow; r++) {
        const values = [];
        for (let c = 1; c <= endCol; c++) {
            const cell = ws.getRow(r).getCell(c);
            values.push(cellText(cell) === '' ? null : cell.value);
        }
        while (values.length && values[values.length - 1] === null) values.pop();
        if (values.some(v => v !== null)) rows.push(values);
    }
    return rows;
}

async function extract() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(SOURCE_PATH);

    const result = {};
    const sourceMatrices = {};
    const warnings = [];
    let totalEntries = 0;

    for (const sheetName of ALL_RESOLUTION_SHEETS) {
        const ws = wb.getWorksheet(sheetName);
        if (!ws) {
            warnings.push(`Không tìm thấy sheet "${sheetName}" → []`);
            if (!SHARED_SHEETS.includes(sheetName)) result[sheetName] = [];
            continue;
        }

        // Bảng dung sai chung: chỉ cần giữ nguyên ma trận, không phân tích khối.
        if (SHARED_SHEETS.includes(sheetName)) {
            sourceMatrices[sheetName] = buildSharedMatrix(ws);
            continue;
        }

        const entries = [];
        for (let r = 1; r <= ws.rowCount; r++) {
            const row = ws.getRow(r);
            let isBlockStart = false;
            row.eachCell({ includeEmpty: false }, cell => {
                if (cellText(cell) === LABELS.resolution) isBlockStart = true;
            });
            if (!isBlockStart) continue;

            const labelMap = findBlockLabels(ws, r);
            const required = ['resolution', 'max', 'unit', 'points', 'tolerance', 'uncertainty', 'repeatability', 'eccentricity'];
            const missing = required.filter(key => !labelMap[key]);
            if (missing.length) {
                warnings.push(`Sheet "${sheetName}" dòng ${r}: thiếu nhãn ${missing.join(', ')} → bỏ qua khối`);
                continue;
            }

            const sheetUnit = sheetName.replace(/^[\d.,]+/, '');
            const sheetValue = sheetName.slice(0, sheetName.length - sheetUnit.length);
            const sheetGrams = resolutionInGrams(sheetValue, sheetUnit);
            const declaredResolution = cellText(ws.getRow(labelMap.resolution.row).getCell(labelMap.resolution.col + 1));
            const blockGrams = resolutionInGrams(declaredResolution, sheetUnit);
            if (sheetGrams === null || blockGrams === null || Math.abs(blockGrams - sheetGrams) > sheetGrams * 1e-6) {
                warnings.push(`Sheet "${sheetName}" dòng ${r}: độ phân giải khai báo không khớp tên sheet → bỏ qua khối`);
                continue;
            }

            const entry = parseBlock(ws, r, labelMap, sheetName);
            if (!entry) {
                warnings.push(`Sheet "${sheetName}" dòng ${r}: khối không có mức cân kiểm hợp lệ → bỏ qua`);
                continue;
            }
            entry.sourceSheet = sheetName;
            entry.sourceRow = r;
            const duplicateIndex = entries.findIndex(e => e.maxLabel === entry.maxLabel);
            if (duplicateIndex >= 0) {
                const previousRow = entries[duplicateIndex].sourceRow;
                // Một số tab có bản draft cũ cộng vế bản cuối cùng. Lưu bản cuối cùng đã
                // chuẩn hóa để tránh sai số dung sai cũ khi trích xuất.
                entries[duplicateIndex] = entry;
                warnings.push(`Sheet "${sheetName}" dòng ${r}: mức cân "${entry.maxLabel}" bị lặp → dùng khối sau (dòng ${r}), thay khối dòng ${previousRow}`);
                continue;
            }
            entries.push(entry);
        }

        if (!entries.length) {
            warnings.push(`Sheet "${sheetName}" không có khối thông số nào (chỉ chứa bảng dung sai chung) → []`);
        }

        result[sheetName] = entries;
        totalEntries += entries.length;
    }

    result.sourceMatrices = Object.keys(sourceMatrices).length ? sourceMatrices : undefined;

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n', 'utf-8');

    console.log(`✅ Đã trích xuất ${totalEntries} mức cân từ ${SOURCE_PATH}`);
    console.log(`📄 Kết quả: ${OUTPUT_PATH}`);
    for (const sheetName of ALL_RESOLUTION_SHEETS) {
        const entries = result[sheetName];
        console.log(`   - ${sheetName}: ${entries ? `${entries.length} mức cân` : 'ma trận tham chiếu'}`);
    }
    if (warnings.length) {
        console.log('\n⚠️ Cảnh báo:');
        warnings.forEach(w => console.log('   - ' + w));
    }
    return result;
}

if (require.main === module) {
    extract().catch(err => {
        console.error('❌ Lỗi trích xuất:', err.message);
        process.exit(1);
    });
}

module.exports = { extract };
