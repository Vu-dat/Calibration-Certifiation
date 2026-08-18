'use strict';
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const { Writable } = require('stream');

const db = require('./db');

async function g(query, params) {
  g._idx = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++g._idx}`);
  const rows = await db.unsafe(pgQuery, params);
  return rows[0] || null;
}
async function a(query, params) {
  a._idx = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++a._idx}`);
  return await db.unsafe(pgQuery, params);
}

const certNo = process.argv[2];
const downloadUrl = process.argv[3] || '';
const equipmentName = process.argv[4] || '';
const BD = __dirname;

// ── FONTS ────────────────────────────────────────────────────────────
const fpr = [path.join(BD, 'fonts', 'arial.ttf'), 'C:/Windows/Fonts/arial.ttf'];
const fpb = [path.join(BD, 'fonts', 'arialbd.ttf'), 'C:/Windows/Fonts/arialbd.ttf'];
const fpi = [path.join(BD, 'fonts', 'ariali.ttf'), 'C:/Windows/Fonts/ariali.ttf'];
const fpbi = [path.join(BD, 'fonts', 'arialbi.ttf'), 'C:/Windows/Fonts/arialbi.ttf'];
const ftr = [path.join(BD, 'fonts', 'times.ttf'), 'C:/Windows/Fonts/times.ttf'];
const fti = [path.join(BD, 'fonts', 'timesi.ttf'), 'C:/Windows/Fonts/timesi.ttf'];

function ff(ps) { for (var i = 0; i < ps.length; i++) { try { if (fs.existsSync(ps[i])) return ps[i]; } catch(e) {} } return null; }
var FR = ff(fpr), FB = ff(fpb), FI = ff(fpi), FBI = ff(fpbi), TR = ff(ftr), TI = ff(fti);
var FNR = 'AR', FNB = 'AB', FNI = 'AI', FNBI = 'ABI', FTR = 'TR', FTI = 'TI';

function sf(doc, b, ital, font) {
  if (b === undefined) b = false;
  if (ital === undefined) ital = false;
  if (font === 'TIMES') {
    if (ital && TI) { try { doc.font(FNI); doc.font(FTI); } catch(e) { doc.font('Times-Italic'); } }
    else if (TR) { try { doc.font(FTR); } catch(e) { doc.font('Times-Roman'); } }
    return;
  }
  if (b && ital && FBI) { try { doc.font(FNBI); } catch(e) { doc.font('Helvetica-BoldOblique'); } }
  else if (ital && FI) { try { doc.font(FNI); } catch(e) { doc.font('Helvetica-Oblique'); } }
  else if (b && FB) { try { doc.font(FNB); } catch(e) { doc.font('Helvetica-Bold'); } }
  else if (FR) { try { doc.font(FNR); } catch(e) { doc.font('Helvetica'); } }
  else { doc.font(b ? 'Helvetica-Bold' : 'Helvetica'); }
}

function normalizeDegree(str) {
  if (!str) return '';
  return String(str)
    .replace(/\u00BA/g, '°')
    .replace(/\u02DA/g, '°')
    .replace(/\u00B0/g, '°');
}

function drawTextWithDegree(doc, text, x, y, options) {
  text = normalizeDegree(text);
  if (typeof text !== 'string' || !text.includes('°')) {
    if (x !== undefined && y !== undefined) {
      doc.text(text, x, y, options);
    } else {
      doc.text(text, options);
    }
    return;
  }

  const originalFont = doc._font;
  const originalFontName = originalFont ? originalFont.name : 'Helvetica';
  
  const parts = text.split('°');

  if (options && options.align === 'center' && options.width !== undefined && x !== undefined) {
    const originalSize = doc._fontSize;
    let totalW = 0;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] !== '') {
        doc.font(originalFontName).fontSize(originalSize);
        totalW += doc.widthOfString(parts[i]);
      }
      if (i < parts.length - 1) {
        let hFont = 'Helvetica';
        if (originalFontName === 'AB' || originalFontName === 'Helvetica-Bold' || originalFontName === 'ABI' || originalFontName === 'Helvetica-BoldOblique') {
          hFont = 'Helvetica-Bold';
        } else if (originalFontName === 'AI' || originalFontName === 'Helvetica-Oblique') {
          hFont = 'Helvetica-Oblique';
        }
        doc.font(hFont).fontSize(originalSize);
        totalW += doc.widthOfString('°');
      }
    }
    x = x + (options.width - totalW) / 2;
    options = { ...options };
    delete options.width;
    delete options.align;
  }
  
  for (let i = 0; i < parts.length; i++) {
    const isLast = (i === parts.length - 1);
    
    if (parts[i] !== '') {
      doc.font(originalFontName);
      if (x !== undefined && y !== undefined) {
        doc.text(parts[i], x, y, { ...options, continued: !isLast });
        x = undefined;
        y = undefined;
      } else {
        doc.text(parts[i], { ...options, continued: !isLast });
      }
    }
    
    if (!isLast) {
      let hFont = 'Helvetica';
      if (originalFontName === 'AB' || originalFontName === 'Helvetica-Bold' || originalFontName === 'ABI' || originalFontName === 'Helvetica-BoldOblique') {
        hFont = 'Helvetica-Bold';
      } else if (originalFontName === 'AI' || originalFontName === 'Helvetica-Oblique') {
        hFont = 'Helvetica-Oblique';
      }
      
      doc.font(hFont);
      const nextPartEmpty = (parts[i + 1] === '');
      if (x !== undefined && y !== undefined) {
        doc.text('°', x, y, { ...options, continued: !nextPartEmpty });
        x = undefined;
        y = undefined;
      } else {
        doc.text('°', { ...options, continued: !nextPartEmpty });
      }
    }
  }
}

function drawCell(doc, text, x, y, colWidth, rowH, pyV) {
  if (!text) return;
  const normalized = normalizeDegree(text);
  const originalSize = doc._fontSize || 10;
  
  let size = originalSize;
  while (size >= 5) {
    doc.fontSize(size);
    const h = doc.heightOfString(normalized, { width: colWidth });
    if (h <= rowH + 0.1) {
      break;
    }
    size -= 0.5;
  }
  
  let drawY = pyV;
  if (size < originalSize) {
    doc.fontSize(size);
    const textHeight = doc.heightOfString(normalized, { width: colWidth });
    drawY = y + (rowH - textHeight) / 2;
  }
  
  doc.fontSize(size);
  drawTextWithDegree(doc, normalized, x, drawY, { width: colWidth, align: 'center', lineGap: 0 });
  doc.fontSize(originalSize);
}

function pd(d) { if (!d) return ''; var p = d.split('-'); return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : d; }

function toUpperKeys(obj) {
    if (!obj) return null;
    if (Array.isArray(obj)) {
        if (obj.length === 0) return [];
        if (typeof obj[0] === 'object' || Array.isArray(obj[0])) return obj.map(toUpperKeys);
    }
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && isNaN(Number(key))) result[key.toUpperCase()] = obj[key];
    }
    return result;
}

