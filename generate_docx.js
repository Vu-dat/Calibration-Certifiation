'use strict';

/**
 * generate_docx.js — Tạo file Word (.docx) Giấy Chứng Nhận Hiệu Chuẩn
 * Sử dụng: node generate_docx.js <CERT_NO>
 * Hoặc được gọi từ server.js
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, PageOrientation, Header, Footer
} = require('docx');

// ─────────────────────── KIỂM TRA CLI ───────────────────────
const certNo = process.argv[2];
if (!certNo) {
    console.error('Lỗi: Vui lòng cung cấp mã số chứng nhận. Ví dụ: node generate_docx.js 328344');
    process.exit(1);
}

// ─────────────────────── CẤU HÌNH ĐƯỜNG DẪN ───────────────────────
const BASE_DIR   = __dirname;
const DB_PATH    = path.join(BASE_DIR, 'labmaster_enterprise.db');
const STATIC_DIR = path.join(BASE_DIR, 'static');
if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });

const SAFE_NAME   = certNo.replace(/[^a-zA-Z0-9]/g, '_');
const OUTPUT_FILE = path.join(STATIC_DIR, `GCN_${SAFE_NAME}.docx`);

// ─────────────────────── KẾT NỐI DATABASE ───────────────────────
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) { console.error('Không thể kết nối SQLite:', err.message); process.exit(1); }
});
db.configure("busyTimeout", 5000);

function dbGet(sql, params) {
    return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
}
function dbAll(sql, params) {
    return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}

function parseDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

const TEAL = '007a78';
const DARK = '1a1917';
const GRAY = '6b6860';

// Helper để tạo cell có border
function borderedCell(children, options = {}) {
    const { width, shading, alignment, bold, fontSize, color } = options;
    return new TableCell({
        children: Array.isArray(children) ? children : [children],
        width: width ? { size: width, type: WidthType.DXA } : undefined,
        shading: shading ? { fill: shading } : undefined,
        verticalAlign: 'center',
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'b8b5ae' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'b8b5ae' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'b8b5ae' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'b8b5ae' },
        },
    });
}

function cellParagraph(text, opts = {}) {
    const { bold, fontSize, color, alignment, spacing } = opts;
    return new Paragraph({
        children: [new TextRun({
            text: text || '',
            font: 'Arial',
            size: (fontSize || 10) * 2,
            bold: bold || false,
            color: color || DARK,
        })],
        alignment: alignment || AlignmentType.LEFT,
        spacing: spacing || { before: 40, after: 40 },
    });
}

async function main() {
    try {
        const cert = await dbGet(`SELECT * FROM CERTIFICATES WHERE CERT_NO = ?`, [certNo]);
        if (!cert) {
            console.error(`Lỗi: Không tìm thấy dữ liệu cho mã [${certNo}] trong bảng CERTIFICATES.`);
            db.close(); process.exit(1);
        }

        const points = await dbAll(`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC`, [certNo]);
        const standards = await dbAll(`SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC`, [certNo]);

        // ─────────────────────── XÂY DỰNG DOCUMENT ───────────────────────
        const children = [];

        // ── TIÊU ĐỀ ──
        children.push(
            new Paragraph({
                children: [new TextRun({
                    text: 'GIẤY CHỨNG NHẬN HIỆU CHUẨN',
                    font: 'Arial', size: 32, bold: true, color: TEAL
                })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
            }),
            new Paragraph({
                children: [new TextRun({
                    text: 'CERTIFICATE OF CALIBRATION',
                    font: 'Arial', size: 22, color: GRAY
                })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
            }),
            new Paragraph({
                children: [new TextRun({
                    text: `Số / No.: ${cert.CERT_NO || certNo}    ·    Ngày HC / Cal. Date: ${parseDate(cert.CAL_DATE || '')}    ·    HC kế tiếp / Re-cal: ${parseDate(cert.RE_CAL_DATE || '')}`,
                    font: 'Arial', size: 18, color: GRAY
                })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            })
        );

        // ── THÔNG TIN THIẾT BỊ ──
        const infoData = [
            ['1. Tên thiết bị / Instrument', cert.INSTRUMENT_NAME || '–'],
            ['2. Nhà sản xuất / Manufacturer', cert.MANUFACTURER || '–'],
            ['3. Kiểu / Model', cert.MODEL || '–'],
            ['4. Mã nhận diện / Equipment ID', cert.EQUIPMENT_ID || '–'],
            ['5. Số sê-ri / Serial No.', cert.SERIAL_NUMBER || '–'],
            ['6. Khách hàng / Customer', cert.CUSTOMER_NAME || '–'],
            ['7. Địa chỉ KH / Address', cert.CUSTOMER_ADDRESS || '–'],
            ['8. Quy trình HC / Procedure', cert.PROCEDURE || '–'],
            ['8. Tiêu chuẩn TK / Ref. Standard', cert.REF_STANDARD || '–'],
            ['9. Môi trường / Environment', `Nhiệt độ: ${cert.TEMP_ENV || '–'}   /   Độ ẩm: ${cert.HUMI_ENV || '–'}`]
        ];

        infoData.forEach(([label, val]) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: label, font: 'Arial', size: 20, bold: true, color: DARK }),
                        new TextRun({ text: `  :  ${val}`, font: 'Arial', size: 20, color: DARK }),
                    ],
                    spacing: { before: 60, after: 60 },
                })
            );
        });

        

        


        // ── KẾT QUẢ HIỆU CHUẨN ──
        children.push(
            new Paragraph({
                children: [new TextRun({
                    text: '16. KẾT QUẢ HIỆU CHUẨN / CALIBRATION RESULTS:',
                    font: 'Arial', size: 22, bold: true, color: TEAL
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 120 },
            })
        );

        const resHeaderCells = [
            'Thông số\nParameters',
            'Điểm HC\nCal. Points',
            'Giá trị đo được\nAs Found Value',
            'KĐBĐ ±\nUncertainty',
            'Dung sai\nTolerance',
            'Phù hợp\nConformity',
            'TB chuẩn\nRef. Equipment'
        ];

        const resTableRows = [];
        resTableRows.push(new TableRow({
            tableHeader: true,
            children: resHeaderCells.map(h =>
                borderedCell([cellParagraph(h, { bold: true, fontSize: 8, color: TEAL, alignment: AlignmentType.CENTER })], {
                    shading: 'e6f7f7'
                })
            )
        }));

        if (points.length === 0) {
            const emptyCell = borderedCell([cellParagraph('Chưa có dữ liệu điểm đo', { fontSize: 10, alignment: AlignmentType.CENTER })]);
            resTableRows.push(new TableRow({
                children: [emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell]
            }));
        } else {
            // Nhóm theo PARAMETER_NAME
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
                    const paramName = idx === 0 ? group.paramName : '';
                    const calPt = String(p.CAL_POINT || p.cal_point || '–');
                    const asFound = String(p.AS_FOUND_VALUE || p.as_found_value || '–');
                    const unc = String(p.UNCERTAINTY || p.uncertainty || '–');
                    const tol = String(p.TOLERANCE || p.tolerance || '–');
                    const conf = String(p.CONFORMITY || p.conformity || '–');
                    const refEq = String(p.REF_EQUIPMENT || p.ref_equipment || '–');

                    resTableRows.push(new TableRow({
                        children: [
                            borderedCell([cellParagraph(paramName, { fontSize: 9, bold: true })]),
                            borderedCell([cellParagraph(calPt, { fontSize: 9, alignment: AlignmentType.CENTER })]),
                            borderedCell([cellParagraph(asFound, { fontSize: 9, alignment: AlignmentType.CENTER })]),
                            borderedCell([cellParagraph(unc, { fontSize: 9, alignment: AlignmentType.CENTER })]),
                            borderedCell([cellParagraph(tol, { fontSize: 9, alignment: AlignmentType.CENTER })]),
                            borderedCell([cellParagraph(conf, { fontSize: 9, alignment: AlignmentType.CENTER })]),
                            borderedCell([cellParagraph(refEq, { fontSize: 9, alignment: AlignmentType.CENTER })]),
                        ]
                    }));
                });
            }
        }

        children.push(
            new Table({
                rows: resTableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ spacing: { after: 200 } })
        );

        // ── THÔNG TIN KHÁC ──
        children.push(
            new Paragraph({
                children: [new TextRun({
                    text: '17. THÔNG TIN KHÁC / OTHER INFORMATION:',
                    font: 'Arial', size: 22, bold: true, color: TEAL
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
                children: [new TextRun({ text: '17.1 Độ không đảm bảo đo / Uncertainty:', font: 'Arial', size: 18, bold: true, color: DARK })],
                spacing: { after: 80 },
            }),
            new Paragraph({
                children: [new TextRun({
                    text: 'Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy.',
                    font: 'Arial', size: 18, color: DARK
                })],
                spacing: { after: 60 },
            }),
            new Paragraph({
                children: [new TextRun({
                    text: 'The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.',
                    font: 'Arial', size: 16, color: GRAY, italics: true
                })],
                spacing: { after: 160 },
            }),
            new Paragraph({
                children: [new TextRun({ text: '17.2. Công bố về sự phù hợp / Statements of conformity:', font: 'Arial', size: 18, bold: true, color: DARK })],
                spacing: { after: 80 },
            }),
            ...[
                '+ A: Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép. Within tolerance.',
                '+ B: Kết quả đo nằm ngoài giới hạn cho phép. Out of tolerance.',
                '+ C: Kết quả đo có thể nằm ngoài giới hạn. Không có kết luận. May be out of tolerance. No conclusion.',
                '+ D: Tiêu chuẩn kỹ thuật không quy định dung sai. No tolerance stated.',
            ].map(text => new Paragraph({
                children: [new TextRun({ text, font: 'Arial', size: 17, color: DARK })],
                spacing: { after: 60 },
            }))
        );

        // ── CHỮ KÝ ──
        children.push(new Paragraph({ spacing: { before: 400 } }));

        // Bảng chữ ký 2 cột
        const sigTableRows = [
            new TableRow({
                children: [
                    borderedCell(
                        [cellParagraph('NGƯỜI SOÁT XÉT / REVIEWED BY', { bold: true, fontSize: 10, color: TEAL, alignment: AlignmentType.CENTER })],
                        { shading: 'e6f7f7' }
                    ),
                    borderedCell(
                        [cellParagraph('GIÁM ĐỐC / DIRECTOR', { bold: true, fontSize: 10, color: TEAL, alignment: AlignmentType.CENTER })],
                        { shading: 'e6f7f7' }
                    ),
                ]
            }),
            new TableRow({
                children: [
                    borderedCell([new Paragraph({
                        children: [new TextRun({ text: '', size: 200 })],
                        spacing: { before: 400 },
                    })]),
                    borderedCell([new Paragraph({
                        children: [new TextRun({ text: '', size: 200 })],
                        spacing: { before: 400 },
                    })]),
                ]
            }),
            new TableRow({
                children: [
                    borderedCell([cellParagraph(cert.HEAD_OF_LAB || '', { fontSize: 10, alignment: AlignmentType.CENTER })]),
                    borderedCell([cellParagraph(cert.DIRECTOR || '', { fontSize: 10, alignment: AlignmentType.CENTER })]),
                ]
            }),
        ];

        children.push(
            new Table({
                rows: sigTableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
            })
        );

        // ── FOOTER ──
        children.push(new Paragraph({ spacing: { before: 300 } }));
        children.push(
            new Paragraph({
                children: [new TextRun({
                    text: 'www.labmaster.vn  |  Textile – Footwear – Children Products Safety Tester',
                    font: 'Arial', size: 14, color: GRAY, italics: true
                })],
                alignment: AlignmentType.CENTER,
            })
        );

        // ─────────────────────── TẠO DOCUMENT ───────────────────────
        const doc = new Document({
            title: `GCN_${certNo}`,
            description: `Giấy Chứng Nhận Hiệu Chuẩn ${certNo}`,
            styles: {
                default: {
                    document: {
                        run: { font: 'Arial', size: 20 },
                        paragraph: { spacing: { after: 100 } },
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
                    }
                },
                children: children,
            }],
        });

        // ─────────────────────── XUẤT FILE ───────────────────────
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(OUTPUT_FILE, buffer);
        console.log(`[SUCCESS] Đã xuất: GCN_${SAFE_NAME}.docx`);
        db.close();
        process.exit(0);

    } catch (err) {
        console.error('LỖI CRITICAL KHI SINH WORD:', err);
        db.close();
        process.exit(1);
    }
}

main();
