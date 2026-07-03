'use strict';
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const certNo = process.argv[2];
const downloadUrl = process.argv[3] || '';
if (!certNo) { console.error('Loi: Vui long cung cap ma so.'); process.exit(1); }

const BD = __dirname;
const DP = path.join(BD, 'labmaster_enterprise.db');
const SD = path.join(BD, 'static');
if (!fs.existsSync(SD)) fs.mkdirSync(SD, { recursive: true });
const SN = certNo.replace(/[^a-zA-Z0-9]/g, '_');
const OF = path.join(SD, 'GCN_' + SN + '.pdf');

const fpr = [path.join(BD, 'fonts', 'arial.ttf'), path.join(BD, 'arial.ttf'), 'C:\\Windows\\Fonts\\arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'];
const fpb = [path.join(BD, 'fonts', 'arialbd.ttf'), path.join(BD, 'arialbd.ttf'), 'C:\\Windows\\Fonts\\arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'];
const fpi = [path.join(BD, 'fonts', 'ariali.ttf'), path.join(BD, 'ariali.ttf'), 'C:\\Windows\\Fonts\\ariali.ttf'];
const fpbi = [path.join(BD, 'fonts', 'arialbi.ttf'), path.join(BD, 'arialbi.ttf'), 'C:\\Windows\\Fonts\\arialbi.ttf'];

function ff(ps) { for (var i = 0; i < ps.length; i++) { try { if (fs.existsSync(ps[i])) return ps[i]; } catch(e) {} } return null; }
var FR = ff(fpr), FB = ff(fpb), FI = ff(fpi), FBI = ff(fpbi);
var FNR = 'AR', FNB = 'AB', FNI = 'AI', FNBI = 'ABI';

var db = new sqlite3.Database(DP);
db.run('PRAGMA journal_mode = WAL');
db.configure('busyTimeout', 5000);

function g(sql, p) { return new Promise(function(r, j) { db.get(sql, p, function(e, d) { if(e) j(e); else r(d); }); }); }
function a(sql, p) { return new Promise(function(r, j) { db.all(sql, p, function(e, d) { if(e) j(e); else r(d); }); }); }

function pd(d) { if (!d) return ''; var p = d.split('-'); return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : d; }

function sf(doc, b, ital) {
  if (b === undefined) b = false;
  if (ital === undefined) ital = false;
  if (b && ital && FBI) { try { doc.font(FNBI); } catch(e) { doc.font('Helvetica-BoldOblique'); } }
  else if (ital && FI) { try { doc.font(FNI); } catch(e) { doc.font('Helvetica-Oblique'); } }
  else if (b && FB) { try { doc.font(FNB); } catch(e) { doc.font('Helvetica-Bold'); } }
  else if (!b && FR) { try { doc.font(FNR); } catch(e) { doc.font('Helvetica'); } }
  else { doc.font(b ? 'Helvetica-Bold' : 'Helvetica'); }
}

