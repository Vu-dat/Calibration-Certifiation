'use strict';

/**
 * generate_docx.js — Tạo file Word (.docx) Giấy Chứng Nhận Hiệu Chuẩn
 * Layout theo mẫu: 328344 Wascator.docx
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

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

const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, PageBorders,
    Header, Footer, ImageRun
} = require('docx');

// ─── CLI ───────────────────────────────────────────────────────────
const certNo = process.argv[2];
let downloadUrl = process.argv[3] || '';

const BASE_DIR   = __dirname;



function parseDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

// ─── CONSTANTS ──────────────────────────────────────────────────────
const COL_DARK    = '1a1a1a';
const COL_GRAY    = '555555';
const COL_TEAL    = '008080';
const BORDER_S    = { style: BorderStyle.SINGLE, size: 2, color: '767171' };
const BORDER_NONE = { style: BorderStyle.NONE,   size: 0,  color: 'auto' };
const SHADING     = 'F2F2F2';

// Column widths (DXA) — scaled to fit A4 page with 2.5cm margins: total 9072
// [label1, value1, label2, value2]
const COL_W = [1500, 3036, 2500, 2036];

// ─── HELPERS ────────────────────────────────────────────────────────
const font = 'Arial';

function txtRun(text, opts = {}) {
    return new TextRun({
        text: text || '',
        font,
        size: (opts.fontSize || 10) * 2,
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COL_DARK,
    });
}

function para(text, opts = {}) {
    const runs = [];
    if (typeof text === 'string') {
        runs.push(txtRun(text, opts));
    } else if (Array.isArray(text)) {
        text.forEach(t => {
            if (typeof t === 'string') runs.push(txtRun(t, opts));
            else runs.push(txtRun(t.text, { ...opts, ...t }));
        });
    }
    return new Paragraph({
        children: runs,
        alignment: opts.alignment || AlignmentType.LEFT,
        spacing: opts.spacing || { before: 40, after: 40 },
    });
}

function labelPara(viText, enText) {
    return [
        para(viText, { fontSize: 10, bold: true, spacing: { before: 40, after: 0 } }),
        para(enText, { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
    ];
}

function valPara(val, opts = {}) {
    return para(val || '–', { fontSize: 10, bold: opts.bold || false, ...opts });
}

function emptyPara() {
    return para('', { fontSize: 8, spacing: { before: 20, after: 20 } });
}

function mkCell(children, opts = {}) {
    return new TableCell({
        children: Array.isArray(children) ? children : [children],
        columnSpan: opts.colSpan,
        width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
        shading: opts.shading ? { fill: opts.shading } : undefined,
        verticalAlign: opts.vAlign || 'center',
        margins: opts.margins,
        borders: opts.borders || {
            top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE,
        },
    });
}

function borderCell(children, opts = {}) {
    return mkCell(children, {
        ...opts,
        borders: { top: BORDER_S, bottom: BORDER_S, left: BORDER_S, right: BORDER_S },
        margins: opts.margins || { top: 60, bottom: 60, left: 100, right: 120 },
    });
}

// ─── MAIN ──────────────────────────────────────────────────────────
async function main(opts) {
    try {
        // Accept params from both CLI (process.argv) and direct call (opts object)
        const cNo = (opts && opts.certNo) || certNo;
        if (!cNo) {
            if (require.main === module) { console.error('Lỗi: node generate_docx.js <CERT_NO> [download_url]'); process.exit(1); }
            else throw new Error('Lỗi: node generate_docx.js <CERT_NO> [download_url]');
        }
        // Resolve downloadUrl: ưu tiên opts, fallback process.argv
        const dUrl = (opts && opts.downloadUrl) || downloadUrl || '';
        const finalDUrl = dUrl || `http://localhost:18080/static/GCN_${cNo.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
        // Compute output paths inside main() (cNo is guaranteed valid here)
        const STATIC_DIR = path.join(BASE_DIR, 'static');
        if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });
        const SAFE_NAME   = cNo.replace(/[^a-zA-Z0-9]/g, '_');
        const OUTPUT_FILE = path.join(STATIC_DIR, `GCN_${SAFE_NAME}.docx`);
        const cert = await dbGet(`SELECT * FROM CERTIFICATES WHERE CERT_NO = ?`, [cNo]);
        if (!cert) {
            var errMsg = 'Lỗi: Không tìm thấy dữ liệu cho mã [' + cNo + '].';
            if (require.main === module) { console.error(errMsg); process.exit(1); }
            else throw new Error(errMsg);
        }

        const points    = await dbAll(`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC`, [cNo]);
        const standards  = await dbAll(`SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC`, [cNo]);

        // Generate QR code if download URL provided
        let qrBuffer = null;
        if (finalDUrl) {
            try {
                qrBuffer = await QRCode.toBuffer(finalDUrl, {width:120,margin:1,color:{dark:'#004d4d',light:'#ffffff'}});
            } catch(e) { /* ignore QR errors */ }
        }

        const children = [];

        // ═══════════════════════════════════════════════════════════════
        //  TITLE
        // ═══════════════════════════════════════════════════════════════
        children.push(
            para('GIẤY CHỨNG NHẬN HIỆU CHUẨN – ĐO LƯỜNG', {
                fontSize: 18, bold: true, color: COL_TEAL,
                alignment: AlignmentType.CENTER, spacing: { before: 80, after: 0 },
            }),
            para('CERTIFICATE OF CALIBRATION – MEASUREMENT', {
                fontSize: 16, bold: true, italics: true, color: COL_TEAL,
                alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 },
            }),
        );

        // ═══════════════════════════════════════════════════════════════
        //  TABLE 1: INFO (Sections 1–10)
        // ═══════════════════════════════════════════════════════════════
        const infoLabels = {
            '1': ['1. Tên thiết bị:', 'Instrument'],
            '2': ['2. Nhà sản xuất:', 'Manufacturer'],
            '3': ['3. Kiểu:', 'Model'],
            '4': ['4. ID:', ''],
            '5': ['5. Số sản xuất:', 'SN'],
            '6': ['6. Tên khách hàng:', 'Customer'],
            '7': ['7. Địa chỉ:', 'Address'],
            '8': ['8. Số giấy chứng nhận:', 'Certificate No.'],
            '9': ['9. Ngày hiệu chuẩn:', 'Calibration Date'],
            '10': ['10. Ngày hiệu chuẩn tiếp theo:', 'Re-calibration Date'],
        };

        // Build info rows — borderless table matching PDF clean style
        function infoRowBL(labelKey, val1, labelKey2, val2) {
            const [vi1, en1] = infoLabels[labelKey] || [labelKey, ''];
            const [vi2, en2] = infoLabels[labelKey2] || [labelKey2, ''];
                        const c1Contents = en1 ? [...labelPara(vi1, en1)] : [para(vi1, { fontSize: 10, bold: true, spacing: { before: 40, after: 40 } })];
            const c3Contents = en2 ? [...labelPara(vi2, en2)] : [para(vi2 || '', { fontSize: 10, bold: true, spacing: { before: 40, after: 40 } })];
            return new TableRow({
                children: [
                    mkCell(c1Contents, { width: COL_W[0], margins: { top: 20, bottom: 20, left: 0, right: 60 } }),
                    mkCell([valPara(val1)], { width: COL_W[1], margins: { top: 20, bottom: 20, left: 0, right: 60 } }),
                    mkCell(c3Contents, { width: COL_W[2], margins: { top: 20, bottom: 20, left: 0, right: 60 } }),
                    mkCell([valPara(val2)], { width: COL_W[3], margins: { top: 20, bottom: 20, left: 0, right: 0 } }),
                ]
            });
        }
        function infoRowFullBL(labelKey, val, colSpan = 3) {
            const [vi, en] = infoLabels[labelKey] || [labelKey, ''];
                        const c1Contents = en ? [...labelPara(vi, en)] : [para(vi, { fontSize: 10, bold: true, spacing: { before: 40, after: 40 } })];
            return new TableRow({
                children: [
                    mkCell(c1Contents, { width: COL_W[0], margins: { top: 20, bottom: 20, left: 0, right: 60 } }),
                    mkCell([valPara(val, { bold: true })], { width: COL_W[1] + COL_W[2] + COL_W[3], colSpan, margins: { top: 20, bottom: 20, left: 0, right: 0 } }),
                ]
            });
        }

        const infoRows = [
            infoRowBL('1', cert.INSTRUMENT_NAME || '–', '8', cert.CERT_NO || certNo),
            infoRowBL('2', cert.MANUFACTURER || '–', '9', parseDate(cert.CAL_DATE || '')),
            infoRowBL('3', cert.MODEL || '–', '10', parseDate(cert.RE_CAL_DATE || '')),
            infoRowBL('4', cert.EQUIPMENT_ID || '–', '', ''),
            infoRowBL('5', cert.SERIAL_NUMBER || '–', '', ''),
            infoRowFullBL('6', cert.CUSTOMER_NAME || '–', 3),
            infoRowFullBL('7', cert.CUSTOMER_ADDRESS || '–', 3),
        ];

        children.push(
            new Table({
                rows: infoRows,
                width: { size: 9072, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
            }),
            para('', { spacing: { before: 40, after: 10 } }), // spacer
            // Separator line like PDF
            new Paragraph({
                spacing: { before: 0, after: 60 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
                children: [],
            }),
        );

        // ═══════════════════════════════════════════════════════════════
        //  TABLE 2: Sections 11–15, Standards, Signature
        // ═══════════════════════════════════════════════════════════════
        const bigRows = [];

        // ── 11-12: Procedure & Ref Standard ──
        bigRows.push(new TableRow({
            children: [
                borderCell([
                    para('11. Quy trình hiệu chuẩn:', { fontSize: 10, bold: true, spacing: { before: 60, after: 0 } }),
                    para('Calibration Procedure', { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
                ], { width: COL_W[0] }),
                borderCell([valPara(cert.PROCEDURE || '–')], { width: COL_W[1] }),
                borderCell([
                    para('12. Tiêu chuẩn tham chiếu:', { fontSize: 10, bold: true, spacing: { before: 60, after: 0 } }),
                    para('Reference Standard', { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
                ], { width: COL_W[2] }),
                borderCell([valPara(cert.REF_STANDARD || '–')], { width: COL_W[3] }),
            ]
        }));

        // ── 13: Standards — chỉ hiển thị nếu có dữ liệu (giống preview) ──
        if (standards.length > 0) {
            // Standards header
            bigRows.push(new TableRow({
                children: [
                    borderCell([
                        para('13. Chuẩn sử dụng / Standards Used:', { fontSize: 10, bold: true, spacing: { before: 60, after: 40 } }),
                    ], { width: COL_W[0] + COL_W[1], colSpan: 2 }),
                    borderCell([emptyPara()], { width: COL_W[2] }),
                    borderCell([emptyPara()], { width: COL_W[3] }),
                ]
            }));

            // Standards table header
            bigRows.push(new TableRow({
                children: [
                    borderCell([para('Tên thiết bị chuẩn', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 40, after: 0 } }),
                               para('Standard Name', { fontSize: 10, bold: true, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } })],
                              { shading: SHADING, width: COL_W[0] }),
                    borderCell([para('ID', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER })],
                              { shading: SHADING, width: COL_W[1] }),
                    borderCell([para('Liên kết chuẩn', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 40, after: 0 } }),
                               para('Traceableto', { fontSize: 10, bold: true, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } })],
                              { shading: SHADING, width: COL_W[2] }),
                    borderCell([para('Hiệu lực', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 40, after: 0 } }),
                               para('Due date', { fontSize: 10, bold: true, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } })],
                              { shading: SHADING, width: COL_W[3] }),
                ]
            }));

            // Standards data rows
            standards.forEach(s => {
                bigRows.push(new TableRow({
                    children: [
                        borderCell([para(s.EQ_NAME || '–', { fontSize: 10 })], { width: COL_W[0] }),
                        borderCell([para(s.EQ_CODE || '–', { fontSize: 10 })], { width: COL_W[1] }),
                        borderCell([para(s.LINK || '–', { fontSize: 10, alignment: AlignmentType.CENTER })], { width: COL_W[2] }),
                        borderCell([para(s.VALIDITY || '–', { fontSize: 10, alignment: AlignmentType.CENTER })], { width: COL_W[3] }),
                    ]
                }));
            });
        }

        // ── Spacer row ──
        bigRows.push(new TableRow({
            children: [
                borderCell([emptyPara()], { width: COL_W[0] }),
                borderCell([emptyPara()], { width: COL_W[1] }),
                borderCell([emptyPara()], { width: COL_W[2] }),
                borderCell([emptyPara()], { width: COL_W[3] }),
            ]
        }));

        // ── 14: Place ──
        bigRows.push(new TableRow({
            children: [
                borderCell([
                    para('14. Nơi hiệu chuẩn:', { fontSize: 10, bold: true, spacing: { before: 60, after: 0 } }),
                    para('Place of Calibration', { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
                ], { width: COL_W[0] }),
                borderCell([
                    para(cert.CUSTOMER_NAME || '–', { fontSize: 10, bold: true }),
                    para(cert.CUSTOMER_ADDRESS || '', { fontSize: 10 }),
                ], { width: COL_W[1] + COL_W[2] + COL_W[3], colSpan: 3 }),
            ]
        }));

        // ── 15: Environment ──
        bigRows.push(new TableRow({
            children: [
                borderCell([
                    para('15. Môi trường hiệu chuẩn:', { fontSize: 10, bold: true, spacing: { before: 60, after: 0 } }),
                    para('Calibration Environment', { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
                ], { width: COL_W[0] }),
                borderCell([
                    para('+ Nhiệt độ:', { fontSize: 10, spacing: { before: 60, after: 0 } }),
                    para('Temperature', { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
                ], { width: COL_W[1] }),
                borderCell([
                    para(cert.TEMP_ENV || '–', { fontSize: 10 }),
                ], { width: COL_W[2] }),
                borderCell([
                    para('+ Độ ẩm:', { fontSize: 10, spacing: { before: 60, after: 0 } }),
                    para('Humidity', { fontSize: 10, italics: true, spacing: { before: 0, after: 40 } }),
                ], { width: COL_W[3] }),
            ]
        }));

        // Humidity value row
        bigRows.push(new TableRow({
            children: [
                borderCell([emptyPara()], { width: COL_W[0] }),
                borderCell([emptyPara()], { width: COL_W[1] }),
                borderCell([emptyPara()], { width: COL_W[2] }),
                borderCell([
                    para(cert.HUMI_ENV || '–', { fontSize: 10 }),
                ], { width: COL_W[3] }),
            ]
        }));

        children.push(
            new Table({
                rows: bigRows,
                width: { size: 9072, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
            }),
        );

        // ── Professional Signature Section (outside table) ──
        // Professional signature: uses 2-column borderless table below

        children.push(
            para('', { spacing: { before: 200 } }),
            // Signature table: 2 columns, no border
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    para('PHỤ TRÁCH PHÒNG HIỆU CHUẨN', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 } }),
                                    para('HEAD OF CALIBRATION LAB.', { fontSize: 10, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
                                ],
                                width: { size: 4536, type: WidthType.DXA },
                                verticalAlign: 'center',
                                borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                            }),
                            new TableCell({
                                children: [
                                    para('GIÁM ĐỐC', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 } }),
                                    para('DIRECTOR', { fontSize: 10, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
                                ],
                                width: { size: 4536, type: WidthType.DXA },
                                verticalAlign: 'center',
                                borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                            }),
                        ]
                    }),
                    // Signature line row
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        spacing: { before: 300 },
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({ text: '________________________________________', font, size: 16, color: '555555' }),
                                        ],
                                    }),
                                ],
                                width: { size: 4536, type: WidthType.DXA },
                                verticalAlign: 'center',
                                borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        spacing: { before: 300 },
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({ text: '________________________________________', font, size: 16, color: '555555' }),
                                        ],
                                    }),
                                ],
                                width: { size: 4536, type: WidthType.DXA },
                                verticalAlign: 'center',
                                borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                            }),
                        ]
                    }),
                    // Names row
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    para(cert.HEAD_OF_LAB || '', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
                                ],
                                width: { size: 4536, type: WidthType.DXA },
                                verticalAlign: 'center',
                                borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                            }),
                            new TableCell({
                                children: [
                                    para(cert.DIRECTOR || '', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
                                ],
                                width: { size: 4536, type: WidthType.DXA },
                                verticalAlign: 'center',
                                borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                            }),
                        ]
                    }),
                ],
                width: { size: 9072, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
            }),
        );

        // ── Footer spacer + cert no ──
        children.push(
            para('', { spacing: { before: 240 } }),
            para([
                { text: 'Số giấy chứng nhận / Certificate No.: ', fontSize: 10 },
                { text: certNo, fontSize: 10 },
            ], { alignment: AlignmentType.RIGHT, spacing: { after: 0 } }),
        );

        // ═══════════════════════════════════════════════════════════════
        //  SECTION 16: RESULTS TABLE
        // ═══════════════════════════════════════════════════════════════
        children.push(
            para('16. Kết quả hiệu chuẩn / Calibration Results:', {
                fontSize: 10, bold: true, spacing: { before: 120, after: 60 },
            }),
        );

        // Results header (6 columns matching reference)
        const resHeader = ['Thông số', 'Điểm hiệu chuẩn', 'Giá trị đo được', 'Độ KĐBĐ', 'Dung sai', 'Sự phù hợp', 'Thiết bị chuẩn'];
        const resHeaderEn = ['Parameters', 'Calibration Points', 'As Found Value', 'Uncertainty', 'Tolerance', 'Conformity', 'Std. Equipment'];
        // Widths: scaled to fit A4 page with 2.5cm margins: total 9072
        const resColW = [1500, 1500, 1300, 1200, 1100, 1100, 1372];

        const resRows = [];

        // Header row with teal background matching PDF style
        resRows.push(new TableRow({
            tableHeader: true,
            children: resHeader.map((h, i) =>
                borderCell([
                    para(h, { fontSize: 9, bold: true, alignment: AlignmentType.CENTER, color: 'ffffff', spacing: { before: 40, after: 0 } }),
                    para(resHeaderEn[i], { fontSize: 9, bold: true, italics: true, alignment: AlignmentType.CENTER, color: 'ffffff', spacing: { before: 0, after: 40 } }),
                ], { shading: COL_TEAL, width: resColW[i], vAlign: 'center', margins: { top: 60, bottom: 60, left: 80, right: 120 } })
            )
        }));

        // Data rows
        if (points.length === 0) {
            const emptyCells = resColW.map(w =>
                borderCell([para('Chưa có dữ liệu', { fontSize: 9, alignment: AlignmentType.CENTER })], { width: w })
            );
            resRows.push(new TableRow({ children: emptyCells }));
        } else {
            // Group by PARAMETER_NAME
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
                group.rows.forEach((p, idx) => {
                    const paramCells = idx === 0
                        ? borderCell([
                            para(group.paramName, { fontSize: 9, bold: true, spacing: { before: 40, after: 0 } }),
                        ], { width: resColW[0], vAlign: 'center' })
                        : borderCell([para('', { fontSize: 9 })], { width: resColW[0] });  // empty for continued rows

                    const calPt = String(p.CAL_POINT || p.cal_point || '–');
                    const asFound = String(p.AS_FOUND_VALUE || p.as_found_value || '–');
                    const unc = String(p.UNCERTAINTY || p.uncertainty || '–');
                    const tol = String(p.TOLERANCE || p.tolerance || '–');
                    const conf = String(p.CONFORMITY || p.conformity || '–');
                    const stdEq = String(p.REF_EQUIPMENT || p.STANDARD_EQUIPMENT || p.ref_equipment || p.standard_equipment || '–');

                    resRows.push(new TableRow({
                        children: [
                            paramCells,
                            borderCell([para(calPt, { fontSize: 9, alignment: AlignmentType.CENTER })], { width: resColW[1] }),
                            borderCell([para(asFound, { fontSize: 9, alignment: AlignmentType.CENTER })], { width: resColW[2] }),
                            borderCell([para(unc, { fontSize: 9, alignment: AlignmentType.CENTER })], { width: resColW[3] }),
                            borderCell([para(tol, { fontSize: 9, alignment: AlignmentType.CENTER })], { width: resColW[4] }),
                            borderCell([para(conf, { fontSize: 9, alignment: AlignmentType.CENTER })], { width: resColW[5] }),
                            borderCell([para(stdEq, { fontSize: 9, alignment: AlignmentType.CENTER })], { width: resColW[6] }),
                        ]
                    }));
                });
            }
        }

        children.push(
            new Table({
                rows: resRows,
                width: { size: 9072, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
            }),
        );

        // ═══════════════════════════════════════════════════════════════
        //  SECTION 17: OTHER INFORMATION
        // ═══════════════════════════════════════════════════════════════
        children.push(
            para('', { spacing: { before: 120 } }),
            para('17. Thông tin khác / Other information:', {
                fontSize: 10, bold: true, spacing: { before: 60, after: 60 },
            }),
        );

        children.push(
            para('17.1 Độ không đảm bảo đo / Uncertainty:', {
                fontSize: 10, bold: true, spacing: { before: 40, after: 20 },
            }),
            para([
                { text: 'Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy.', fontSize: 10 },
            ], { spacing: { before: 20, after: 40 } }),
            para([
                { text: 'The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.', fontSize: 10, italics: true, color: '333333' },
            ], { spacing: { before: 0, after: 40 } }),
            para('17.2 Công bố về sự phù hợp / Statements of conformity:', {
                fontSize: 10, bold: true, spacing: { before: 40, after: 20 },
            }),
            para([
                { text: '+ A: ', bold: true, fontSize: 10 },
                { text: 'Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép. ', fontSize: 10 },
                { text: 'Within tolerance.', fontSize: 10, italics: true, color: '333333' },
            ], { spacing: { before: 20, after: 20 } }),
            para([
                { text: '+ B: ', bold: true, fontSize: 10 },
                { text: 'Kết quả đo nằm ngoài giới hạn cho phép. ', fontSize: 10 },
                { text: 'Out of tolerance.', fontSize: 10, italics: true, color: '333333' },
            ], { spacing: { before: 20, after: 20 } }),
            para([
                { text: '+ C: ', bold: true, fontSize: 10 },
                { text: 'Kết quả đo có thể nằm ngoài giới hạn. Không có kết luận. ', fontSize: 10 },
                { text: 'May be out of tolerance. No conclusion.', fontSize: 10, italics: true, color: '333333' },
            ], { spacing: { before: 20, after: 20 } }),
            para([
                { text: '+ D: ', bold: true, fontSize: 10 },
                { text: 'Tiêu chuẩn kỹ thuật không quy định dung sai. ', fontSize: 10 },
                { text: 'No tolerance stated.', fontSize: 10, italics: true, color: '333333' },
            ], { spacing: { before: 20, after: 20 } }),
        );

        // ── Footer ──
        children.push(
            para('', { spacing: { before: 300 } }),
            para('www.labmaster.vn  |  Textile – Footwear – Children Products Safety Tester', {
                fontSize: 8, italics: true, color: COL_GRAY,
                alignment: AlignmentType.CENTER,
            }),
        );

        // ═══════════════════════════════════════════════════════════════
        //  HEADER (Logo + Company Info) giống file mẫu
        // ═══════════════════════════════════════════════════════════════
        const logoPath = path.join(BASE_DIR, '_ref_logo.png');
        let logoData = null;
        try {
            if (fs.existsSync(logoPath)) {
                logoData = fs.readFileSync(logoPath);
            }
        } catch (e) { /* ignore */ }

        const headerTable = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: logoData ? [
                                        new ImageRun({
                                            data: logoData,
                                            transformation: { width: 110, height: 42 },
                                        })
                                    ] : [new TextRun({ text: 'LABMASTER', font: 'Arial', size: 28, bold: true, color: '004d4d' })],
                                })
                            ],
                            width: { size: 1800, type: WidthType.DXA },
                            verticalAlign: 'center',
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    children: [new TextRun({ text: 'Labmaster ST Company Limited', font: 'Arial', size: 28, bold: true })],
                                }),
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    children: [new TextRun({ text: '17 street 179, Tang Nhon Phu ward, Ho Chi Minh city', font: 'Arial', size: 18 })],
                                }),
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    children: [new TextRun({ text: 'Email: sale@labmaster.vn / Phone: (+84) 938 088 239', font: 'Arial', size: 18 })],
                                }),
                            ],
                            width: { size: 6600, type: WidthType.DXA },
                            verticalAlign: 'center',
                            shading: { fill: 'FFFFFF' },
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: qrBuffer ? [
                                        new ImageRun({
                                            data: qrBuffer,
                                            transformation: { width: 80, height: 80 },
                                        })
                                    ] : [new TextRun({ text: '', font: 'Arial', size: 10 })],
                                })
                            ],
                            width: { size: 1346, type: WidthType.DXA },
                            verticalAlign: 'center',
                        }),
                    ]
                }),
            ],
            width: { size: 9746, type: WidthType.DXA },
        });

        // ISO line below header
        const headerChildren = [
            headerTable,
            new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: 'ISO/IEC 17025:2017', font: 'Arial', size: 24, bold: true, color: '000000' })],
                alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
                spacing: { before: 20, after: 0 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '767171' } },
                children: [],
            }),
        ];

        const header = new Header({
            children: headerChildren,
        });

        // ═══════════════════════════════════════════════════════════════
        //  FOOTER
        // ═══════════════════════════════════════════════════════════════
        const footer = new Footer({
            children: [
                new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: 'www.labmaster.vn  |  Textile – Footwear – Children Products Safety Tester', font: 'Arial', size: 16, italics: true, color: '6b6860' })],
                }),
            ],
        });

        // ═══════════════════════════════════════════════════════════════
        //  BUILD DOCUMENT
        // ═══════════════════════════════════════════════════════════════
        const doc = new Document({
            title: `GCN_${cNo}`,
            description: `Giấy Chứng Nhận Hiệu Chuẩn ${cNo}`,
            styles: {
                default: {
                    document: {
                        run: { font, size: 20 },
                        paragraph: { spacing: { after: 60 } },
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        margin: { top: 1260, bottom: 900, left: 1080, right: 1080 },
                        header: { space: 540 },
                        footer: { space: 360 },
                        pageBorders: new PageBorders({
                            top:    { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 12 },
                            right:  { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 12 },
                            bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 12 },
                            left:   { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 12 },
                        })
                    }
                },
                headers: {
                    default: header,
                },
                footers: {
                    default: footer,
                },
                children: children,
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(OUTPUT_FILE, buffer);
        console.log(`[SUCCESS] Đã xuất: GCN_${SAFE_NAME}.docx`);
        // IMPORTANT: Do NOT call process.exit(0) here - it would kill the Express server!
        // Just return normally so the server can send the response.

    } catch (err) {
        console.error('LỖI CRITICAL:', err);
        if (require.main === module) process.exit(1);
        else throw err;
    }
}

module.exports = { generateDocx: main };

if (require.main === module) { main(); }
