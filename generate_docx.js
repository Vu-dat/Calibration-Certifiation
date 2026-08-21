'use strict';

/**
 * generate_docx.js — Tạo file Word (.docx) Giấy Chứng Nhận Hiệu Chuẩn
 * Layout theo mẫu: 1. Crocking Meter.docx (ref_crocking.docx)
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
    Document, Packer, Paragraph, TextRun, Table, TableRow: DocxTableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, PageBorders, PageNumber, PageBreak,
    Header, Footer, ImageRun, VerticalMergeType, HeightRule
} = require('docx');

// Custom TableRow subclass to automatically enforce cantSplit: true by default
class TableRow extends DocxTableRow {
    constructor(options) {
        super({ cantSplit: true, ...options });
    }
}

// ─── Helper: normalize PostgreSQL lowercase column names → uppercase ──
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

// ─── CLI ───────────────────────────────────────────────────────────
const certNo = process.argv[2];
let downloadUrl = process.argv[3] || '';
let equipmentName = process.argv[4] || '';

const BASE_DIR   = __dirname;

// ─── Helper: lấy Base URL công khai (không fallback cứng về localhost) ──
function getPublicBaseUrl() {
    if (process.env.PUBLIC_URL) {
        return process.env.PUBLIC_URL.replace(/\/+$/, '');
    }
    return null;
}

function parseDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
}

// ─── Hard cap: truncate text to maxChars, append '...' if truncated ──
function truncateText(text, maxChars) {
    if (!text) return text;
    const str = String(text);
    if (str.length <= maxChars) return str;
    return str.substring(0, maxChars - 3) + '...';
}

// ─── CONSTANTS ──────────────────────────────────────────────────────
const COL_DARK    = '000000';
const BORDER_NONE = { style: BorderStyle.NONE,   size: 0,  color: 'auto' };
const BORDER_GRID = { style: BorderStyle.SINGLE, size: 4,  color: 'auto' };

const TABLE_BORDER_NONE = {
    top: BORDER_NONE,
    bottom: BORDER_NONE,
    left: BORDER_NONE,
    right: BORDER_NONE,
    insideHorizontal: BORDER_NONE,
    insideVertical: BORDER_NONE,
};
const TABLE_BORDER_GRID = {
    top: BORDER_GRID,
    bottom: BORDER_GRID,
    left: BORDER_GRID,
    right: BORDER_GRID,
    insideHorizontal: BORDER_GRID,
    insideVertical: BORDER_GRID,
};

const font = 'Arial';
let globalT1FontSize = 10;

function txtRun(text, opts = {}) {
    let sizeOpt = opts.fontSize;
    if (sizeOpt === undefined || sizeOpt === 10) {
        sizeOpt = globalT1FontSize;
    } else if (sizeOpt === 11 && globalT1FontSize === 9) {
        sizeOpt = 10;
    }
    return new TextRun({
        text: String(text !== undefined && text !== null ? text : ''),
        font,
        size: sizeOpt * 2,
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COL_DARK,
        break: opts.break, // Support break option
        superScript: opts.superScript || false, // Support superscript option
    });
}

function para(text, opts = {}) {
    const runs = [];
    if (typeof text === 'string') {
        const lines = text.split('\n');
        lines.forEach((line, idx) => {
            runs.push(txtRun(line, idx > 0 ? { ...opts, break: 1 } : opts));
        });
    } else if (Array.isArray(text)) {
        text.forEach((t, tIdx) => {
            if (typeof t === 'string') {
                const lines = t.split('\n');
                lines.forEach((line, idx) => {
                    runs.push(txtRun(line, (idx > 0 || (tIdx > 0 && idx === 0 && t.startsWith('\n'))) ? { ...opts, break: 1 } : opts));
                });
            } else {
                const tText = String(t.text !== undefined && t.text !== null ? t.text : '');
                const tOpts = { ...opts, ...t };
                const lines = tText.split('\n');
                lines.forEach((line, idx) => {
                    runs.push(txtRun(line, (idx > 0 || (tIdx > 0 && idx === 0 && tText.startsWith('\n'))) ? { ...tOpts, break: 1 } : tOpts));
                });
            }
        });
    }
    return new Paragraph({
        children: runs,
        alignment: opts.alignment || AlignmentType.LEFT,
        spacing: opts.spacing || { before: 0, after: 0, line: 276, lineRule: 'auto' },
    });
}

function t1Cell(children, width, colSpan = 1, opts = {}) {
    const finalChildren = Array.isArray(children) ? children : (children ? [children] : []);
    return new TableCell({
        children: finalChildren.length > 0 ? finalChildren : [new Paragraph({})],
        columnSpan: colSpan,
        width: { size: width, type: WidthType.DXA },
        verticalAlign: opts.vAlign || 'center',
        margins: opts.margins || { top: 0, bottom: 0, left: 108, right: 108 },
        shading: opts.shading,
        borders: opts.borders || {
            top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE,
        },
    });
}

function t2Cell(children, width, colSpan = 1, opts = {}) {
    const finalChildren = Array.isArray(children) ? children : (children ? [children] : []);
    return new TableCell({
        children: finalChildren.length > 0 ? finalChildren : [new Paragraph({})],
        columnSpan: colSpan,
        width: { size: width, type: WidthType.DXA },
        verticalAlign: opts.vAlign || 'center',
        verticalMerge: opts.verticalMerge,
        margins: opts.margins || { top: 0, bottom: 0, left: 108, right: 108 },
        borders: opts.borders || {
            top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID
        },
    });
}

// ─── Specifications matcher based on instrument name ───────────────────
function getSpecsForInstrument(instName) {
    const name = (instName || '').toLowerCase();
    if (name.includes('ma sát') || name.includes('crocking') || name.includes('crockmaster')) {
        return {
            range: 'Lực tỳ/Downward force: 9 N\nHành trình/Stroke: 104 mm\nĐường kính đầu ma sát: 16 mm\nFinger Diameter\nTốc độ/Speed: --',
            resolution: '--------'
        };
    } else if (name.includes('giặt') || name.includes('washing') || name.includes('wascator')) {
        return {
            range: 'Nhiệt độ/Temperature: (0 ~ 100) °C\nTốc độ vắt/Spin speed: (0 ~ 1000) rpm\nMực nước/Water level: (0 ~ 300) mm',
            resolution: '--------'
        };
    } else if (name.includes('kéo') || name.includes('tensile') || name.includes('linear')) {
        return {
            range: 'Lực/Force: (0 ~ 5) kN\nHành trình/Stroke: (0 ~ 100) mm',
            resolution: '--------'
        };
    } else if (name.includes('cân') || name.includes('balance') || name.includes('scale')) {
        return {
            range: 'Khối lượng/Mass: (0 ~ 220) g',
            resolution: '0.1 mg'
        };
    } else if (name.includes('nhiệt') || name.includes('thermometer') || name.includes('temperature')) {
        return {
            range: 'Nhiệt độ/Temperature: (-50 ~ 300) °C',
            resolution: '0.01 °C'
        };
    }
    return {
        range: '--------',
        resolution: '--------'
    };
}

function cleanParamName(name) {
    if (!name) return '';
    return String(name)
        .replace(/\(x\)/gi, '')
        .replace(/\(X\)/gi, '')
        .trim();
}

// ─── English translation matcher for Table 2 parameter names ───────────
function formatParamParagraphs(paramName, alignment = AlignmentType.LEFT) {
    const rawName = String(paramName || '');
    
    // 1. Extract unit at the end in parentheses
    let unit = '';
    const unitMatch = rawName.match(/\((mm|rpm|N|g|°C|cpm|mm\/s)\)\s*$/i);
    let raw = rawName;
    if (unitMatch) {
        unit = unitMatch[0];
        raw = raw.substring(0, raw.length - unitMatch[0].length).trim();
    }
    
    // 2. Extract marker (M), (C), or (*)
    let marker = '';
    const markerMatch = raw.match(/\(([MC*])\)/);
    if (markerMatch) {
        marker = markerMatch[0];
        raw = raw.replace(/\(([MC*])\)/g, '').trim();
    }
    
    // 3. Separate Vietnamese and English parts
    let vi = '';
    let en = '';
    
    raw = raw.replace(/\s+/g, ' ').trim();
    if (raw.indexOf('\n') >= 0) {
        const parts = raw.split('\n');
        vi = parts[0].trim();
        en = parts[1].trim();
    } else {
        // Match known parameter translations if not split by newline
        const lower = raw.toLowerCase();
        if (lower.includes('hành trình') || lower.includes('stroke')) {
            vi = 'Hành trình ma sát';
            en = 'Stroke length';
        } else if (lower.includes('đường kính') || lower.includes('finger')) {
            vi = 'Đường kính đầu ma sát';
            en = 'Finger diameter';
        } else if (lower.includes('lực tỳ') || lower.includes('downward force')) {
            vi = 'Lực tỳ lên mẫu';
            en = 'Downward Force';
        } else if (lower.includes('tốc độ vắt') || lower.includes('spin speed')) {
            vi = 'Tốc độ vắt';
            en = 'Spin speed';
        } else if (lower.includes('tốc độ') || lower.includes('speed')) {
            vi = 'Tốc độ';
            en = 'Speed';
        } else if (lower.includes('bộ đếm') || lower.includes('counter')) {
            vi = 'Bộ đếm';
            en = 'Counter';
        } else if (lower.includes('mực nước') || lower.includes('water level')) {
            vi = 'Mực nước';
            en = 'Water level';
        } else if (lower.includes('nhiệt độ') || lower.includes('temperature')) {
            vi = 'Nhiệt độ';
            en = 'Temperature';
        } else {
            vi = raw;
            en = '';
        }
    }
    
    const paras = [];
    
    // Paragraph 1: Vietnamese + marker (superscript)
    const viRuns = [txtRun(vi, { fontSize: 10 })];
    if (marker) {
        viRuns.push(txtRun(marker, { fontSize: 10, superScript: true }));
    }
    paras.push(new Paragraph({ children: viRuns, alignment, spacing: { before: 0, after: 0 } }));
    
    // Paragraph 2: English (italics)
    if (en) {
        paras.push(new Paragraph({
            children: [txtRun(en, { fontSize: 10, italics: true })],
            alignment,
            spacing: { before: 0, after: 0 }
        }));
    }
    
    // Paragraph 3: Unit
    if (unit) {
        paras.push(new Paragraph({
            children: [txtRun(unit, { fontSize: 10 })],
            alignment,
            spacing: { before: 0, after: 0 }
        }));
    }
    
    return paras;
}

// Helper to get exact row heights for calibration parameters
function getRowHeightForParam(paramName) {
    const name = (paramName || '').toLowerCase();
    if (name.includes('hành trình') || name.includes('stroke')) return 767;
    if (name.includes('đường kính') || name.includes('finger')) return 693;
    if (name.includes('tốc độ') || name.includes('speed')) return 634;
    if (name.includes('bộ đếm') || name.includes('counter')) return 695;
    return null;
}

// Helper to safely parse and return array of sub-values from slash-separated string
function getSubValues(valStr, count, defaultVal = '') {
    if (!valStr) return Array(count).fill(defaultVal);
    const parts = String(valStr).split('/').map(s => s.trim());
    if (parts.length === 1) return Array(count).fill(parts[0]);
    const res = [];
    for (let i = 0; i < count; i++) {
        res.push(parts[i] !== undefined ? parts[i] : defaultVal);
    }
    return res;
}

function createHeaderTable1(logoData, qrBuffer = null) {
    return new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: logoData ? [
                                    new ImageRun({ data: logoData, type: 'png', transformation: { width: 130, height: 57 } })
                                ] : [new TextRun({ text: 'LABMASTER', font: 'Arial', size: 28, bold: true, color: '008080' })],
                                spacing: { before: 0, after: 0 }
                            }),
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [new TextRun({ text: 'ISO/IEC 17025:2017', font: 'Arial', size: 20, bold: false, color: '000000' })],
                                spacing: { before: 20, after: 0 }
                            })
                        ],
                        width: { size: 2547, type: WidthType.DXA },
                        verticalAlign: 'center',
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'LabMaster ST Co., Ltd', font: 'Arial', size: 32, bold: true, color: '000000' })],
                                spacing: { before: 0, after: 0 }
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'No.17 street 179, Tang Nhon Phu ward, HCMC', font: 'Arial', size: 18, color: '000000' })],
                                spacing: { before: 20, after: 0 }
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'Email: sale@labmaster.vn/ Phone: (+84) 938 088 239', font: 'Arial', size: 20, color: '000000' })],
                                spacing: { before: 20, after: 0 }
                            })
                        ],
                        width: { size: 5953, type: WidthType.DXA },
                        verticalAlign: 'center',
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    }),
                    new TableCell({
                        children: qrBuffer ? [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new ImageRun({ data: qrBuffer, type: 'png', transformation: { width: 80, height: 80 } })],
                                spacing: { before: 0, after: 0 }
                            })
                        ] : [new Paragraph({ children: [] })],
                        width: { size: 1957, type: WidthType.DXA },
                        verticalAlign: 'center',
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    })
                ]
            })
        ],
        width: { size: 10457, type: WidthType.DXA },
        columnWidths: [2547, 5953, 1957],
        alignment: AlignmentType.CENTER,
        borders: TABLE_BORDER_NONE
    });
}

function createHeaderTable2(cNo, calDate) {
    // Calculate font size dynamically to prevent overflow / wrapping of Certificate No.
    // Default size is 20 (10pt). Co font size down if it is long.
    let fontSize = 20;
    if (cNo && cNo.length > 8) {
        fontSize = Math.max(11, 20 - (cNo.length - 8) * 1.0);
    }
    fontSize = Math.round(fontSize);

    return new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [new TextRun({ text: 'Số GCN/Certificate No:', font: 'Arial' })],
                                spacing: { before: 60, after: 0, line: 276, lineRule: 'auto' }
                            })
                        ],
                        width: { size: 4000, type: WidthType.DXA },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [new TextRun({ text: cNo, font: 'Arial', size: fontSize, bold: true })],
                                spacing: { before: 60, after: 0, line: 276, lineRule: 'auto' }
                            })
                        ],
                        width: { size: 2000, type: WidthType.DXA },
                        noWrap: true,
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [new TextRun({ text: 'Ngày cấp/Date of issue:', font: 'Arial' })],
                                spacing: { before: 60, after: 0, line: 276, lineRule: 'auto' }
                            })
                        ],
                        width: { size: 2400, type: WidthType.DXA },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [new TextRun({ text: parseDate(calDate || ''), font: 'Arial', bold: true })],
                                spacing: { before: 60, after: 0, line: 276, lineRule: 'auto' }
                            })
                        ],
                        width: { size: 2815, type: WidthType.DXA },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE }
                    })
                ]
            })
        ],
        width: { size: 11215, type: WidthType.DXA },
        columnWidths: [4000, 2000, 2400, 2815],
        indent: { size: -289, type: WidthType.DXA },
        alignment: AlignmentType.CENTER,
        borders: TABLE_BORDER_NONE
    });
}

// ─── MAIN ──────────────────────────────────────────────────────────
async function main(opts) {
    try {
        const cNo = (opts && opts.certNo) || certNo;
        if (!cNo) {
            if (require.main === module) { console.error('Lỗi: node generate_docx.js <CERT_NO> [download_url]'); process.exit(1); }
            else throw new Error('Lỗi: node generate_docx.js <CERT_NO> [download_url]');
        }
        
        const dUrl = (opts && opts.downloadUrl) || downloadUrl || '';
        const eqName = (opts && opts.equipmentName) || equipmentName || '';
        const accMethods = (opts && opts.accreditedMethods) || []; // danh sách máy/phép thử được công nhận (STT + tên + mã QT)
        let finalDUrl = dUrl;
        if (!finalDUrl) {
            const baseUrl = getPublicBaseUrl();
            if (baseUrl) {
                const safeName = cNo.replace(/[^a-zA-Z0-9]/g, '_');
                finalDUrl = baseUrl + (process.env.VERCEL ? '/api/static/' : '/static/') + 'GCN_' + safeName + '.docx';
            } else {
                const errMsg = 'Thiếu downloadUrl và PUBLIC_URL — không thể tạo QR download hợp lệ. Vui lòng set biến môi trường PUBLIC_URL hoặc truyền downloadUrl.';
                if (require.main === module) { console.error('LỖI: ' + errMsg); process.exit(1); }
                else throw new Error(errMsg);
            }
        }
        
        const STATIC_DIR = process.env.VERCEL ? require('os').tmpdir() : path.join(BASE_DIR, 'static');
        if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });
        const SAFE_NAME   = cNo.replace(/[^a-zA-Z0-9]/g, '_');
        const OUTPUT_FILE = path.join(STATIC_DIR, `GCN_${SAFE_NAME}.docx`);
        
        let cert = await dbGet(`SELECT * FROM CERTIFICATES WHERE CERT_NO = ?`, [cNo]);
        if (!cert) {
            const errMsg = 'Lỗi: Không tìm thấy dữ liệu cho mã [' + cNo + '].';
            if (require.main === module) { console.error(errMsg); process.exit(1); }
            else throw new Error(errMsg);
        }
        cert = toUpperKeys(cert);

        let tpl = null;
        if (eqName) {
            tpl = await dbGet(`SELECT * FROM EQUIPMENT_TEMPLATES WHERE NAME = ?`, [eqName]);
        }
        if (!tpl) {
            let cleanName = (cert.INSTRUMENT_NAME || '').replace(/[\s_]+/g, ' ').replace(/ thử/gi, '').trim();
            tpl = await dbGet(`SELECT * FROM EQUIPMENT_TEMPLATES WHERE NAME = ? OR NAME_VI = ? OR NAME = ? OR REPLACE(NAME_VI, ' thử', '') = ?`, [cert.INSTRUMENT_NAME, cert.INSTRUMENT_NAME, cert.INSTRUMENT_NAME_EN, cleanName]);
        }
        if (tpl) tpl = toUpperKeys(tpl);

        let specRange = '';
        let specResolution = '';
        if (cert && cert.SPEC_RANGE) {
            specRange = cert.SPEC_RANGE;
            specResolution = cert.SPEC_RESOLUTION || '--------';
        } else if (tpl && tpl.SPEC_RANGE) {
            specRange = tpl.SPEC_RANGE;
            specResolution = tpl.SPEC_RESOLUTION || '--------';
        } else {
            const specsDefault = getSpecsForInstrument(cert.INSTRUMENT_NAME);
            specRange = specsDefault.range;
            specResolution = specsDefault.resolution;
        }
        const specs = {
            range: specRange,
            resolution: specResolution
        };

        let points;
        if (eqName) {
            points = await dbAll(`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? AND EQUIPMENT_NAME = ? ORDER BY ID ASC`, [cNo, eqName]);
        } else {
            points = await dbAll(`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC`, [cNo]);
        }
        points = toUpperKeys(points);
        const standards = toUpperKeys(await dbAll(`SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC`, [cNo]));

        // Generate QR code if download URL provided
        let qrBuffer = null;
        if (finalDUrl) {
            try {
                qrBuffer = await QRCode.toBuffer(finalDUrl, { width: 120, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
            } catch(e) { /* ignore QR errors */ }
        }

        // ═══════════════════════════════════════════════════════════════
        //  LOAD LOGO AND ACCREDITATION (VILAS) IMAGES
        // ═══════════════════════════════════════════════════════════════
                const logoPath = path.join(BASE_DIR, 'public', 'img', 'logo_240.png');
        let logoData = null;
        try {
            if (fs.existsSync(logoPath)) {
                logoData = fs.readFileSync(logoPath);
            }
        } catch (e) { /* ignore */ }

        // ═══════════════════════════════════════════════════════════════
        //  HEADER — dùng 1 header chung cho mọi trang (Có QR)
        // ═══════════════════════════════════════════════════════════════
        function createHeaderChildren(logoData, qrBuffer = null) {
            return [
                createHeaderTable1(logoData, qrBuffer),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: 'GIẤY CHỨNG NHẬN HIỆU CHUẨN – ĐO LƯỜNG',
                            font: 'Arial',
                            size: 32,
                            bold: true,
                            color: '008080'
                        })
                    ],
                    spacing: { after: 0, line: 276, lineRule: 'auto' }
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: 'CERTIFICATE OF CALIBRATION – MEASUREMENT',
                            font: 'Arial',
                            size: 24,
                            bold: true,
                            color: '008080'
                        })
                    ],
                    spacing: { after: 0, line: 276, lineRule: 'auto' }
                }),
                new Paragraph({
                    spacing: { after: 0, line: 276, lineRule: 'auto' }
                }),
                createHeaderTable2(cNo, cert.CAL_DATE),
                new Paragraph({})
            ];        }

        const headerCommon = new Header({
            children: createHeaderChildren(logoData, qrBuffer)
        });

        // ═══════════════════════════════════════════════════════════════
        //  FOOTER
        // ═══════════════════════════════════════════════════════════════
        // Footer (giống file mẫu: bảng 3 cột không border + 1 line ngang bên dưới)
        const footerLineBorder = { style: BorderStyle.SINGLE, size: 4, color: '7F7F7F' };
        const footer = new Footer({
            children: [
                new Table({
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.LEFT,
                                            children: [
                                                new TextRun({
                                                    text: 'www.labmaster.vn',
                                                    font: 'Arial',
                                                    size: 22,
                                                    italics: true,
                                                })
                                            ],
                                            spacing: { before: 0, after: 0 }
                                        })
                                    ],
                                    width: { size: 2547, type: WidthType.DXA },
                                    borders: TABLE_BORDER_NONE
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.LEFT,
                                            children: [
                                                new TextRun({
                                                    text: 'Textile – Footwear – Leather - Children product Safety Tester',
                                                    font: 'Arial',
                                                    size: 20,
                                                    italics: true,
                                                })
                                            ],
                                            spacing: { before: 0, after: 0 }
                                        })
                                    ],
                                    width: { size: 5812, type: WidthType.DXA },
                                    borders: TABLE_BORDER_NONE
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: [
                                                new TextRun({
                                                    text: 'Trang/Page: ',
                                                    font: 'Arial',
                                                    size: 20,
                                                }),
                                                new TextRun({
                                                    children: [PageNumber.CURRENT],
                                                    font: 'Arial',
                                                    size: 20,
                                                }),
                                                new TextRun({
                                                    text: ' / ',
                                                    font: 'Arial',
                                                    size: 20,
                                                }),
                                                new TextRun({
                                                    children: [PageNumber.TOTAL_PAGES],
                                                    font: 'Arial',
                                                    size: 20,
                                                })
                                            ],
                                            spacing: { before: 0, after: 0 }
                                        })
                                    ],
                                    width: { size: 2098, type: WidthType.DXA },
                                    borders: TABLE_BORDER_NONE
                                })
                            ]
                        })
                    ],
                    width: { size: 10457, type: WidthType.DXA },
                    columnWidths: [2547, 5812, 2098],
                    alignment: AlignmentType.CENTER,
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: '7F7F7F' },
                        bottom: BORDER_NONE,
                        left: BORDER_NONE,
                        right: BORDER_NONE,
                        insideHorizontal: BORDER_NONE,
                        insideVertical: BORDER_NONE,
                    }
                })
            ]
        });

        // ═══════════════════════════════════════════════════════════════
        //  BODY CHILDREN — Trang 1: letterhead (logo + company + QR to 80x80)
        //  TRONG BODY (không phải Header) để QR chỉ xuất hiện 1 lần duy nhất
        //  Header trang 1 để rỗng (titlePage), Header trang 2+ có letterhead không QR
        // ═══════════════════════════════════════════════════════════════
                const children = [];

        // Determine instDisplay early for dynamic line estimation
        let instVi = (tpl && tpl.NAME_VI) ? tpl.NAME_VI : (cert.INSTRUMENT_NAME || '–');
        let instEn = cert.INSTRUMENT_NAME_EN || '';
        if (instEn.toLowerCase().includes('crocking') || instEn.toLowerCase().includes('rubbing') || instEn.toLowerCase().includes('crock')) {
            instEn = 'Crocking meter';
        }
        if (!instEn && tpl && tpl.NAME) {
            instEn = (tpl.NAME.toLowerCase().includes('crocking') || tpl.NAME.toLowerCase().includes('rubbing') || tpl.NAME.toLowerCase().includes('crock')) ? 'Crocking meter' : tpl.NAME;
        }
        if (!instEn && instVi.toLowerCase().includes('bền màu ma sát')) {
            instEn = 'Crocking meter';
        }

        // ─── DYNAMIC SPACER AND FONT SIZE CALCULATION FOR TABLE 1 ───
        // HARD CAP: truncate variable-length fields to prevent overflow
        const MAX_NAME_LEN = 200;    // Customer name ~200 chars
        const MAX_ADDR_LEN = 300;    // Customer address ~300 chars
        const MAX_INST_LEN = 150;    // Instrument name ~150 chars
        const MAX_PROC_LEN = 300;    // Procedure ~300 chars
        const MAX_REF_LEN  = 200;    // Ref standard ~200 chars
        const MAX_STD_LEN  = 100;    // Standard eq name ~100 chars

        const nameText = truncateText(cert.CUSTOMER_NAME || '', MAX_NAME_LEN);
        const addressText = truncateText(cert.CUSTOMER_ADDRESS || '', MAX_ADDR_LEN);
        const displayInstVi = truncateText(instVi, MAX_INST_LEN);
        const displayInstEn = truncateText(instEn, MAX_INST_LEN);
        const specsTemp = specs;
        const specRangeText = specsTemp.range || '';
        const procedureText = truncateText(cert.PROCEDURE || '', MAX_PROC_LEN);
        const refStandardText = truncateText(cert.REF_STANDARD || '', MAX_REF_LEN);

        // Truncate standards names too
        for (let i = 0; i < standards.length; i++) {
            if (standards[i]) {
                standards[i].EQ_NAME = truncateText(standards[i].EQ_NAME, MAX_STD_LEN);
            }
        }

        // Vì dữ liệu đã được hard cap (truncate), dùng fixed safe spacerHeight
        // và 10pt font mặc định cho Table 1 — không cần heuristic tính toán không đáng tin
        let spacerHeight = 800; // fixed safe spacer after signee headers
        let currentFontSize = 10;

        // Also apply the truncation to actual display data used in Table 1 cells
        // (These are truncated versions for display)
        const displayCustomerName = nameText;
        const displayCustomerAddress = addressText;
        const displayProcedure = procedureText;
        const displayRefStandard = refStandardText;

        // Apply dynamic font size to Table 1 elements
        globalT1FontSize = currentFontSize;

        // ─── TABLE 1: Information, Specifications, Standards Used, and Signatures ───
        const t1Rows = [];

        // Row 1: Customer Name & Address
        t1Rows.push(new TableRow({
            height: { value: 979, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('1. Khách hàng:', { fontSize: 10 }),
                    para('Customer', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para(displayCustomerName, { fontSize: 10, bold: true }),
                    para(displayCustomerAddress, { fontSize: 10, bold: true }),
                ], 9072, 13),
            ]
        }));

        // Row 2: Instrument Name
        t1Rows.push(new TableRow({
            height: { value: 695, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('2. Tên thiết bị:', { fontSize: 10 }),
                    para('Instrument', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para(displayInstVi, { fontSize: 10, bold: true }),
                    displayInstEn ? para(displayInstEn, { fontSize: 10, bold: true, italics: true }) : null,
                ].filter(Boolean), 9072, 13),
            ]
        }));

        // Row 3: Manufacturer and Model
        t1Rows.push(new TableRow({
            height: { value: 558, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('3. Nhà sản xuất:', { fontSize: 10 }),
                    para('Manufacturer', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para(cert.MANUFACTURER || '–', { fontSize: 10 }),
                ], 4536, 6),
                t1Cell([
                    para('5. Kiểu:', { fontSize: 10 }),
                    para('Model', { fontSize: 10, italics: true }),
                ], 1838, 2),
                t1Cell([
                    para(cert.MODEL || '–', { fontSize: 10 }),
                ], 2698, 5),
            ]
        }));

        // Row 4: ID and Serial Number
        t1Rows.push(new TableRow({
            height: { value: 650, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('4. Mã quản lý ID', { fontSize: 10 }),
                ], 2132, 2),
                t1Cell([
                    para(cert.EQUIPMENT_ID || '–', { fontSize: 10 }),
                ], 4536, 6),
                t1Cell([
                    para('6. Số sản xuất:', { fontSize: 10 }),
                    para('Serial No.', { fontSize: 10, italics: true }),
                ], 1838, 2),
                t1Cell([
                    para(cert.SERIAL_NUMBER || '–', { fontSize: 10 }),
                ], 2698, 5),
            ]
        }));

        // Row 5: Specifications Headers
        t1Rows.push(new TableRow({
            height: { value: 510, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('7. Đặc trưng kĩ thuật', { fontSize: 10 }),
                    para('Specification', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para([
                        { text: 'Phạm vi đo: ', fontSize: 10 },
                        { text: 'Range', fontSize: 10, italics: true },
                    ]),
                ], 2835, 3),
                t1Cell([], 1418, 2), // empty Resolution cell matching the reference!
                t1Cell([
                    para('8. Quy trình thực hiện', { fontSize: 10 }),
                    para('Procedure', { fontSize: 10, italics: true }),
                ], 2268, 4),
                t1Cell([
                    para('9. Tiêu chuẩn tham khảo', { fontSize: 10 }),
                    para('Reference Standard', { fontSize: 10, italics: true }),
                ], 2551, 4),
            ]
        }));

        // Row 6: Specifications Values
        const rangeLabelsParas = [];
        const rangeValuesParas = [];
        
        specs.range.split('\n').forEach(line => {
            const lineStr = line.trim();
            if (!lineStr) return;
            
            if (lineStr.includes(':')) {
                const colonIdx = lineStr.indexOf(':');
                const labelPart = lineStr.substring(0, colonIdx).trim();
                const valuePart = lineStr.substring(colonIdx + 1).trim();
                
                if (labelPart.includes('/')) {
                    const parts = labelPart.split('/');
                    rangeLabelsParas.push(para([
                        { text: parts[0] + '/', fontSize: 9 },
                        { text: parts[1], fontSize: 9, italics: true },
                        { text: ':', fontSize: 9 }
                    ]));
                } else {
                    rangeLabelsParas.push(para(labelPart + ':', { fontSize: 9 }));
                }
                rangeValuesParas.push(para(valuePart.replace(/\s+/g, '\u00A0'), { fontSize: 9 }));
            } else {
                const isEn = /^[A-Za-z\s\(\)]+$/.test(lineStr);
                rangeLabelsParas.push(para(lineStr, { fontSize: 9, italics: isEn }));
                rangeValuesParas.push(para('', { fontSize: 9 }));
            }
        });
        
        let procParas;
        if (accMethods && accMethods.length) {
            procParas = accMethods.map(m => para(
                (m.stt != null ? m.stt + '. ' : '') + (m.tenVn || '') + (m.tenEn ? ' (' + m.tenEn + ')' : '') + (m.quyTrinh ? ' — QT: ' + m.quyTrinh : ''),
                { fontSize: 9 }
            ));
        } else {
            const procLines = (displayProcedure || '').indexOf('\n') >= 0 
                ? (displayProcedure || '').split('\n')
                : (displayProcedure || '–').split(/[,;]+/);
            procParas = procLines.map(line => para(line.trim() || '–', { fontSize: 9 }));
        }

        const refLines = (displayRefStandard || '').indexOf('\n') >= 0 
            ? (displayRefStandard || '').split('\n')
            : (displayRefStandard || '–').split(/[,;]+/);
        const refParas = refLines.map(line => para(line.trim() || '–', { fontSize: 10 }));

        const resLines = (specs.resolution || '').indexOf('\n') >= 0 
            ? (specs.resolution || '').split('\n')
            : (specs.resolution || '').split(/[,;]+/);
        const resolutionParas = resLines.map(line => {
            const trimLine = line.trim();
            return para((trimLine === '--------' || !trimLine) ? '' : trimLine, { fontSize: 9 });
        });

        t1Rows.push(new TableRow({
            // AT_LEAST: hàng tự nở để chứa danh sách máy/phép thử được công nhận (tối đa 4)
            height: { value: 1200, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([], 2132, 2), // spacer
                t1Cell(rangeLabelsParas, 2126, 1, { margins: { top: 0, bottom: 0, left: 108, right: 0 } }),
                t1Cell(rangeValuesParas, 709, 2, { margins: { top: 0, bottom: 0, left: 0, right: 0 } }),
                t1Cell(resolutionParas, 1418, 2),
                t1Cell(procParas, 2268, 4),
                t1Cell(refParas, 2551, 4),
            ]
        }));

        // Row 7: Place of Performance
        t1Rows.push(new TableRow({
            height: { value: 1033, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('11. Nơi thực hiện:', { fontSize: 10 }),
                    para('Place of Performance', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para(displayCustomerName, { fontSize: 10, bold: true }),
                    para(displayCustomerAddress, { fontSize: 10, bold: true }),
                ], 9072, 13),
            ]
        }));

        // Row 8: Calibration Date & Next Calibration Date
        t1Rows.push(new TableRow({
            height: { value: 848, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('12. Ngày thực hiện:', { fontSize: 10 }),
                    para('Date of performance', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para(parseDate(cert.CAL_DATE || ''), { fontSize: 10, bold: true }),
                ], 4536, 6),
                t1Cell([
                    para('13. Ngày thực hiện tiếp theo:', { fontSize: 10 }),
                    para('Date of next performance', { fontSize: 10, italics: true }),
                ], 2830, 5),
                t1Cell([
                    para(parseDate(cert.RE_CAL_DATE || ''), { fontSize: 10, bold: true }),
                ], 1706, 2),
            ]
        }));

        // Row 9: Environment Conditions
        t1Rows.push(new TableRow({
            height: { value: 849, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para('14. Điều kiện môi trường :', { fontSize: 10 }),
                    para('Environment', { fontSize: 10, italics: true }),
                ], 2132, 2),
                t1Cell([
                    para('Nhiệt độ: ', { fontSize: 10 }),
                    para('Temperature', { fontSize: 10, italics: true }),
                ], 2263, 1),
                t1Cell([
                    para(cert.TEMP_ENV || '–', { fontSize: 10 }),
                ], 2273, 5),
                t1Cell([
                    para('Độ ẩm: ', { fontSize: 10 }),
                    para('Humidity', { fontSize: 10, italics: true }),
                ], 1838, 2),
                t1Cell([
                    para(cert.HUMI_ENV || '–', { fontSize: 10, bold: true }), // Humidity is bold in the reference
                ], 2698, 5),
            ]
        }));

        // Row 10: Standards Used Header Label
        t1Rows.push(new TableRow({
            height: { value: 378, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([
                    para([
                        { text: '15. Chuẩn sử dụng / ', fontSize: 10 },
                        { text: 'Standards Used :', fontSize: 10, italics: true },
                    ]),
                ], 11204, 15),
            ]
        }));

        // Row 11: Standards Column Headers
        t1Rows.push(new TableRow({
            children: [
                t1Cell([
                    para('Tên thiết bị', { fontSize: 10 }),
                    para('Name of Standard', { fontSize: 10, italics: true }),
                ], 2132, 2, { shading: { fill: 'F2F2F2' } }),
                t1Cell([
                    para('Số quản lý', { fontSize: 10 }),
                    para('ID', { fontSize: 10, italics: true }),
                ], 2349, 2, { shading: { fill: 'F2F2F2' } }),
                t1Cell([
                    para('Số chứng nhận', { fontSize: 10 }),
                    para('Certificate No.', { fontSize: 10, italics: true }),
                ], 2241, 5, { shading: { fill: 'F2F2F2' } }),
                t1Cell([
                    para('Liên kết chuẩn', { fontSize: 10 }),
                    para('Traceable to', { fontSize: 10, italics: true }),
                ], 2241, 3, { shading: { fill: 'F2F2F2' } }),
                t1Cell([
                    para('Hiệu lực', { fontSize: 10 }),
                    para('Due date', { fontSize: 10, italics: true }),
                ], 2241, 3, { shading: { fill: 'F2F2F2' } }),
            ]
        }));

        // Row 12-17: Standards Data Rows (show only rows with data)
        const stdDataRows = standards.filter(s => s && (s.EQ_NAME || s.EQ_CODE));
        const stdRowCount = Math.max(stdDataRows.length, 1);
        for (let idx = 0; idx < stdRowCount; idx++) {
            const std = stdDataRows[idx];
            t1Rows.push(new TableRow({
                children: [
                    t1Cell(std ? para(std.EQ_NAME || '', { fontSize: 10 }) : [], 2132, 2),
                    t1Cell(std ? para(std.EQ_CODE || '', { fontSize: 10 }) : [], 2349, 2),
                    t1Cell(std ? para(std.STD_CERT_NO || '', { fontSize: 10 }) : [], 2241, 5), // Certificate No
                    t1Cell(std ? para(std.LINK || '', { fontSize: 10 }) : [], 2241, 3), // Traceable to
                    t1Cell(std ? para(parseDate(std.VALIDITY) || '', { fontSize: 10 }) : [], 2241, 3), // Due date
                ]
            }));
        }

        // Spacing spacer between standards used table and signature block (300 dxa = ~15pt)
        t1Rows.push(new TableRow({
            height: { value: 300, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([], 11483, 15)
            ]
        }));

        // Row 18: Signatures Header
        t1Rows.push(new TableRow({
            children: [
                t1Cell([], 289, 1),
                t1Cell([
                    para('PHỤ TRÁCH PHÒNG HIỆU CHUẨN', { fontSize: 11, bold: true, alignment: AlignmentType.CENTER }),
                    para('HEAD OF CALIBRATION LAB.', { fontSize: 11, bold: true, alignment: AlignmentType.CENTER }),
                ], 5228, 5, { vAlign: 'center' }),
                t1Cell([
                    para('GIÁM ĐỐC', { fontSize: 11, bold: true, alignment: AlignmentType.CENTER }),
                    para('DIRECTOR', { fontSize: 11, bold: true, alignment: AlignmentType.CENTER }),
                ], 5229, 8, { vAlign: 'center' }),
                t1Cell([], 458, 1),
            ]
        }));

        // Row 19: Signature Spacing (Empty row with at-least height to prevent overflow)
        t1Rows.push(new TableRow({
            height: { value: 1500, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([], 289, 1),
                t1Cell([
                    para('', { spacing: { before: 0, after: 0, line: 276, lineRule: 'auto' } }),
                ], 5228, 5),
                t1Cell([
                    para('', { spacing: { before: 0, after: 0, line: 276, lineRule: 'auto' } }),
                ], 5229, 8),
                t1Cell([], 458, 1),
            ]
        }));

        // Row 20: Signee Names
        t1Rows.push(new TableRow({
            height: { value: 278, rule: HeightRule.AT_LEAST },
            children: [
                t1Cell([], 289, 1),
                t1Cell([
                    para(cert.HEAD_OF_LAB || '', { fontSize: 11, bold: true, alignment: AlignmentType.CENTER }),
                ], 5228, 5),
                t1Cell([
                    para(cert.DIRECTOR || '', { fontSize: 11, bold: true, alignment: AlignmentType.CENTER }),
                ], 5229, 8),
                t1Cell([], 458, 1),
            ]
        }));

        // Assemble Table 1
        children.push(
            new Table({
                rows: t1Rows,
                width: { size: 11204, type: WidthType.DXA },
                columnWidths: [289, 1843, 2126, 223, 486, 550, 868, 283, 54, 1784, 147, 310, 535, 1248, 458],
                indent: { size: -289, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
                borders: TABLE_BORDER_NONE
            })
        );

        // Reset global font size to default 10pt for Table 2 and subsequent tables
        globalT1FontSize = 10;

        // Explicit PageBreak after Table 1 (signatures) to match reference document
        children.push(new Paragraph({ children: [new PageBreak()] }));

        children.push(
            new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({ text: '16. Kết quả/ ', font: 'Arial', size: 20, bold: true }),
                    new TextRun({ text: 'Results:', font: 'Arial', size: 20, bold: true, italics: true }),
                ],
                spacing: { after: 0, line: 276, lineRule: 'auto' }
            })
        );

        // ─── TABLE 2: Calibration Results Table ───
        const t2Rows = [];

        // Table 2 Row 1 (Header)
        t2Rows.push(new TableRow({
            height: { value: 770, rule: HeightRule.EXACT },
            tableHeader: true,
            children: [
                new TableCell({
                    children: [
                        para('Thông số', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 } }),
                        para('Parameter', { fontSize: 10, bold: true, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
                    ],
                    columnSpan: 2,
                    width: { size: 3121, type: WidthType.DXA },
                    verticalAlign: 'center',
                    borders: { top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID }
                }),
                new TableCell({
                    children: [
                        para([
                          { text: 'Giá trị đo được ', bold: true, fontSize: 10 },
                          { text: 'As found value', bold: true, italics: true, fontSize: 10 }
                        ], { alignment: AlignmentType.CENTER })
                    ],
                    width: { size: 1855, type: WidthType.DXA },
                    verticalAlign: 'center',
                    borders: { top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID }
                }),
                new TableCell({
                    children: [
                        para([
                          { text: 'ĐKĐBĐ ', bold: true, fontSize: 10 },
                          { text: 'Uncertainty', bold: true, italics: true, fontSize: 10 }
                        ], { alignment: AlignmentType.CENTER })
                    ],
                    width: { size: 1712, type: WidthType.DXA },
                    verticalAlign: 'center',
                    borders: { top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID }
                }),
                new TableCell({
                    children: [
                        para('Giá trị tham chiếu', { fontSize: 10, bold: true, alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 } }),
                        para('Reference Value', { fontSize: 10, bold: true, italics: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
                    ],
                    columnSpan: 2,
                    width: { size: 1918, type: WidthType.DXA },
                    verticalAlign: 'center',
                    borders: { top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID }
                }),
                new TableCell({
                    children: [
                        para([
                          { text: 'Dung sai ', bold: true, fontSize: 10 },
                          { text: 'Tolerance', bold: true, italics: true, fontSize: 10 }
                        ], { alignment: AlignmentType.CENTER })
                    ],
                    columnSpan: 2,
                    width: { size: 1199, type: WidthType.DXA },
                    verticalAlign: 'center',
                    borders: { top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID }
                }),
                new TableCell({
                    children: [
                        para([
                          { text: 'Kết luận ', bold: true, fontSize: 10 },
                          { text: 'Conclusion', bold: true, italics: true, fontSize: 10 }
                        ], { alignment: AlignmentType.CENTER })
                    ],
                    width: { size: 1261, type: WidthType.DXA },
                    verticalAlign: 'center',
                    borders: { top: BORDER_GRID, bottom: BORDER_GRID, left: BORDER_GRID, right: BORDER_GRID }
                })
            ]
        }));

        // Table 2 Data Rows
        if (points.length === 0) {
            t2Rows.push(new TableRow({
                children: [
                    t2Cell(para('Chưa có dữ liệu', { fontSize: 10, alignment: AlignmentType.CENTER }), 3121, 2),
                    t2Cell(para('–', { fontSize: 10, alignment: AlignmentType.CENTER }), 1855, 1),
                    t2Cell(para('–', { fontSize: 10, alignment: AlignmentType.CENTER }), 1712, 1),
                    t2Cell(para('–', { fontSize: 10, alignment: AlignmentType.CENTER }), 1918, 2),
                    t2Cell(para('–', { fontSize: 10, alignment: AlignmentType.CENTER }), 1199, 2),
                    t2Cell(para('–', { fontSize: 10, alignment: AlignmentType.CENTER }), 1261, 1),
                ]
            }));
        } else {
            // Pre-process and expand slash values in calibration points
            const expandedPoints = [];
            points.forEach(p => {
                const asFound = String(p.AS_FOUND_VALUE || '');
                if (asFound.includes('/')) {
                    const valParts = asFound.split('/');
                    const count = valParts.length;
                    const unc = String(p.UNCERTAINTY || '');
                    const uncParts = unc.includes('/') ? unc.split('/') : Array(count).fill(unc);
                    
                    let subLabels = ['1', '2', '3', '4', '5'];
                    if ((p.PARAMETER_NAME || '').toLowerCase().includes('lực') || (p.PARAMETER_NAME || '').toLowerCase().includes('force')) {
                        subLabels = ['BEGIN', 'MIDDLE', 'END'];
                    }
                    
                    for (let idx = 0; idx < count; idx++) {
                        expandedPoints.push({
                            ...p,
                            CAL_POINT: subLabels[idx] || String(idx + 1),
                            AS_FOUND_VALUE: (valParts[idx] || '').trim(),
                            UNCERTAINTY: (uncParts[idx] || '').trim()
                        });
                    }
                } else {
                    expandedPoints.push(p);
                }
            });

            // Group expanded points by PARAMETER_NAME
            const groups = [];
            let cg = null;
            expandedPoints.forEach(p => {
                const pn = p.PARAMETER_NAME || '';
                if (!cg || cg.name !== pn) {
                    cg = { name: pn, rows: [] };
                    groups.push(cg);
                }
                cg.rows.push(p);
            });

            // Draw grouped rows with vertical merges
            groups.forEach(grp => {
                const isMulti = grp.rows.length > 1;
                const groupSize = grp.rows.length;
                
                grp.rows.forEach((p, ri) => {
                    const paramName = p.PARAMETER_NAME || '–';
                    const calPt = String(p.CAL_POINT || '–');
                    const asFound = String(p.AS_FOUND_VALUE || '–');
                    const unc = String(p.UNCERTAINTY || '–');
                    const refVal = String(p.REFERENCE_VALUE || '–');
                    const tol = String(p.TOLERANCE || '–');
                    const conformity = String(p.CONFORMITY || '–');
                    const exactHeight = getRowHeightForParam(paramName);
                    
                    let paramMerge = undefined;
                    let refMerge = undefined;
                    let tolMerge = undefined;
                    let confMerge = undefined;
                    
                    if (isMulti) {
                        paramMerge = (ri === 0) ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE;
                        refMerge = (ri === 0) ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE;
                        tolMerge = (ri === 0) ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE;
                        confMerge = (ri === 0) ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE;
                    }
                    
                    if (isMulti) {
                        t2Rows.push(new TableRow({
                            height: { value: 312, rule: HeightRule.AT_LEAST },
                            children: [
                                t2Cell(ri > 0 ? [] : formatParamParagraphs(paramName, AlignmentType.LEFT), 1278, 1, { verticalMerge: paramMerge }),
                                t2Cell([para(calPt, { fontSize: 10, alignment: AlignmentType.CENTER })], 1843, 1),
                                t2Cell([para(asFound, { fontSize: 10, alignment: AlignmentType.CENTER })], 1855, 1),
                                t2Cell([para(unc, { fontSize: 10, alignment: AlignmentType.CENTER })], 1720, 2),
                                t2Cell(ri > 0 ? [] : [para(refVal, { fontSize: 10, alignment: AlignmentType.CENTER })], 1918, 2, { verticalMerge: refMerge }),
                                t2Cell(ri > 0 ? [] : [para(tol, { fontSize: 10, alignment: AlignmentType.CENTER })], 1191, 1, { verticalMerge: tolMerge }),
                                t2Cell(ri > 0 ? [] : [para(conformity, { fontSize: 10, bold: true, alignment: AlignmentType.CENTER })], 1261, 1, { verticalMerge: confMerge }),
                            ]
                        }));
                    } else {
                        // Single row parameter layout
                        t2Rows.push(new TableRow({
                            height: exactHeight ? { value: exactHeight, rule: HeightRule.AT_LEAST } : undefined,
                            children: [
                                t2Cell(formatParamParagraphs(paramName, AlignmentType.LEFT), 3121, 2),
                                t2Cell(para(asFound, { fontSize: 10, alignment: AlignmentType.CENTER }), 1855, 1),
                                t2Cell(para(unc, { fontSize: 10, alignment: AlignmentType.CENTER }), 1712, 1),
                                t2Cell(para(refVal, { fontSize: 10, alignment: AlignmentType.CENTER }), 1918, 2),
                                t2Cell(para(tol, { fontSize: 10, alignment: AlignmentType.CENTER }), 1199, 2),
                                t2Cell(para(conformity, { fontSize: 10, bold: true, alignment: AlignmentType.CENTER }), 1261, 1),
                            ]
                        }));
                    }
                });
            });
        }

        // Assemble Table 2
        children.push(
            new Table({
                rows: t2Rows,
                width: { size: 11066, type: WidthType.DXA },
                columnWidths: [1278, 1843, 1855, 1712, 8, 1910, 8, 1191, 1261],
                indent: { size: -220, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
                borders: TABLE_BORDER_GRID
            })
        );



        // ─── TABLE 3: Notes, Disclaimers, and Other Information (completely borderless, 8pt) ───
        const t3Rows = [];

        // Row 1: Ghi chú/ Note:
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para('Ghi chú/ Note:', { fontSize: 8, bold: true }), 11483)
            ]
        }));

        // Row 2: Note 1
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: '*        Đánh giá theo thông số kỹ thuật của nhà sản xuất/ ', fontSize: 8, bold: true },
                    { text: "Acceptance limit base on Manufacturer's specifications.", fontSize: 8, italics: true }
                ]), 11483)
            ]
        }));

        // Row 3: Note 2
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: '*        Đánh giá theo yêu cầu kỹ thuật của khách hàng/ ', fontSize: 8, bold: true },
                    { text: 'Acceptance limit base on Customer request.', fontSize: 8, italics: true }
                ]), 11483)
            ]
        }));

        // Row 4: 17. Thông tin khác
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: '17. Thông tin khác/ ', fontSize: 8, bold: true },
                    { text: 'Other information:', fontSize: 8, bold: true, italics: true }
                ]), 11483)
            ]
        }));

        // Row 5: 17.1 Độ không đảm bảo đo
        t3Rows.push(new TableRow({
            children: [
                t1Cell([
                    para([
                        { text: '17.1 Độ không đảm bảo đo ', fontSize: 8, bold: true },
                        { text: '/ Uncertainty:', fontSize: 8, bold: true, italics: true }
                    ]),
                    para([
                        { text: 'Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy/ ', fontSize: 8 },
                        { text: 'The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.', fontSize: 8, italics: true }
                    ])
                ], 11483)
            ]
        }));

        // Row 6: 17.2 Công bố sự phù hợp
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: '17.2. Công bố về sự phù hợp ', fontSize: 8, bold: true },
                    { text: '/ Statements of conformity:', fontSize: 8, bold: true, italics: true }
                ]), 11483)
            ]
        }));

        // Row 7-10: Conformity levels A, B, C, D
        const confTexts = [
            {
                prefix: '+ A: ',
                vn: 'Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép của tiêu chuẩn đánh giá. ',
                en: 'The measurement reported with expanded uncertainty is within tolerance of standards.'
            },
            {
                prefix: '+ B: ',
                vn: 'Kết quả đo khi tính cả độ không đảm bảo đo hoàn toàn nằm ngoài giới hạn cho phép của tiêu chuẩn đánh giá. ',
                en: 'The measurement reported with expanded uncertainty is out of tolerance of standards.'
            },
            {
                prefix: '+ C: ',
                vn: 'Kết quả đo khi tính cả độ không đảm bảo đo có thể nằm ngoài giới hạn cho phép của tiêu chuẩn. Không có kết luận trong trường hợp này. ',
                en: 'The measurement reported with expanded uncertainty may be out of tolerance of standards. There is no conclusion for this measurement. '
            },
            {
                prefix: '+ D: ',
                vn: 'Tiêu chuẩn kỹ thuật không quy định dung sai của thông số đo. ',
                en: 'There is no tolerance stated in technical standard and there is no conclusion for this measurement. '
            }
        ];

        confTexts.forEach(item => {
            t3Rows.push(new TableRow({
                children: [
                    t1Cell(para([
                        { text: item.prefix, fontSize: 8, bold: true },
                        { text: item.vn, fontSize: 8 },
                        { text: item.en, fontSize: 8, italics: true }
                    ]), 11483)
                ]
            }));
        });

        // Row 11: 17.3 Khác
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: '17.3 Khác/', fontSize: 8, bold: true },
                    { text: ' Other:', fontSize: 8, bold: true, italics: true }
                ]), 11483)
            ]
        }));

        // Row 12: ISO warning
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: 'Các thông số được đánh dấu (*) là không đạt công nhận ISO/IEC 17025 ', fontSize: 8 },
                    { text: 'The characteristics marked with (*) is not accredited to comply with ISO/IEC 17025', fontSize: 8, italics: true }
                ]), 11483)
            ]
        }));

        // Dynamic Row 12b: Marker (C)/(M) note
        let hasMCMark = false;
        if (points && points.length) {
            for (let pi = 0; pi < points.length; pi++) {
                const pn = points[pi] && points[pi].PARAMETER_NAME || '';
                if (/\(([MC])\)/.test(pn)) {
                    hasMCMark = true;
                    break;
                }
            }
        }
        if (hasMCMark) {
            t3Rows.push(new TableRow({
                children: [
                    t1Cell(para([
                        { text: 'Các thông số đánh dấu (C) là kết quả hiệu chuẩn, các thông số đánh dấu (M) là kết quả đo thử nghiệm ', fontSize: 8 },
                        { text: 'The characteristics marked with (C) are results of calibration, (M) are results of measurement', fontSize: 8, italics: true }
                    ]), 11483)
                ]
            }));
        }

        // Row 13: Empty
        t3Rows.push(new TableRow({
            children: [
                t1Cell([], 11483)
            ]
        }));

        // Row 14: Legal disclaimer paragraph
        t3Rows.push(new TableRow({
            children: [
                t1Cell([
                    para([
                        { text: 'Giấy chứng nhận này không được sao chép dưới bất kỳ hình thức nào nếu không có sự đồng ý bằng văn bản của LabMaster./', fontSize: 8, bold: true },
                        { text: ' This form shall not be reproduced, without the expressed written consent of LabMaster.', fontSize: 8, italics: true }
                    ]),
                    para([
                        { text: 'Phương tiện đo này không được để sử dụng định lượng hàng hóa, dịch vụ trong mua bán, thanh toán, đảm bảo an toàn, bảo vệ sức khỏe cộng đồng, bảo vệ môi trường, trong thanh tra, kiểm tra, giám định tư pháp và trong các hoạt động công vụ khác. Phương tiện đo này không được sử dụng trực tiếp để kiểm định phương tiện đo nhóm 2. ', fontSize: 8 },
                        { text: 'This instrument do not used for quantifying goods, service in trading, payment, safety assurance, social healthcare, protecting the environment, inspection law and in other public service activities. This instrument shall not be used directly for the verification of group 2 instruments.', fontSize: 8, italics: true }
                    ])
                ], 11483)
            ]
        }));

        // Row 15: Traceability statement
        t3Rows.push(new TableRow({
            children: [
                t1Cell(para([
                    { text: 'Chứng chỉ cung cấp khả năng truy xuất nguồn gốc phép đo theo các tiêu chuẩn quốc gia được công nhận hoặc các phòng thí nghiệm tiêu chuẩn quốc gia được công nhận khác./', fontSize: 8, bold: true },
                    { text: 'This certificate provides traceability of measurement to recognised national standards or other national standards laboratories.', fontSize: 8, italics: true }
                ]), 11483)
            ]
        }));

        // Assemble Table 3
        children.push(
            new Table({
                rows: t3Rows,
                width: { size: 11483, type: WidthType.DXA },
                columnWidths: [11483],
                indent: { size: -426, type: WidthType.DXA },
                alignment: AlignmentType.CENTER,
                borders: TABLE_BORDER_NONE
            })
        );

        // ═══════════════════════════════════════════════════════════════
        //  BUILD DOCUMENT
        // ═══════════════════════════════════════════════════════════════
        const doc = new Document({
            title: `GCN_${cNo}`,
            description: `Giấy Chứng Nhận Hiệu Chuẩn ${cNo}`,
            styles: {
                default: {
                    document: {
                        run: { font, size: 20 }, // 10pt
                        paragraph: { spacing: { after: 0, line: 276, lineRule: 'auto' } }, // tight line spacing
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        size: { width: 11907, height: 16840 },
                        margin: { top: 669, bottom: 426, left: 720, right: 720, header: 742, footer: 240 },
                        borders: {
                            pageBorders: { offsetFrom: 'page' },
                            pageBorderTop:    { style: BorderStyle.SINGLE, size: 4, color: 'auto', space: 10 },
                            pageBorderRight:  { style: BorderStyle.SINGLE, size: 4, color: 'auto', space: 10 },
                            pageBorderBottom: { style: BorderStyle.SINGLE, size: 4, color: 'auto', space: 10 },
                            pageBorderLeft:   { style: BorderStyle.SINGLE, size: 4, color: 'auto', space: 10 },
                        }
                    },
                },
                headers: {
                    default: headerCommon,
                },
                footers: {
                    default: footer,
                },
                children: children,
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(OUTPUT_FILE, buffer);
        console.log(`[SUCCESS] Đã xuất: GCN_${SAFE_NAME}.docx (${(buffer.length / 1024).toFixed(1)} KB)`);
        return buffer;

    } catch (err) {
        console.error('LỖI CRITICAL:', err);
        if (require.main === module) process.exit(1);
        else throw err;
    }
}

module.exports = { generateDocx: main };

if (require.main === module) {
    main().then(() => process.exit(0)).catch(() => process.exit(1));
}