var TC = '#008080', PW = 595.28, PH = 841.89;
var ML = 40, MR = 40, MT = 130, CW = PW - ML - MR;
var BCLR = '#000000';
var DEMO = {
  CUSTOMER_NAME: 'C\u00f4ng ty TNHH May Alliance One',
  CUSTOMER_ADDRESS: 'Khu B (L\u00f4 B1, B2, B5, B6, B7, B8, B9, B10, B11, B12), KCN Giao Long, X\u00e3 Giao Long, T\u1ec9nh V\u0129nh Long, Vi\u1ec7t Nam',
  INSTRUMENT_NAME: 'M\u00e1y th\u1eed b\u1ec1n m\u00e0u ma s\u00e1t',
  INSTRUMENT_NAME_EN: 'Crocking meter',
  MANUFACTURER: 'James Heal',
  MANUFACTURER_ID: 'QV0388113',
  MODEL: 'CROCKMASTER HD',
  MODEL_SERIAL: 'TM092026',
  CAL_DATE: '25/06/2026',
  RE_CAL_DATE: '25/06/2027',
  TEMP_ENV: '[22 \u00b1 1] \u00b0C',
  HUMI_ENV: '[65 \u00b1 1] %RH',
  HEAD_OF_LAB: 'L\u00ea C\u1ea3nh Nh\u1eadt Quang',
  DIRECTOR: 'L\u01b0u Ng\u1ecdc Th\u1ed1ng'
};
var VN = {"title1":"GIẤY CHỨNG NHẬN HIỆU CHUẨN – ĐO LƯỜNG","title2":"CERTIFICATE OF CALIBRATION – MEASUREMENT","certNo":"Số GCN/Certificate No: ","date":"Ngày cấp/Date of issue: ","sec1":"Khách hàng","sec2":"Tên thiết bị","sec3":"Nhà sản xuất","sec4":"Mã quản lý","sec5":"Kiểu","sec6":"Số sản xuất","sec11":"Nơi thực hiện","sec12":"Ngày thực hiện","sec13":"Ngày thực hiện tiếp theo","sec14":"Điều kiện môi trường","sec15":"15. Chuẩn sử dụng / Standards Used :","sec16":"16. Kết quả / Results:","sec17":"17. Thông tin khác / Other information:","spec":"7. Đặc trưng kỹ thuật","range":"Phạm vi đo:","resolution":"Độ phân giải:","procedure":"8. Quy trình thực hiện","refStd":"9. Tiêu chuẩn tham khảo","temp":"Nhiệt độ:","humi":"Độ ẩm:","sigL":"PHỤ TRÁCH PHÒNG HIỆU CHUẨN","sigR":"GIÁM ĐỐC","headEn":"HEAD OF CALIBRATION LAB.","dirEn":"DIRECTOR","param":"Thông số","foundVal":"Giá trị đo được","uncert":"KĐBĐ","refVal":"Giá trị tham chiếu","tol":"Dung sai","conc":"Kết luận","paramEn":"Parameter","foundEn":"As found value","uncertEn":"Uncertainty","refEn":"Reference Value","tolEn":"Tolerance","concEn":"Conclusion","note":"Ghi chú / Note:","note1":"* Đánh giá theo thông số kỹ thuật của nhà sản xuất / Acceptance limit base on Manufacturer’s specifications.","note2":"* Đánh giá theo yêu cầu kỹ thuật của khách hàng / Acceptance limit base on Customer request.","uncertTitle":"17.1 Độ không đảm bảo đo / Uncertainty:","uncertVN":"Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy.","uncertEN":"The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.","confTitle":"17.2. Công bố về sự phù hợp / Statements of conformity:","conf":["+ A: Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép của tiêu chuẩn đánh giá. | The measurement reported with expanded uncertainty is within tolerance of standards.","+ B: Kết quả đo khi tính cả độ không đảm bảo đo hoàn toàn nằm ngoài giới hạn cho phép của tiêu chuẩn đánh giá. | The measurement reported with expanded uncertainty is out of tolerance of standards.","+ C: Kết quả đo khi tính cả độ không đảm bảo đo có thể nằm ngoài giới hạn cho phép của tiêu chuẩn. Không có kết luận trong trường hợp này. | The measurement reported with expanded uncertainty may be out of tolerance of standards. There is no conclusion for this measurement.","+ D: Tiêu chuẩn kỹ thuật không quy định dung sai của thông số đo. | There is no tolerance stated in technical standard and there is no conclusion for this measurement."],"otherTitle":"17.3 Khác / Other:","otherVN":"Các thông số có dấu (*) là không được công nhận ISO/IEC 17025","otherEN":"The characteristics marked with (*) is not accredited to comply with ISO/IEC 17025","legal1":"Giấy chứng nhận này không được sao chép dưới bất kỳ hình thức nào nếu không có sự đồng ý bằng văn bản của LabMaster./ This form shall not be reproduced, without the expressed written consent of LabMaster.","legal2":"Phương tiện đo này không được sử dụng định lượng hàng hóa, dịch vụ trong mua bán, thanh toán, đảm bảo an toàn, bảo vệ sức khỏe cộng đồng, bảo vệ môi trường, trong thanh tra, kiểm tra, giám định tư pháp và trong các hoạt động công vụ khác. Phương tiện đo này không được sử dụng trực tiếp để kiểm định phương tiện đo nhóm 2.","legal3":"This instrument do not used for quantifying goods, service in trading, payment, safety assurance, social heathcare, protecting the enviroment, inspection law and in other public service activities. This instrument shall not be used directly for the verification of group 2 instruments.","legal4":"Chúng tôi cung cấp khả năng truy xuất nguồn gốc phép đo theo các tiêu chuẩn quốc gia được công nhận hoặc các phòng thí nghiệm tiêu chuẩn quốc gia được công nhận khác.","legal5":"This certificate provides traceability of measurement to recognised national standards or other national standards laboratories.","footer":"www.labmaster.vn  |  Textile – Footwear – Leather - Children product Safety Tester",            "page":"Trang/Page: "};