var PW = 595.28, PH = 841.89;
var ML = 40, MR = 40, CW = PW - ML - MR;
var BCLR = '#000000';
var TC = '#008080';

var VN = {
  title1: "GIẤY CHỨNG NHẬN HIỆU CHUẨN – ĐO LƯỜNG",
  title2: "CERTIFICATE OF CALIBRATION – MEASUREMENT",
  certNo: "Số GCN/",
  certNoEn: "Certificate No: ",
  date: "Ngày cấp/",
  dateEn: "Date of issue: ",
  sec1: "1. Khách hàng: ", sec1En: "Customer ",
  sec2: "2. Tên thiết bị: ", sec2En: "Instrument ",
  sec3: "3. Nhà sản xuất: ", sec3En: "Manufacturer ",
  sec4: "4. Mã quản lý  ", sec4En: "ID ",
  sec5: "5. Kiểu: ", sec5En: "Model ",
  sec6: "6. Số sản xuất: ", sec6En: "Serial No. ",
  sec7: "7. Đặc trưng kĩ thuật", sec7En: "Spectification",
  sec7Range: "Phạm vi đo:", sec7RangeEn: "Range",
  sec7Res: "Độ phân giải:", sec7ResEn: "Resolution",
  sec8: "8. Quy trình thực hiện", sec8En: "Procedure",
  sec9: "9. Tiêu chuẩn tham khảo", sec9En: "Reference Standard",
  sec11: "11. Nơi thực hiện: ", sec11En: "Place of Performance ",
  sec12: "12. Ngày thực hiện: ", sec12En: "Date of performance ",
  sec13: "13. Ngày thực hiện tiếp theo: ", sec13En: "Date of next performance ",
  sec14: "14. Điều kiện môi trường: ", sec14En: "Environment ",
  temp: "Nhiệt độ:", tempEn: "Temperature",
  humi: "Độ ẩm:", humiEn: "Humidity",
  sec15: "15. Chuẩn sử dụng /", sec15En: "Standards Used :",
  stdH: ["Tên thiết bị", "Số quản lý", "Số chứng nhận", "Liên kết chuẩn", "Hiệu lực"],
  stdHE: ["Name of Standard", "ID", "Certificate No.", "Traceable to", "Due date"],
  sigL: "PHỤ TRÁCH PHÒNG HIỆU CHUẨN", sigLEn: "HEAD OF CALIBRATION LAB.",
  sigR: "GIÁM ĐỐC", sigREn: "DIRECTOR",
  sec16: "16. Kết quả/", sec16En: "Results:",
  resH: ["Thông số", "Giá trị đo được", "ĐKĐBĐ", "Giá trị tham chiếu", "Dung sai", "Kết luận"],
  resHE: ["Parameter", "As found value", "Uncertainty", "Reference Value", "Tolerane", "Conslution"],
  note: "Ghi chú/ Note:",
  note1: "*        Đánh giá theo thông số kỹ thuật của nhà sản xuất/ Acepptance limit base on Manufactuter's specitifications.",
  note2: "*        Đánh giá theo yêu cầu kỹ thuật của khách hàng/ Acepptance limit base on Customer request.",
  sec17: "17. Thông tin khác/", sec17En: "Other information:",
  uncertTitle: "17.1 Độ không đảm bảo đo", uncertTitleEn: "/ Uncertainty:",
  uncertVN: "Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy/",
  uncertEN: "The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.",
  confTitle: "17.2. Công bố về sự phù hợp", confTitleEn: "/ Statements of conformity:",
  conf: ["+ A: Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép của tiêu chuẩn đánh giá. | The measurement reported with expanded uncertainty is within tolerance of standards.",
         "+ B: Kết quả đo khi tính cả độ không đảm bảo đo hoàn toàn nằm ngoài giới hạn cho phép của tiêu chuẩn đánh giá. | The measurement reported with expanded uncertainty is out of tolerance of standards.",
         "+ C: Kết quả đo khi tính cả độ không đảm bảo đo có thể nằm ngoài giới hạn cho phép của tiêu chuẩn. Không có kết luận trong trường hợp này. | The measurement reported with expanded uncertainty may be out of tolerance of standards. There is no conclusion for this measurement.",
         "+ D: Tiêu chuẩn kỹ thuật không quy định dung sai của thông số đo. | There is no tolerance stated in technical standard and there is no conclusion for this measurement."],
  otherTitle: "17.3 Khác/", otherTitleEn: " Other:",
  otherVN: "Các thông số được đánh dấu (*) là không đạt công nhận ISO/IEC 17025",
  otherEN: "The characteristics marked with (*) are not accredited to comply with ISO/IEC 17025",
  otherVN2: "Các thông số đánh dấu (C) là kết quả hiệu chuẩn, các thông số đánh dấu (M) là kết quả đo thử nghiệm",
  otherEN2: "The characteristics marked with (C) are results of calibration, (M) are results of measurement",
  legal1: "Giấy chứng nhận này không được sao chép dưới bất kỳ hình thức nào nếu không có sự đồng ý bằng văn bản của LabMaster./",
  legal1En: " This form shall not be reproduced, without the expressed written consent of LabMaster.",
  legal2: "Phương tiện đo này không được để sử dụng định lượng hàng hóa, dịch vụ trong mua bán, thanh toán, đảm bảo an toàn, bảo vệ sức khỏe cộng đồng, bảo vệ môi trường, trong thanh tra, kiểm tra, giám định tư pháp và trong các hoạt động công vụ khác. Phương tiện đo này không được sử dụng trực tiếp để kiểm định phương tiện đo nhóm 2. ",
  legal2En: "This instrument do not used for quantifying goods, service in trading, payment, safety assurance, social heathcare, protecting the enviroment, inspection law and in other public service activities. This instrument shall not be used directly for the verification of group 2 instruments.",
  legal3: "Chứng chỉ cung cấp khả năng truy xuất nguồn gốc phép đo theo các tiêu chuẩn quốc gia được công nhận hoặc các phòng thí nghiệm tiêu chuẩn quốc gia được công nhận khác./",
  legal3En: "This certificate provides tracerbility of measurement to recognised national standards or orther national standards laboratories.",
  footer1: "www.labmaster.vn",
  footer2: "Textile – Footwear – Leather - Children product Safety Tester",
  page: "Trang/Page: "
};

// ── LAYOUT CONSTANTS (measured from reference) ────────────────────────
var LBL_X = 27.0;      // label left edge
var VAL_X = 133.6;     // value left edge
var R_LBL_X = 360.4;   // right column label
var CONTENT_R = 585.0; // right content edge

// ── DRAWING HELPERS ──────────────────────────────────────────────────
function drawBorder(doc) {
  doc.lineWidth(0.5).strokeColor('#000000');
  doc.rect(10, 10, 575.5, 822.2).stroke();
}