var curPage = 1;

function drawBorder(doc) {
  doc.lineWidth(0.5).strokeColor('#767171');
  doc.rect(12, 12, PW - 24, PH - 24).stroke();
}

function drawH(doc, logo, cno, cdate, qr, pg) {
  // Draw page border first
  drawBorder(doc);
  
  // QR at top-right corner - matching reference DOCX (~48x47pt)
  if (qr) { try { doc.image(qr, PW - MR - 48, 12, {width:48,height:47}); } catch(e) {} }
  
  // Logo - matching reference DOCX (~106x37)
  if (logo) { try { doc.image(logo, ML, 3, {width:106,height:37}); } catch(e) {} }
  
  // ISO/IEC 17025:2017 - below logo in left column (matching reference: 10pt Arial)
  var isoY = 44;
  sf(doc, true); doc.fontSize(10).fillColor(BCLR);
  doc.text('ISO/IEC 17025:2017', ML, isoY, {align:'left'});
  
  // Company info block - CENTER-aligned (matching reference DOCX)
  // Company name: 16pt Bold (matching reference sz=32 half-points)
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
  var certLine = VN.certNo + (cno||'...........') + '    ' + VN.date + (cdate||'............');
  doc.text(certLine, ML, ciy, {align:'center',width:CW});
  return ciy + 24;
}

function drawFooter(doc, pg, totalPg) {
  var fy = PH-30;
  sf(doc, false); doc.fontSize(7).fillColor('#555555');
  doc.text(VN.footer, ML, fy, {align:'center',width:CW});
  sf(doc, false); doc.fontSize(7).fillColor('#555555');
  doc.text(VN.page + pg + '/' + totalPg, ML, fy, {align:'right',width:CW});
}

function newPage(doc, logo, cno, cdate, qr) {
  doc.addPage(); curPage++;
  return drawH(doc, logo, cno, cdate, qr, curPage);
}

function dr(doc, cx, y, lw, vw, label, val, en, boldVal) {
  // Draw a single grid row (like a table with hidden borders)
  var lx = cx;
  var vx = cx + lw;
  sf(doc, true); doc.fontSize(8.5).fillColor(BCLR);
  doc.text(label, lx, y, {width:lw-2});
  sf(doc, boldVal||false); doc.fontSize(8.5).fillColor(BCLR);
  doc.text('' + (val&&val!=='null'?val:''), vx, y, {width:vw-lw});
  if (en) { sf(doc, false, true); doc.fontSize(7.5).fillColor(BCLR); doc.text(en, vx, y+12, {width:vw-lw}); }
  return y + 24;
}

function dr2(doc, cx, cy, cw, l1, v1, e1, l2, v2, e2, lw1, lw2) {
  // Draw a 2-column grid row (table with hidden borders)
  if (lw1===undefined) lw1=85;
  if (lw2===undefined) lw2=75;
  var w2 = Math.floor((cw-10)/2);
  var x1 = cx;
  var x2 = cx + w2 + 10;
  
  // Left cell: label
  sf(doc, true); doc.fontSize(8.5).fillColor(BCLR);
  doc.text(l1, x1, cy, {width:lw1-2});
  // Left cell: value
  sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
  doc.text('' + (v1&&v1!=='null'?v1:''), x1+lw1, cy, {width:w2-lw1});
  // Left cell: English
  if (e1) { sf(doc,false,true); doc.fontSize(7.5).fillColor(BCLR); doc.text(e1, x1+lw1, cy+12, {width:w2-lw1}); }
  
  // Right cell: label
  sf(doc, true); doc.fontSize(8.5).fillColor(BCLR);
  doc.text(l2, x2, cy, {width:lw2-2});
  // Right cell: value
  sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
  doc.text('' + (v2&&v2!=='null'?v2:''), x2+lw2, cy, {width:w2-lw2});
  // Right cell: English
  if (e2) { sf(doc,false,true); doc.fontSize(7.5).fillColor(BCLR); doc.text(e2, x2+lw2, cy+12, {width:w2-lw2}); }
  
  return cy + 24;
}

function drawSpecTable(doc, specs, proc, refStd, cx, startY) {
  var y = startY;
  var cw = [CW*0.30, CW*0.14, CW*0.12, CW*0.22, CW*0.22];
  var h1 = [VN.spec, VN.range, VN.resolution, VN.procedure, VN.refStd];
  var h2 = ['Specification','Range','Resolution','Procedure','Reference Standard'];
  var hx = cx;
  sf(doc, false); doc.fontSize(7.5).fillColor(BCLR);
  for (var i = 0; i < h1.length; i++) { doc.text(h1[i], hx, y, {width:cw[i]-2, align:'center'}); hx += cw[i]; }
  var hy = y + 10; hx = cx;
  sf(doc, false, true); doc.fontSize(7).fillColor(BCLR);
  for (var i = 0; i < h2.length; i++) { doc.text(h2[i], hx, hy, {width:cw[i]-2, align:'center'}); hx += cw[i]; }
  var cy = hy + 13; doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx,cy).lineTo(cx+CW,cy).stroke(); cy += 3;
  
  var procVal = (proc && proc!=='null' ? proc : '');
  var refVal = (refStd && refStd!=='null' ? refStd : '');
  
  var rows = [];
  if (specs && specs.length > 0) {
    for (var si = 0; si < specs.length; si++) {
      var s = specs[si];
      rows.push([s.param||'', s.range||'', s.resolution||'', s.procedure||procVal, s.refStandard||refVal]);
    }
  } else {
    rows = [
      ['L\u1ef1c t\u00e1c d\u1ee5ng / Downward force:  9 N','--','--','FORCE-02:2026','AATCC TM 8, 165'],
      ['H\u00e0nh tr\u00ecnh / Stroke:  104 mm','--','--','LINEAR-08:2026','ISO 105:X12, D02'],
      ['\u0110\u01b0\u1eddng k\u00ednh \u0111\u1ea7u ma s\u00e1t / Finger Diameter:  16 mm','--','--','LINEAR-05:2026','--'],
      ['T\u1ed1c \u0111\u1ed9 / Speed:  --','--','--','--','--']
    ];
  }
  for (var ri = 0; ri < rows.length; ri++) {
    // Draw line before data row (after header, skip before first row since we already have a line there)
    if (ri > 0) {
      doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx, cy).lineTo(cx+CW, cy).stroke();
      cy += 2;
    }
    var cl = rows[ri]; hx = cx;
    sf(doc, false); doc.fontSize(7.5).fillColor(BCLR);
    for (var ci = 0; ci < cl.length; ci++) { doc.text(cl[ci], hx, cy, {width:cw[ci]-3, align:ci===0?'left':'center'}); hx += cw[ci]; }
    cy += 15;
  }
  doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx,cy).lineTo(cx+CW,cy).stroke();
  return cy + 5;
}