function drawH(doc, logo, cno, cdate, qr, pg) {
  // Draw page border first
  drawBorder(doc);
  
  // QR at top-right corner - matching reference DOCX (~48x47pt)
  if (qr) { try { doc.image(qr, PW - MR - 48, 18, {width:48,height:47}); } catch(e) {} }
  
  // Logo - matching reference DOCX (~106x37)
  if (logo) { try { doc.image(logo, ML, 18, {width:106,height:37}); } catch(e) {} }
  
  // ISO/IEC 17025:2017 - below logo in left column (matching reference: 10pt Arial)
  sf(doc, true); doc.fontSize(10).fillColor(BCLR);
  doc.text('ISO/IEC 17025:2017', ML, 58, {align:'left'});
  
  // Company info block - CENTER-aligned (matching reference DOCX)
  // Company name: 16pt Bold (matching reference sz=32 half-points)
  var isoY = 44;
  sf(doc, true); doc.fontSize(16).fillColor(BCLR);
  doc.text('LabMaster ST Co., Ltd', ML, isoY, {align:'center',width:CW});
  // Address: 9pt (matching reference sz=18 half-points)
  sf(doc, false); doc.fontSize(9).fillColor(BCLR);
  doc.text('No.17 street 179, Tang Nhon Phu ward, HCMC', ML, isoY+20, {align:'center',width:CW});
  // Email/Phone: 9pt
  doc.text('Email: sale@labmaster.vn / Phone: (+84) 938 088 239', ML, isoY+32, {align:'center',width:CW});
  
  // Title block - centered
  var ty = isoY + 48;
  sf(doc, true); doc.fontSize(14).fillColor(TC); doc.text(VN.title1, ML, ty, {align:'center',width:CW});
  sf(doc, false); doc.fontSize(12).fillColor(TC); doc.text(VN.title2, ML, ty+17, {align:'center',width:CW});
  // Cert No & Date - single line, centered
  var ciy = ty + 40;
  sf(doc, false); doc.fontSize(8).fillColor(BCLR);
  var certLine = (VN.certNo || '') + (VN.certNoEn || '') + (cno||'...........') + '    ' + (VN.date || '') + (VN.dateEn || '') + (cdate||'............');
  doc.text(certLine, ML, ciy, {align:'center',width:CW});
  return 146.0;
}

function drawFooter(doc, pg, totalPg) {
  // Footer line (measured: y=810.6, x 43.2-552.6, 0.5pt)
  doc.lineWidth(0.5).strokeColor('#000000');
  doc.moveTo(43.2, 810.6).lineTo(552.6, 810.6).stroke();
  // Footer text (Times italic, measured y=816.0-816.1)
  sf(doc, false, true, 'TIMES'); doc.fontSize(11).fillColor('#000000');
  doc.text(VN.footer1, 41.4, 816.0, {lineGap: 0});
  sf(doc, false, true, 'TIMES'); doc.fontSize(11).fillColor('#000000');
  doc.text(VN.footer2, 168.7, 816.1, {lineGap: 0});
  // Trang/Page: N/M - right aligned (ref: 'Trang/' 488.3, 'Page' 515.0, ': 1/2' 535.5)
  sf(doc, false, false, 'TIMES'); doc.fontSize(11);
  var t1 = 'Trang/', t2 = 'Page', t3 = ': ' + pg + '/' + totalPg;
  var w1 = doc.widthOfString(t1);
  sf(doc, false, true, 'TIMES'); doc.fontSize(11);
  var w2 = doc.widthOfString(t2);
  sf(doc, false, false, 'TIMES'); doc.fontSize(11);
  var w3 = doc.widthOfString(t3);
  var tot = w1 + w2 + w3;
  var px = 553.6 - tot;
  sf(doc, false, false, 'TIMES'); doc.fontSize(11);
  doc.text(t1, px, 816.1, {lineGap: 0});
  sf(doc, false, true, 'TIMES'); doc.fontSize(11);
  doc.text(t2, px + w1, 816.1, {lineGap: 0});
  sf(doc, false, false, 'TIMES'); doc.fontSize(11);
  doc.text(t3, px + w1 + w2, 816.1, {lineGap: 0});
}

// ── PAGE 1 BODY ──────────────────────────────────────────────────────
// Reference measured Y positions (fixed layout)
var Y1 = { // row start Y positions on page 1
  s1: 146.0, s1En: 157.5, s1Val2: 157.5, s1Val3: 172.5,
  s2: 195.0, s2En: 206.5, s2ValEn: 206.5,
  row35: 229.8, row35En: 241.3,
  row46: 257.6, row46En: 269.1,
  spec: 290.0, specEn: 300.3, specRow1: 315.6, specRowSp: 11.9,
  s11: 386.6, s11En1: 398.1, s11En2: 409.6, s11Val2: 398.1, s11Val3: 413.1,
  row1213: 438.4, row1213En: 449.9,
  s14: 480.7, s14En: 492.2, s14Env: 503.7,
  s15: 523.2, stdH: 542.0, stdHE: 553.5, stdRow1: 565.1, stdRowSp: 13.2,
  sig: 636.3, sigEn: 649.1, sigName: 769.7
};