function drawStandardsTable(doc, stds, cx, startY) {
  var y = startY;
  var cols = [CW*0.22, CW*0.14, CW*0.16, CW*0.28, CW*0.20];
  sf(doc, false); doc.fontSize(8).fillColor(BCLR); doc.text(VN.sec15, cx, y); y += 14;
  var hl = ['Tên thiết bị','Số quản lý','Số chứng nhận','Liên kết chuẩn','Hiệu lực'];
  var hle = ['Name of Standard','ID','Certificate No.','Traceable to','Due date'];
  var hx = cx;
  sf(doc, false); doc.fontSize(7).fillColor(BCLR);
  for (var i = 0; i < hl.length; i++) { doc.text(hl[i], hx, y, {width:cols[i]-3, align:'center'}); hx += cols[i]; }
  hx = cx;
  sf(doc, false, true); doc.fontSize(6.5).fillColor(BCLR);
  for (var i = 0; i < hle.length; i++) { doc.text(hle[i], hx, y+9, {width:cols[i]-3, align:'center'}); hx += cols[i]; }
  y += 22; doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx,y).lineTo(cx+CW,y).stroke(); y += 2;
  if (stds && stds.length > 0) {
    for (var si = 0; si < stds.length; si++) {
      var s = stds[si]; hx = cx;
      var vs = [s.EQ_NAME||'-', s.EQ_CODE||'-', '-', s.LINK||'-', s.VALIDITY||'-'];
      sf(doc, false); doc.fontSize(7).fillColor(BCLR);
      for (var ci = 0; ci < vs.length; ci++) { doc.text(vs[ci], hx, y, {width:cols[ci]-3, align:ci===0?'left':'center'}); hx += cols[ci]; }
      y += 14;
    }
  } else { sf(doc,false); doc.fontSize(7).fillColor(BCLR); doc.text('...',cx,y,{width:CW,align:'center'}); y += 12; }
  return y + 3;
}

function drawSignature(doc, headOfLab, director, cx, startY) {
  var y = startY;
  var sw = (CW - 20) / 2;
  sf(doc, true); doc.fontSize(9).fillColor(BCLR);
  doc.text(VN.sigL, cx, y, {align:'center',width:sw});
  sf(doc, false); doc.fontSize(7.5).fillColor(BCLR);
  doc.text(VN.headEn, cx, y+12, {align:'center',width:sw});
  sf(doc, true); doc.fontSize(9).fillColor(BCLR);
  doc.text(VN.sigR, cx+sw+20, y, {align:'center',width:sw});
  sf(doc, false); doc.fontSize(7.5).fillColor(BCLR);
  doc.text(VN.dirEn, cx+sw+20, y+12, {align:'center',width:sw});
  var ly = y + 34;
  doc.lineWidth(0.8).strokeColor(BCLR);
  doc.moveTo(cx+15, ly).lineTo(cx+sw-15, ly).stroke();
  doc.moveTo(cx+sw+35, ly).lineTo(cx+sw*2+5, ly).stroke();
  if (headOfLab) { sf(doc,false); doc.fontSize(8.5).fillColor(BCLR); doc.text(headOfLab, cx, ly+5, {align:'center',width:sw}); }
  if (director) { sf(doc,false); doc.fontSize(8.5).fillColor(BCLR); doc.text(director, cx+sw+20, ly+5, {align:'center',width:sw}); }
  return ly + 24;
}