// value wrapping helper: returns { lines, totalH } and draws text
function wrapText(doc, text, x, y, width, size, bold, ital, gap) {
  if (text === undefined || text === null || text === 'null') text = '';
  text = String(text);
  sf(doc, bold, ital); doc.fontSize(size).fillColor('#000000');
  var lines = [];
  var words = text.split(' ');
  var cur = '';
  for (var i = 0; i < words.length; i++) {
    var t = cur ? cur + ' ' + words[i] : words[i];
    if (doc.widthOfString(t) > width && cur) { lines.push(cur); cur = words[i]; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length === 0) lines = [''];
  var yy = y;
  for (var li = 0; li < lines.length; li++) {
    sf(doc, bold, ital); doc.fontSize(size).fillColor('#000000');
    doc.text(lines[li], x, yy, {lineGap: 0});
    yy += (gap || 13.2);
  }
  return lines.length;
}

function drawPage1Body(doc, cert, pts, stds, accM) {
  var name = (cert.CUSTOMER_NAME && cert.CUSTOMER_NAME !== 'null') ? cert.CUSTOMER_NAME : '';
  var addr = (cert.CUSTOMER_ADDRESS && cert.CUSTOMER_ADDRESS !== 'null') ? cert.CUSTOMER_ADDRESS : '';
  var inst = (cert.INSTRUMENT_NAME && cert.INSTRUMENT_NAME !== 'null') ? cert.INSTRUMENT_NAME : '';
  var instEn = (cert.INSTRUMENT_NAME_EN && cert.INSTRUMENT_NAME_EN !== 'null') ? cert.INSTRUMENT_NAME_EN : '';
  var manuf = (cert.MANUFACTURER && cert.MANUFACTURER !== 'null') ? cert.MANUFACTURER : '';
  var model = (cert.MODEL && cert.MODEL !== 'null' && cert.MODEL !== '') ? cert.MODEL : '';
  var eid = (cert.EQUIPMENT_ID && cert.EQUIPMENT_ID !== 'null') ? cert.EQUIPMENT_ID : '';
  var serial = (cert.SERIAL_NUMBER && cert.SERIAL_NUMBER !== 'null') ? cert.SERIAL_NUMBER : '';
  var calDate = cert.CAL_DATE ? pd(cert.CAL_DATE) : '';
  var reCal = cert.RE_CAL_DATE ? pd(cert.RE_CAL_DATE) : '';
  var temp = (cert.TEMP_ENV && cert.TEMP_ENV !== 'null') ? cert.TEMP_ENV : '';
  var humi = (cert.HUMI_ENV && cert.HUMI_ENV !== 'null') ? cert.HUMI_ENV : '';
  var proc = (cert.PROCEDURE && cert.PROCEDURE !== 'null') ? cert.PROCEDURE : '';
  var refStd = (cert.REF_STANDARD && cert.REF_STANDARD !== 'null') ? cert.REF_STANDARD : '';

  // ---- Section 1: Customer ----
  sf(doc, false); doc.fontSize(10).fillColor('#000000');
  doc.text(VN.sec1, LBL_X, Y1.s1, {lineGap: 0});
  sf(doc, true); doc.fontSize(10);
  doc.text(name, VAL_X, Y1.s1, {lineGap: 0});
  sf(doc, false, true); doc.fontSize(10);
  doc.text(VN.sec1En, LBL_X, Y1.s1En, {lineGap: 0});
  if (addr) { wrapText(doc, addr, VAL_X, Y1.s1Val2, 427.4, 10, true, false, 15); }

  // ---- Section 2: Instrument ----
  sf(doc, false); doc.fontSize(10); doc.text(VN.sec2, LBL_X, Y1.s2, {lineGap: 0});
  sf(doc, true); doc.fontSize(11); doc.text(inst, VAL_X, Y1.s2, {lineGap: 0});
  sf(doc, false, true); doc.fontSize(10); doc.text(VN.sec2En, LBL_X, Y1.s2En, {lineGap: 0});
  sf(doc, true, true); doc.fontSize(11); doc.text(instEn, VAL_X, Y1.s2ValEn, {lineGap: 0});

  // ---- Row 3 & 5: Manufacturer / Model ----
  sf(doc, false); doc.fontSize(10); doc.text(VN.sec3, LBL_X, Y1.row35, {lineGap: 0});
  sf(doc, false); doc.text(manuf, VAL_X, Y1.row35, {lineGap: 0});
  sf(doc, false); doc.text(VN.sec5, R_LBL_X, Y1.row35, {lineGap: 0});
  sf(doc, false);
  doc.text(model, 481.4, Y1.row35, {lineGap: 0});
  sf(doc, false, true); doc.fontSize(10); doc.text(VN.sec3En, LBL_X, Y1.row35En, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.sec5En, R_LBL_X, Y1.row35En, {lineGap: 0});

  // ---- Row 4 & 6: ID / Serial ----
  sf(doc, false); doc.fontSize(10); doc.text(VN.sec4, LBL_X, Y1.row46, {lineGap: 0});
  sf(doc, false); doc.text(eid, VAL_X, Y1.row46, {lineGap: 0});
  sf(doc, false); doc.text(VN.sec6, R_LBL_X, Y1.row46, {lineGap: 0});
  sf(doc, false);
  doc.text(serial, 528.7, Y1.row46, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.sec4En, LBL_X, Y1.row46En, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.sec6En, R_LBL_X, Y1.row46En, {lineGap: 0});

  // ---- Section 7-9: Spec table ----
  // drawSpecTable trả về cạnh dưới của bảng; đẩy các mục phía dưới xuống nếu bảng cao hơn layout chuẩn 5 dòng
  var specBottom = drawSpecTable(doc, pts, proc, refStd, accM);
  var dy = Math.max(0, specBottom - (Y1.specRow1 + 5 * Y1.specRowSp));

  // ---- Section 11: Place ----
  sf(doc, false); doc.fontSize(10); doc.text(VN.sec11, LBL_X, Y1.s11 + dy, {lineGap: 0});
  sf(doc, true); doc.text(name, VAL_X, Y1.s11 + dy, {lineGap: 0});
  sf(doc, false, true); doc.text('Place of', LBL_X, Y1.s11En1 + dy, {lineGap: 0});
  sf(doc, false, true); doc.text('Performance', LBL_X, Y1.s11En2 + dy, {lineGap: 0});
  if (addr) {
    sf(doc, true); doc.fontSize(10);
    var aLines = wrapText(doc, addr, VAL_X, Y1.s11Val2 + dy, 427.4, 10, true, false, 15);
  }

  // ---- Row 12 & 13: Dates ----
  sf(doc, false); doc.fontSize(10); doc.text(VN.sec12, LBL_X, Y1.row1213 + dy, {lineGap: 0});
  sf(doc, true); doc.text(calDate, VAL_X, Y1.row1213 + dy, {lineGap: 0});
  sf(doc, false); doc.text(VN.sec13, R_LBL_X, Y1.row1213 + dy, {lineGap: 0});
  sf(doc, true);
  doc.text(reCal, 526.4, Y1.row1213 + dy, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.sec12En, LBL_X, Y1.row1213En + dy, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.sec13En, R_LBL_X, Y1.row1213En + dy, {lineGap: 0});

  // ---- Section 14: Environment ----
  sf(doc, false); doc.fontSize(10); doc.text('14. Điều kiện môi ', LBL_X, Y1.s14 + dy, {lineGap: 0});
  sf(doc, false); doc.text('trường: ', LBL_X, Y1.s14En + dy, {lineGap: 0});
  sf(doc, false); doc.text(VN.temp + '  ', VAL_X, Y1.s14 + dy, {lineGap: 0});
  sf(doc, false); drawTextWithDegree(doc, temp, 246.8, Y1.s14 + dy, {lineGap: 0});
  sf(doc, false); doc.text(VN.humi + '  ', 360.4, Y1.s14 + dy, {lineGap: 0});
  sf(doc, false); doc.text(humi, 452.4, Y1.s14 + dy, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.tempEn + ' ', VAL_X, Y1.s14En + dy, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.humiEn, 360.4, Y1.s14En + dy, {lineGap: 0});
  sf(doc, false, true); doc.text(VN.sec14En, LBL_X, Y1.s14Env + dy, {lineGap: 0});

  // ---- Section 15: Standards ----
  drawStandardsTable(doc, stds, dy);

  // ---- Signature ----
  drawSignature(doc, cert, dy);
}

// Spec table (sections 7-9). Reference: single header line at y=303.9
// with '7. Đặc trưng kĩ thuật' (x=27), 'Phạm vi đo:' (x=127.9), 'Độ phân giải:' (x=275.3),
// '8. Quy trình thực hiện' (x=346.3), '9. Tiêu chuẩn tham khảo' (x=459.7)
// EN line at y=315.4: Spectification, Range, Resolution, Procedure, Reference Standard
// Bọc text thuần (không vẽ) — trả về mảng các dòng khớp chiều rộng cho trước
function splitLines(doc, text, width, size) {
  doc.fontSize(size || 7);
  var words = String(text || '').split(' ');
  var lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var t = cur ? cur + ' ' + words[i] : words[i];
    if (doc.widthOfString(t) > width && cur) { lines.push(cur); cur = words[i]; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  if (!lines.length) lines = [''];
  return lines;
}

function drawSpecTable(doc, pts, proc, refStd, accM) {
  var SPEC_X = [27.0, 133.6, 290.0, 410.0];
  var H1 = [VN.sec7, VN.sec7Range, VN.sec8, VN.sec9];
  var H2 = [VN.sec7En, VN.sec7RangeEn, VN.sec8En, VN.sec9En];
  var sizes = [10, 9, 10, 10];
  for (var i = 0; i < H1.length; i++) {
    sf(doc, false); doc.fontSize(sizes[i]).fillColor('#000000');
    doc.text(H1[i], SPEC_X[i], Y1.spec, {lineGap: 0});
    sf(doc, false, true); doc.fontSize(sizes[i]).fillColor('#000000');
    doc.text(H2[i], SPEC_X[i], Y1.specEn, {lineGap: 0});
  }
  // Data rows: range column = 'VN/EN: value' mixed style; proc/ref lines
  var rangeLines = [];
  var procLines = [], procSize = 10;
  if (accM && accM.length) {
    procSize = 9;
    for (var ai = 0; ai < accM.length && ai < 4; ai++) {
      var m = accM[ai] || {};
      var rngVal = m.phamViDo || m.pham_vi_do || '--';
      var procVal = m.quyTrinh || m.quy_trinh || '--';
      rangeLines.push(rngVal);
      procLines.push(procVal);
    }
  } else {
    if (pts && pts.length) {
      var seen = {};
      for (var pi = 0; pi < pts.length; pi++) {
        var pp = pts[pi];
        var pn = pp.PARAMETER_NAME || '';
        if (pn && !seen[pn]) {
          seen[pn] = true;
          var rng = pp.CAL_POINT || '';
          if (rng && rng.indexOf('\n') >= 0) {
            var sub = rng.split('\n');
            for (var si = 0; si < sub.length; si++) if (sub[si].trim()) rangeLines.push(sub[si]);
            break; // Exit loop if we found the multi-line range block
          } else if (rng) rangeLines.push(rng);
          else rangeLines.push(pn);
        }
      }
    }
    if (rangeLines.length === 0) rangeLines = ['--'];
    procLines = (proc || '').split(/[\n;]+/).map(function(s){return s.trim();}).filter(Boolean);
  }
  var refLines = (refStd || '').split(/[\n;]+/).map(function(s){return s.trim();}).filter(Boolean);
  var rows = Math.max(rangeLines.length, procLines.length, refLines.length);
  if (accM && accM.length && rows > 7) rows = 7; // cùng giới hạn an toàn cho mọi cột khi có accM
  var y = Y1.specRow1;
  for (var r = 0; r < rows; r++) {
    var rl = rangeLines[r] || '';
    // Parse 'VN/EN: value' if present
    var slash = rl.indexOf('/');
    var colon = rl.indexOf(':');
    if (slash > 0 && colon > slash) {
      var vnPart = rl.substring(0, slash + 1);
      var enPart = rl.substring(slash + 1, colon);
      var valPart = rl.substring(colon);
      sf(doc, false); doc.fontSize(9).fillColor('#000000');
      doc.text(vnPart, SPEC_X[1], y, {lineGap: 0});
      var vnx = SPEC_X[1] + doc.widthOfString(vnPart);
      sf(doc, false, true); doc.fontSize(9);
      doc.text(enPart, vnx, y, {lineGap: 0});
      sf(doc, false); doc.fontSize(9);
      drawTextWithDegree(doc, valPart, vnx + doc.widthOfString(enPart), y, {lineGap: 0});
    } else {
      sf(doc, false); doc.fontSize(9).fillColor('#000000');
      drawTextWithDegree(doc, rl, SPEC_X[1], y, {lineGap: 0});
    }
    sf(doc, false); doc.fontSize(procSize);
    doc.text(procLines[r] || '', SPEC_X[2], y, {lineGap: 0});
    sf(doc, false); doc.fontSize(10);
    doc.text(refLines[r] || '', SPEC_X[3], y, {lineGap: 0});
    y += Y1.specRowSp;
  }
  return y; // cạnh dưới của bảng (dùng để tính dy ở drawPage1Body)
}

// Standards table (section 15)
function drawStandardsTable(doc, stds, dy) {
  dy = dy || 0;
  var STD_X = [27.0, 133.6, 251.1, 363.1, 475.2];
  sf(doc, false); doc.fontSize(10).fillColor('#000000');
  doc.text(VN.sec15, LBL_X, Y1.s15 + dy, {lineGap: 0});
  sf(doc, false, true);
  doc.text(VN.sec15En, 121.0, Y1.s15 + dy, {lineGap: 0});
  sf(doc, false);
  for (var i = 0; i < 5; i++) {
    doc.text(VN.stdH[i], STD_X[i], Y1.stdH + dy, {lineGap: 0});
    sf(doc, false, true);
    doc.text(VN.stdHE[i], STD_X[i], Y1.stdHE + dy, {lineGap: 0});
    sf(doc, false);
  }
  var y = Y1.stdRow1 + dy;
  if (stds && stds.length) {
    for (var si = 0; si < stds.length; si++) {
      var s = stds[si];
      var vs = [s.EQ_NAME || '', s.EQ_CODE || '', s.STD_CERT_NO || '', s.LINK || '', s.VALIDITY || ''];
      sf(doc, false); doc.fontSize(10).fillColor('#000000');
      for (var ci = 0; ci < 5; ci++) doc.text(vs[ci], STD_X[ci], y, {lineGap: 0});
      y += Y1.stdRowSp;
    }
  }
  // If no standards, reference shows 5 blank rows (580.3, 593.5, ...) - nothing to draw
}

// Signature - NO lines (per user: match reference, no signature lines)
function drawSignature(doc, cert, dy) {
  dy = dy || 0;
  var headLab = (cert.HEAD_OF_LAB && cert.HEAD_OF_LAB !== 'null') ? cert.HEAD_OF_LAB : '';
  var director = (cert.DIRECTOR && cert.DIRECTOR !== 'null') ? cert.DIRECTOR : '';
  var leftC = 166.5, rightC = 428.0;
  sf(doc, true); doc.fontSize(11).fillColor('#000000');
  doc.text(VN.sigL, leftC - 95, Y1.sig + dy, {width: 190, align: 'center', lineGap: 0});
  doc.text(VN.sigLEn, leftC - 95, Y1.sigEn + dy, {width: 190, align: 'center', lineGap: 0});
  doc.text(VN.sigR, rightC - 55, Y1.sig + dy, {width: 110, align: 'center', lineGap: 0});
  doc.text(VN.sigREn, rightC - 55, Y1.sigEn + dy, {width: 110, align: 'center', lineGap: 0});
  if (headLab) { doc.text(headLab, leftC - 95, Y1.sigName + dy, {width: 190, align: 'center', lineGap: 0}); }
  if (director) { doc.text(director, rightC - 55, Y1.sigName + dy, {width: 110, align: 'center', lineGap: 0}); }
}

// ── PAGE 2: RESULTS TABLE ────────────────────────────────────────────
// Reference: title y=159.8 (11pt bold + bold-italic), table left=28.7 right=574.3
// Header top y=174.0 h=38.8. VN labels y=180.6-181.4, EN y=193.0-193.9 (10pt)
// Data rows y=212.8 + per-row heights (16pt for 1-line point rows, 38pt for 2-line)

// Vẽ dòng đầu tên thông số; nếu cuối dòng có marker (M)/(C)/(*) thì vẽ marker dạng
// CHỮ NHỎ NÂNG LÊN (superscript ~65% cỡ chữ chính, dịch y lên 2.5pt) ngay sau dòng VN
function drawParamFirstLine(doc, line, x, y, size) {
  sf(doc, false); doc.fontSize(size || 10).fillColor('#000000');
  var m = String(line).match(/\(([MC*])\)\s*$/);
  if (!m) { drawTextWithDegree(doc, line, x, y, {lineGap: 0}); return; }
  var clean = line.substring(0, line.length - m[0].length);
  drawTextWithDegree(doc, clean, x, y, {lineGap: 0});
  var w = doc.widthOfString(clean);
  sf(doc, false); doc.fontSize((size || 10) * 0.65);
  drawTextWithDegree(doc, m[0], x + w, y - 2.5, {lineGap: 0});
  doc.fontSize(size || 10);
}

function cleanParamName(name) {
  if (!name) return '';
  return String(name)
    .replace(/\(x\)/gi, '')
    .replace(/\(X\)/gi, '')
    .trim();
}

function drawResultsTable(doc, pts) {
  // Title
  sf(doc, true); doc.fontSize(11).fillColor('#000000');
  doc.text(VN.sec16, 36.0, 146.1, {lineGap: 0});
  sf(doc, true, true); doc.fontSize(11);
  doc.text(VN.sec16En, 100.9, 146.1, {lineGap: 0});
 
  var T = 160.3, TH = 38.8;
  var cols = [28.7, 176.9, 269.7, 355.4, 451.3, 511.2, 574.3]; // 6 header cells
  // Draw header row: VN at y+6.6, EN at y+19
  for (var i = 0; i < 6; i++) {
    var x0 = i === 0 ? cols[0] : cols[i];
    var x1 = cols[i + 1];
    doc.rect(x0, T, x1 - x0, TH).fillColor('#FFFFFF').fill();
    sf(doc, true); doc.fontSize(10).fillColor('#000000');
    doc.text(VN.resH[i], x0, T + 6.6, {width: x1 - x0, align: 'center', lineGap: 0});
    if (i === 3) { sf(doc, true); doc.fontSize(10); } else { sf(doc, true, true); doc.fontSize(10); }
    doc.text(VN.resHE[i], x0, T + 19.0, {width: x1 - x0, align: 'center', lineGap: 0});
  }
  // Grid: header borders
  doc.lineWidth(0.3).strokeColor('#000000');
  doc.rect(cols[0], T, cols[6] - cols[0], TH).stroke();
  for (var g = 0; g < 6; g++) {
    doc.moveTo(cols[g], T).lineTo(cols[g], T + TH).stroke();
  }
  doc.moveTo(cols[6], T).lineTo(cols[6], T + TH).stroke();
 
  // Data rows: group by PARAMETER_NAME
  var y = T + TH;
  var groups = [], cg = null;
  if (pts && pts.length) {
    for (var pi = 0; pi < pts.length; pi++) {
      var p = pts[pi];
      var pn = p.PARAMETER_NAME || '';
      if (!cg || cg.name !== pn) { cg = { name: pn, rows: [] }; groups.push(cg); }
      cg.rows.push(p);
    }
  }
  for (var gi = 0; gi < groups.length; gi++) {
    var grp = groups[gi];
    var isMulti = grp.rows.length > 1;
    for (var ri = 0; ri < grp.rows.length; ri++) {
      var r = grp.rows[ri];
      var isFirst = (ri === 0);
      var rowH = 16;
      if (isMulti) {
        if (ri === grp.rows.length - 1) rowH = 13.7;
        else rowH = 17.2;
      } else {
        if (grp.name.includes('Tốc độ') || grp.name.includes('Speed')) rowH = 44.0;
        else if (grp.name.includes('Hành trình') || grp.name.includes('Stroke')) rowH = 38.4;
        else if (grp.name.includes('Đường kính') || grp.name.includes('Finger')) rowH = 38.2;
        else rowH = 38.0;
      }
      if (y + rowH > 790) break;
      var dcols = [28.7, 127.9, 176.9, 269.7, 355.4, 451.3, 511.2];
      var dR = [127.9, 176.9, 269.7, 355.4, 451.3, 511.2, 574.3];
      doc.lineWidth(0.3).strokeColor('#000000');
      if (isFirst) {
        doc.moveTo(dcols[0], y).lineTo(dR[6], y).stroke();
      }
      if (ri === grp.rows.length - 1) {
        doc.moveTo(dcols[0], y + rowH).lineTo(dR[6], y + rowH).stroke();
      } else {
        doc.moveTo(dcols[1], y + rowH).lineTo(dR[3], y + rowH).stroke();
      }
      for (var g2 = 0; g2 < 7; g2++) {
        doc.moveTo(dcols[g2], y).lineTo(dcols[g2], y + rowH).stroke();
      }
      doc.moveTo(dR[6], y).lineTo(dR[6], y + rowH).stroke();
      // Cell values
      var paramTxt = isFirst ? cleanParamName(grp.name) : '';
      var pointTxt = String(r.CAL_POINT || '');
      if (pointTxt.indexOf('\n') >= 0) pointTxt = 'BEGIN';
      var foundTxt = String(r.AS_FOUND_VALUE || '');
      var uncTxt = String(r.UNCERTAINTY || '--');
      var midIndex = Math.floor(grp.rows.length / 2);
      var refTxt = (isMulti && ri !== midIndex) ? '' : String(r.REFERENCE_VALUE || '');
      var tolTxt = (isMulti && ri !== midIndex) ? '' : String(r.TOLERANCE || '');
      var confTxt = (isMulti && ri !== midIndex) ? '' : String(r.CONFORMITY || '--');
      sf(doc, false); doc.fontSize(10).fillColor('#000000');
      var isThreeLine = grp.name.includes('\n') && grp.name.split('\n').length >= 3;
      var pyV = y + (isMulti ? (ri === grp.rows.length - 1 ? 0.0 : 1.8) : (isThreeLine ? 13.3 : 6.7)); // point+values
      if (paramTxt) {
        var lines = paramTxt.split('\n');
        if (lines.length >= 3) {
          if (isMulti) {
            drawParamFirstLine(doc, lines[0], 34.2, y + 1.8, 10);
            doc.text(lines[1], 34.2, y + 14.5, {lineGap: 0});
            doc.text(lines[2], 34.2, y + 27.7, {lineGap: 0});
          } else {
            drawParamFirstLine(doc, lines[0], 34.2, y + 1.8, 10);
            doc.text(lines[1], 34.2, y + 13.3, {lineGap: 0});
            doc.text(lines[2], 34.2, y + 25.0, {lineGap: 0});
          }
        } else if (lines.length === 2) {
          drawParamFirstLine(doc, lines[0], 34.2, y + 1.8, 10);
          doc.text(lines[1], 34.2, y + 13.3, {lineGap: 0});
        } else {
          drawParamFirstLine(doc, paramTxt, 34.2, y + 1.8, 10);
        }
      }
      if (pointTxt) drawCell(doc, pointTxt, dcols[1], y, dR[1] - dcols[1], rowH, pyV);
      if (foundTxt) drawCell(doc, foundTxt, dcols[2], y, dR[2] - dcols[2], rowH, pyV);
      if (uncTxt) drawCell(doc, uncTxt, dcols[3], y, dR[3] - dcols[3], rowH, pyV);
      if (refTxt) drawCell(doc, refTxt, dcols[4], y, dR[4] - dcols[4], rowH, pyV);
      if (tolTxt) drawCell(doc, tolTxt, dcols[5], y, dR[5] - dcols[5], rowH, pyV);
      if (confTxt) drawCell(doc, confTxt, dcols[6], y, dR[6] - dcols[6], rowH, pyV);
      y += rowH;
    }
  }
  if (!groups.length) {
    doc.rect(28.7, y, 574.3 - 28.7, 16).stroke();
    sf(doc, false); doc.fontSize(10); doc.text('Chưa có dữ liệu', 28.7, y + 3, {width: 545, align: 'center', lineGap: 0});
    y += 16;
  }
  return y;
}

// Section 17 + legal text. Reference: all 8pt, x=20.0, EXACT line spacing 10.55pt
// Reference line positions: startY=483.4, each line at startY + n*10.55
function drawSection17(doc, startY, cNo, pts) {
  var x = 20.0, w = 564.4;
  var lh = 10.55;
  var vn, en;
 
  // Notes block (lines 0, 1, 2)
  sf(doc, false); doc.fontSize(8).fillColor('#000000');
  doc.text(VN.note, x, startY + 0 * lh - 0.2, {lineGap: 0});
  doc.text(VN.note1, x, startY + 1 * lh, {lineGap: 0});
  doc.text(VN.note2, x, startY + 2 * lh, {lineGap: 0});
 
  var l = 3;
 
  // 17 title (line 3)
  sf(doc, true); doc.fontSize(8).fillColor('#000000');
  doc.text(VN.sec17, x, startY + l * lh, {continued: true});
  sf(doc, true, true); doc.fontSize(8);
  doc.text(VN.sec17En);
  l++;
 
  // 17.1 title (line 4)
  sf(doc, true); doc.fontSize(8);
  doc.text(VN.uncertTitle, x, startY + l * lh, {continued: true});
  sf(doc, true, true); doc.fontSize(8);
  doc.text(VN.uncertTitleEn);
  l++;
 
  // 17.1 text: VN + EN inline using continued: true (lines 5-7)
  sf(doc, false); doc.fontSize(8);
  doc.text(VN.uncertVN, x, startY + l * lh, {width: w, continued: true, lineGap: 1.35});
  sf(doc, false, true);
  doc.text(VN.uncertEN, {lineGap: 1.35});
  var l = 8;
 
  // 17.2 title
  sf(doc, true); doc.fontSize(8);
  doc.text(VN.confTitle, x, startY + l * lh, {continued: true});
  sf(doc, true, true); doc.fontSize(8);
  doc.text(VN.confTitleEn);
  l++;
 
  // A-D items: bold '+ X:' + regular VN (line), EN italic (next line)
  for (var ci = 0; ci < VN.conf.length; ci++) {
    var parts = VN.conf[ci].split(' | ');
    vn = parts[0]; en = parts[1];
    var letter = vn.substring(0, 2);
    var rest = vn.substring(2);
    sf(doc, true); doc.fontSize(8); doc.text(letter, x, startY + l * lh, {continued: true});
    sf(doc, false); doc.fontSize(8);
    doc.text(rest, {width: w - 15});
    l++;
    sf(doc, false, true); doc.fontSize(8);
    var enL2 = wrapLines(doc, en, w);
    for (var ei2 = 0; ei2 < enL2.length; ei2++) {
      sf(doc, false, true); doc.fontSize(8);
      doc.text(enL2[ei2], x, startY + (l + ei2) * lh, {lineGap: 0});
    }
    l += enL2.length;
  }
 
  // 17.3 title
  sf(doc, true); doc.fontSize(8);
  doc.text(VN.otherTitle, x, startY + l * lh, {continued: true});
  sf(doc, true, true); doc.fontSize(8);
  doc.text(VN.otherTitleEn);
  l++;
 
  // 17.3 texts
  var o1 = wrapLines(doc, VN.otherVN, w);
  var o2 = wrapLines(doc, VN.otherEN, w);
  for (var oi = 0; oi < o1.length; oi++) { sf(doc, false); doc.fontSize(8); doc.text(o1[oi], x, startY + (l + oi) * lh, {lineGap: 0}); }
  l += o1.length;
  for (var oi2 = 0; oi2 < o2.length; oi2++) { sf(doc, false, true); doc.fontSize(8); doc.text(o2[oi2], x, startY + (l + oi2) * lh, {lineGap: 0}); }
  l += o2.length;

  // Ghi chú (M)/(C): hiển thị khi có ít nhất 1 thông số trong pts được đánh dấu (M) hoặc (C)
  // KHÔNG hardcode theo số GCN — phụ thuộc hoàn toàn vào dữ liệu thực tế
  var hasMCMark = false;
  if (pts && pts.length) {
    for (var pi17 = 0; pi17 < pts.length; pi17++) {
      var pn17 = (pts[pi17] && (pts[pi17].PARAMETER_NAME || '')) || '';
      if (/\(([MC])\)/.test(pn17)) { hasMCMark = true; break; }
    }
  }
  if (hasMCMark) {
    var o3 = wrapLines(doc, VN.otherVN2, w);
    var o4 = wrapLines(doc, VN.otherEN2, w);
    for (var oi3 = 0; oi3 < o3.length; oi3++) { sf(doc, false); doc.fontSize(8); doc.text(o3[oi3], x, startY + (l + oi3) * lh, {lineGap: 0}); }
    l += o3.length;
    for (var oi4 = 0; oi4 < o4.length; oi4++) { sf(doc, false, true); doc.fontSize(8); doc.text(o4[oi4], x, startY + (l + oi4) * lh, {lineGap: 0}); }
    l += o4.length;
  }
  l++; // blank line
 
  // Legal 1: VN + EN inline using continued: true
  sf(doc, false); doc.fontSize(8);
  doc.text(VN.legal1, x, startY + l * lh, {width: w, continued: true, lineGap: 1.35});
  sf(doc, false, true);
  doc.text(VN.legal1En, {lineGap: 1.35});
  // Legal 1 wraps to 2 lines
  l += 2;

  // Legal 2: VN (3 lines) then EN (2 lines)
  var lg2v = wrapLines(doc, VN.legal2, w);
  for (var li3 = 0; li3 < lg2v.length; li3++) { sf(doc, false); doc.fontSize(8); doc.text(lg2v[li3], x, startY + (l + li3) * lh, {lineGap: 0}); }
  l += lg2v.length;
  var lg2e = wrapLines(doc, VN.legal2En, w);
  for (var li4 = 0; li4 < lg2e.length; li4++) { sf(doc, false, true); doc.fontSize(8); doc.text(lg2e[li4], x, startY + (l + li4) * lh, {lineGap: 0}); }
  l += lg2e.length;

  // Legal 3: VN + EN inline using continued: true
  sf(doc, false); doc.fontSize(8);
  doc.text(VN.legal3, x, startY + l * lh, {width: w, continued: true, lineGap: 1.35});
  sf(doc, false, true);
  doc.text(VN.legal3En, {lineGap: 1.35});
  // Legal 3 wraps to 2 lines
  l += 2;
  return startY + l * lh;
}

// Word-wrap a string to fit width (uses current font), returns array of lines
function wrapLines(doc, text, width) {
  if (!text) return [''];
  var words = String(text).split(' ');
  var lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var t = cur ? cur + ' ' + words[i] : words[i];
    if (doc.widthOfString(t) > width && cur) { lines.push(cur); cur = words[i]; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  if (!lines.length) lines = [''];
  return lines;
}

async function main(opts) {
  try {
    var cNo = (opts && opts.certNo) || certNo;
    var dUrl = (opts && opts.downloadUrl) || downloadUrl;
    var eqName = (opts && opts.equipmentName) || equipmentName;
    var accM = (opts && opts.accreditedMethods) || []; // danh sách máy/phép thử được công nhận (STT + tên + mã QT)
    if (!cNo) {
      var errMsg = 'Loi: Vui long cung cap ma so.';
      if (require.main === module) { console.error(errMsg); process.exit(1); }
      else throw new Error(errMsg);
    }
    var qr = null;
    if (dUrl) { try { qr = await QRCode.toBuffer(dUrl, {width: 120, margin: 1, color: {dark: '#000000', light: '#ffffff'}}); } catch(e) {} }
    var cert = await g('SELECT * FROM CERTIFICATES WHERE CERT_NO = ?', [cNo]);
    cert = toUpperKeys(cert);
    const SD = process.env.VERCEL ? require('os').tmpdir() : path.join(BD, 'static');
    if (!fs.existsSync(SD)) fs.mkdirSync(SD, { recursive: true });
    const SN = cNo.replace(/[^a-zA-Z0-9]/g, '_');
    const OF = path.join(SD, 'GCN_' + SN + '.pdf');
    if (!cert) {
      var errMsg2 = 'Not found: ' + cNo;
      if (require.main === module) { console.error(errMsg2); process.exit(1); }
      else throw new Error(errMsg2);
    }
    var ptsQ = eqName
      ? "SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? AND EQUIPMENT_NAME = ? ORDER BY ID ASC"
      : "SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC";
    var ptsParams = eqName ? [cNo, eqName] : [cNo];
    var pts = toUpperKeys(await a(ptsQ, ptsParams));
    var stds = toUpperKeys(await a('SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC', [cNo]));

    // Logo: use project asset (240x84, matches reference logo rect)
    var lp = path.join(BD, 'public', 'img', 'logo_240.png');
    var logo = null;
    try { if (fs.existsSync(lp)) logo = fs.readFileSync(lp); } catch(e) {}

    var doc = new PDFDocument({size: 'A4', margin: 0, autoFirstPage: false});
    var buffers = [];
    const collector = new Writable({
      write(chunk, encoding, callback) { buffers.push(chunk); callback(); }
    });
    doc.pipe(collector);
    var ws = fs.createWriteStream(OF);
    doc.pipe(ws);
    try {
      if (FR) doc.registerFont(FNR, FR);
      if (FB) doc.registerFont(FNB, FB);
      if (FI) doc.registerFont(FNI, FI);
      if (FBI) doc.registerFont(FNBI, FBI);
      if (TR) doc.registerFont(FTR, TR);
      if (TI) doc.registerFont(FTI, TI);
    } catch(e) {}

    // ═══ PAGE 1 ═══
    doc.addPage();
    drawH(doc, logo, cNo, pd(cert.CAL_DATE), qr);
    drawPage1Body(doc, cert, pts, stds, accM);
    drawFooter(doc, 1, 2);

    // ═══ PAGE 2 ═══
    doc.addPage();
    drawH(doc, logo, cNo, pd(cert.CAL_DATE), qr);
    var tableEnd = drawResultsTable(doc, pts);
    // Section 17 starts after table + spacing
    var sec17Y = Math.max(tableEnd + 71.9, 477.7);
    drawSection17(doc, sec17Y, cNo, pts);
    drawFooter(doc, 2, 2);

    return new Promise(function(resolve, reject) {
      var fileDone = false, memDone = false;
      function checkDone() { if (fileDone && memDone) resolve(Buffer.concat(buffers)); }
      ws.on('finish', function() {
        console.log('[SUCCESS] Da xuat: GCN_' + SN + '.pdf');
        fileDone = true; checkDone();
      });
      ws.on('error', function(err) { console.error('LOI stream file:', err); reject(err); });
      collector.on('finish', function() { memDone = true; checkDone(); });
      collector.on('error', function(err) { console.error('LOI stream memory:', err); reject(err); });
      doc.end();
    });
  } catch(err) {
    console.error('LOI:', err);
    if (require.main === module) process.exit(1);
    else throw err;
  }
}

module.exports = { generatePDF: main };

if (require.main === module) { main(); }