async function main() {
  try {
    var qr = null;
    if (downloadUrl) { try { qr = await QRCode.toBuffer(downloadUrl, {width:120,margin:1,color:{dark:'#004d4d',light:'#ffffff'}}); } catch(e) {} }
    var cert = await g('SELECT * FROM CERTIFICATES WHERE CERT_NO = ?', [certNo]);
    if (!cert) { console.error('Not found:', certNo); db.close(); process.exit(1); }
    var pts = await a('SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ? ORDER BY ID ASC', [certNo]);
    var stds = await a('SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ? ORDER BY ID ASC', [certNo]);
    var lp = path.join(BD, '_ref_logo.png');
    var logo = null;
    try { if (fs.existsSync(lp)) logo = fs.readFileSync(lp); } catch(e) {}
    
    var doc = new PDFDocument({size:'A4', margins:{top:MT,bottom:20,left:ML,right:MR}, autoFirstPage: false});
    var ws = fs.createWriteStream(OF);
    doc.pipe(ws);
    try { if (FR) doc.registerFont(FNR, FR); if (FB) doc.registerFont(FNB, FB); if (FI) doc.registerFont(FNI, FI); if (FBI) doc.registerFont(FNBI, FBI); } catch(e) {}
    curPage = 1;
    
    // ===== PAGE 1 =====
    doc.addPage();
    var curY = drawH(doc, logo, certNo, pd(cert.CAL_DATE), qr, 1);
    
    // === SECTIONS 1-6: Grid layout with hardcoded demo fallback ===
    // Section 1: Customer - full width
    var custName = (cert.CUSTOMER_NAME && cert.CUSTOMER_NAME!=='null') ? cert.CUSTOMER_NAME : DEMO.CUSTOMER_NAME;
    var custAddr = (cert.CUSTOMER_ADDRESS && cert.CUSTOMER_ADDRESS!=='null') ? cert.CUSTOMER_ADDRESS : DEMO.CUSTOMER_ADDRESS;
    var custEn = 'Customer ' + custAddr;
    curY = dr(doc, ML, curY, 100, CW, '1. ' + VN.sec1 + ':', custName, custEn, false);
    
    // Section 2: Instrument - full width
    var instrName = (cert.INSTRUMENT_NAME && cert.INSTRUMENT_NAME!=='null') ? cert.INSTRUMENT_NAME : DEMO.INSTRUMENT_NAME;
    var instrNameEn = (cert.INSTRUMENT_NAME_EN && cert.INSTRUMENT_NAME_EN!=='null') ? cert.INSTRUMENT_NAME_EN : DEMO.INSTRUMENT_NAME_EN;
    curY = dr(doc, ML, curY, 100, CW, '2. ' + VN.sec2 + ':', instrName, 'Instrument ' + instrNameEn, false);
    
    // Sections 3/5 (Row A) and 4/6 (Row B) - 2-column grid
    var modelVal = (cert.MODEL && cert.MODEL!=='null' && cert.MODEL!=='') ? cert.MODEL : DEMO.MODEL;
    var manufVal = (cert.MANUFACTURER && cert.MANUFACTURER!=='null') ? cert.MANUFACTURER : DEMO.MANUFACTURER;
    var equipId = (cert.EQUIPMENT_ID && cert.EQUIPMENT_ID!=='null') ? cert.EQUIPMENT_ID : '';
    var serialVal = (cert.SERIAL_NUMBER && cert.SERIAL_NUMBER!=='null') ? cert.SERIAL_NUMBER : '';
    
    var manufId = (cert.MANUFACTURER_ID && cert.MANUFACTURER_ID!=='null') ? cert.MANUFACTURER_ID : DEMO.MANUFACTURER_ID;
    var modelSerial = (cert.MODEL_SERIAL && cert.MODEL_SERIAL!=='null') ? cert.MODEL_SERIAL : DEMO.MODEL_SERIAL;
    
    // Row A: 3 (Manufacturer) left, 5 (Model) right
    curY = dr2(doc, ML, curY, CW, 
      '3. ' + VN.sec3 + ':', manufVal, 'Manufacturer ' + (manufId||''),
      '5. ' + VN.sec5 + ':', modelVal, 'Model ' + (modelSerial||''),
      85, 55);
    
    // Row B: 4 (ID) left, 6 (Serial No.) right
    curY = dr2(doc, ML, curY, CW,
      '4. ' + VN.sec4 + ':', equipId, 'ID',
      '6. ' + VN.sec6 + ':', serialVal, 'Serial No.',
      75, 75);
    
    // 7. Spec table
    var specs = [];
    if (pts && pts.length > 0) {
      var seen = {};
      for (var pi = 0; pi < pts.length; pi++) {
        var pp = pts[pi];
        var pn = pp.PARAMETER_NAME || pp.parameter_name;          if (pn && !seen[pn]) { seen[pn] = true; specs.push({param:pn, range:pp.CAL_POINT||pp.cal_point||'', resolution:'', procedure:cert.PROCEDURE||'', refStandard:cert.REF_STANDARD||''}); }
      }
    }
    curY = drawSpecTable(doc, specs, cert.PROCEDURE, cert.REF_STANDARD, ML, curY);
    
    // 11. Place - full width
    var calDate = cert.CAL_DATE ? pd(cert.CAL_DATE) : DEMO.CAL_DATE;
    var reCalDate = cert.RE_CAL_DATE ? pd(cert.RE_CAL_DATE) : DEMO.RE_CAL_DATE;
    var placeEn = 'Place of Performance ' + custAddr;
    curY = dr(doc, ML, curY, 110, CW, '11. ' + VN.sec11 + ':', custName, placeEn, false);
    
    // 12-13: Dates in 2-column grid
    curY = dr2(doc, ML, curY, CW,
      '12. ' + VN.sec12 + ':', calDate, 'Date of performance',
      '13. ' + VN.sec13 + ':', reCalDate, 'Date of next performance',
      100, 155);
    
    // 14. Environment
    var tempStr = (cert.TEMP_ENV && cert.TEMP_ENV !== 'null') ? cert.TEMP_ENV : DEMO.TEMP_ENV;
    var humiStr = (cert.HUMI_ENV && cert.HUMI_ENV !== 'null') ? cert.HUMI_ENV : DEMO.HUMI_ENV;
    // Label: 14. Điều kiện môi trường:
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
    doc.text('14. ' + VN.sec14 + ':', ML, curY, {width:120, align:'left'});
    // Temperature: Nhiệt độ + value
    var envX = ML + 120;
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
    doc.text(VN.temp + ' ' + tempStr, envX, curY, {width:CW-120-10, align:'left'});
    sf(doc, false, true); doc.fontSize(7.5).fillColor(BCLR);
    doc.text('Temperature', envX, curY+12, {width:100, align:'left'});
    // Humidity
    var humX = envX + (CW-120)/2 + 5;
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
    doc.text(VN.humi + ' ' + humiStr, humX, curY, {width:(CW-120)/2-5, align:'left'});
    sf(doc, false, true); doc.fontSize(7.5).fillColor(BCLR);
    doc.text('Humidity', humX, curY+12, {width:100, align:'left'});
    // Environment - third line to match demo
    sf(doc, false, true); doc.fontSize(7.5).fillColor(BCLR);
    doc.text('Environment', ML+5, curY+24, {width:110, align:'left'});
    curY += 34;
    
    // 15. Standards
    curY = drawStandardsTable(doc, stds, ML, curY);
    
    // Signature
    var headLab = (cert.HEAD_OF_LAB && cert.HEAD_OF_LAB!=='null') ? cert.HEAD_OF_LAB : DEMO.HEAD_OF_LAB;
    var director = (cert.DIRECTOR && cert.DIRECTOR!=='null') ? cert.DIRECTOR : DEMO.DIRECTOR;
    curY = drawSignature(doc, headLab, director, ML, curY);
    drawFooter(doc, 1, 2);
    
    // ===== PAGE 2 =====
    curY = newPage(doc, logo, certNo, pd(cert.CAL_DATE), qr);
    
    // 16. Results
    sf(doc, true); doc.fontSize(8.5).fillColor(BCLR);
    doc.text(VN.sec16, ML, curY); curY += 15;
    var rCols = [CW*0.22, CW*0.20, CW*0.13, CW*0.18, CW*0.13, CW*0.14];
    var rHl = [VN.param, VN.foundVal, VN.uncert, VN.refVal, VN.tol, VN.conc];
    var rHle = [VN.paramEn, VN.foundEn, VN.uncertEn, VN.refEn, VN.tolEn, VN.concEn];
    var hx = ML;
    doc.lineWidth(0.3).strokeColor(BCLR);
    for (var i = 0; i < rHl.length; i++) {
      doc.rect(hx, curY, rCols[i], 20).fill('#F2F2F2').stroke(BCLR);
      sf(doc, true); doc.fontSize(6.5).fillColor(BCLR);
      doc.text(rHl[i], hx+2, curY+2, {width:rCols[i]-4, align:'center'});
      sf(doc, false, true); doc.fontSize(6).fillColor(BCLR);
      doc.text(rHle[i], hx+2, curY+10, {width:rCols[i]-4, align:'center'});
      hx += rCols[i];
    }
    curY += 20;
    
    if (pts && pts.length > 0) {
      var grps = [], cg = null;
      for (var pi = 0; pi < pts.length; pi++) {
        var p = pts[pi];
        var pn = p.PARAMETER_NAME || p.parameter_name || '-';
        if (!cg || cg.name !== pn) { cg = {name: pn, rows: []}; grps.push(cg); }
        cg.rows.push(p);
      }
      for (var gi = 0; gi < grps.length; gi++) {
        var g2 = grps[gi];
        for (var ri = 0; ri < g2.rows.length; ri++) {
          var r = g2.rows[ri];
          if (curY > PH - 60) { curY = newPage(doc, logo, certNo, pd(cert.CAL_DATE), qr); }
          var pt = ri === 0 ? g2.name : '';
          var confVal = String(r.CONFORMITY||r.conformity||'');
          if (!confVal) confVal = 'A';
          var vs = [pt, String(r.AS_FOUND_VALUE||r.as_found_value||''), String(r.UNCERTAINTY||r.uncertainty||''), String(r.REFERENCE_VALUE||r.reference_value||''), String(r.TOLERANCE||r.tolerance||''), confVal];
          hx = ML;
          for (var ci2 = 0; ci2 < vs.length; ci2++) {
            doc.rect(hx, curY, rCols[ci2], 16).stroke(BCLR);
            sf(doc, ri===0 && ci2===0);
            doc.fontSize(7).fillColor(BCLR);
            doc.text(vs[ci2], hx+2, curY+2, {width:rCols[ci2]-4, align:ci2===0?'left':'center'});
            hx += rCols[ci2];
          }
          curY += 16;
        }
      }
    } else {
      sf(doc, false); doc.fontSize(7).fillColor(BCLR);
      doc.text('Chưa có dữ liệu', ML, curY, {width:CW, align:'center'}); curY += 14;
    }
    curY += 4;
    
    // Notes
    sf(doc, true); doc.fontSize(8).fillColor(BCLR); doc.text(VN.note, ML, curY); curY += 13;
    sf(doc, false); doc.fontSize(7).fillColor(BCLR); doc.text(VN.note1, ML, curY, {width:CW}); curY += 12;
    doc.text(VN.note2, ML, curY, {width:CW}); curY += 16;
    
    // 17
    sf(doc, true); doc.fontSize(8.5).fillColor(BCLR); doc.text(VN.sec17, ML, curY); curY += 15;
    sf(doc, true); doc.fontSize(8).fillColor(BCLR); doc.text(VN.uncertTitle, ML, curY); curY += 12;
    sf(doc, false); doc.fontSize(7).fillColor(BCLR); doc.text(VN.uncertVN, ML, curY, {width:CW}); curY += 11;
    sf(doc, false, true); doc.fontSize(7).fillColor(BCLR); doc.text(VN.uncertEN, ML, curY, {width:CW}); curY += 15;
    
    // 17.2
    sf(doc, true); doc.fontSize(8).fillColor(BCLR); doc.text(VN.confTitle, ML, curY); curY += 12;
    for (var ci = 0; ci < VN.conf.length; ci++) {
      var parts = VN.conf[ci].split(' | ');
      sf(doc, true); doc.fontSize(7).fillColor(BCLR);
      doc.text(parts[0], ML, curY, {width:CW * 0.48});
      sf(doc, false, true); doc.fontSize(7).fillColor(BCLR);
      doc.text(parts[1], ML + CW * 0.48 + 5, curY, {width:CW * 0.5 - 5});
      curY += 22;
    }
    curY += 4;
    
    // 17.3
    sf(doc, true); doc.fontSize(8).fillColor(BCLR); doc.text(VN.otherTitle, ML, curY); curY += 12;
    sf(doc, false); doc.fontSize(7).fillColor(BCLR); doc.text(VN.otherVN, ML, curY, {width:CW}); curY += 11;
    sf(doc, false, true); doc.fontSize(7).fillColor(BCLR); doc.text(VN.otherEN, ML, curY, {width:CW}); curY += 15;
    
    // Legal
    sf(doc, false); doc.fontSize(6.5).fillColor(BCLR); doc.text(VN.legal1, ML, curY, {width:CW}); curY += 12;
    doc.text(VN.legal2, ML, curY, {width:CW}); curY += 16;
    doc.text(VN.legal3, ML, curY, {width:CW}); curY += 16;
    doc.text(VN.legal4, ML, curY, {width:CW}); curY += 11;
    sf(doc, false, true); doc.fontSize(6.5).fillColor(BCLR); doc.text(VN.legal5, ML, curY, {width:CW}); curY += 14;
    
    drawFooter(doc, 2, 2);
    doc.end();
    ws.on('finish', function() { console.log('[SUCCESS] Da xuat: GCN_'+SN+'.pdf'); db.close(); process.exit(0); });
  } catch(err) { console.error('LOI:', err); db.close(); process.exit(1); }
}
main();
