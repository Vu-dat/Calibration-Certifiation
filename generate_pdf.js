'use strict';
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');

// Database connection (centralized) — Postgres via db.js
const db = require('./db');

// Adapter: SQLite ? → PostgreSQL $1, $2 for backward-compatible queries
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
const equipmentName = process.argv[4] || '';const BD = __dirname;

const fpr = [path.join(BD, 'fonts', 'arial.ttf'), path.join(BD, 'arial.ttf'), 'C:\\Windows\\Fonts\\arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'];
const fpb = [path.join(BD, 'fonts', 'arialbd.ttf'), path.join(BD, 'arialbd.ttf'), 'C:\\Windows\\Fonts\\arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'];
const fpi = [path.join(BD, 'fonts', 'ariali.ttf'), path.join(BD, 'ariali.ttf'), 'C:\\Windows\\Fonts\\ariali.ttf'];
const fpbi = [path.join(BD, 'fonts', 'arialbi.ttf'), path.join(BD, 'arialbi.ttf'), 'C:\\Windows\\Fonts\\arialbi.ttf'];

function ff(ps) { for (var i = 0; i < ps.length; i++) { try { if (fs.existsSync(ps[i])) return ps[i]; } catch(e) {} } return null; }
var FR = ff(fpr), FB = ff(fpb), FI = ff(fpi), FBI = ff(fpbi);
// Fallback fonts bundled in repo for Vercel/Linux (supports Vietnamese)
var fprV = [path.join(BD, 'fonts', 'tahoma.ttf'), path.join(BD, 'fonts', 'DejaVuSans.ttf')];
var fpbV = [path.join(BD, 'fonts', 'tahomabd.ttf'), path.join(BD, 'fonts', 'DejaVuSans-Bold.ttf')];
var FRv = ff(fprV), FBv = ff(fpbV);
// NOTE: Font registration with `doc` happens inside main() — see registerFont block there
var FNR = 'AR', FNB = 'AB', FNI = 'AI', FNBI = 'ABI';



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

// toUpperKeys: chuy\u1ec3n key c\u1ee7a postgres row (Array v\u1edbi named properties lowercase) th\u00e0nh key UPPERCASE
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

var VN = {"title1":"GIẤY CHỨNG NHẬN HIỆU CHUẨN – ĐO LƯỜNG","title2":"CERTIFICATE OF CALIBRATION – MEASUREMENT","certNo":"Số GCN/Certificate No: ","date":"Ngày cấp/Date of issue: ","sec1":"Khách hàng","sec2":"Tên thiết bị","sec3":"Nhà sản xuất","sec4":"Mã quản lý","sec5":"Kiểu","sec6":"Số sản xuất","sec11":"Nơi thực hiện","sec12":"Ngày thực hiện","sec13":"Ngày thực hiện tiếp theo","sec14":"Điều kiện môi trường","sec15":"15. Chuẩn sử dụng / Standards Used :","sec16":"16. Kết quả / Results:","sec17":"17. Thông tin khác / Other information:","spec":"7. Đặc trưng kỹ thuật","range":"Phạm vi đo:","resolution":"Độ phân giải:","procedure":"8. Quy trình thực hiện","refStd":"9. Tiêu chuẩn tham khảo","temp":"Nhiệt độ:","humi":"Độ ẩm:","sigL":"PHỤ TRÁCH PHÒNG HIỆU CHUẨN","sigR":"GIÁM ĐỐC","headEn":"HEAD OF CALIBRATION LAB.","dirEn":"DIRECTOR","param":"Thông số","foundVal":"Giá trị đo được","uncert":"KĐBĐ","refVal":"Giá trị tham chiếu","tol":"Dung sai","conc":"Kết luận","paramEn":"Parameter","foundEn":"As found value","uncertEn":"Uncertainty","refEn":"Reference Value","tolEn":"Tolerance","concEn":"Conclusion","note":"Ghi chú / Note:","note1":"* Đánh giá theo thông số kỹ thuật của nhà sản xuất / Acceptance limit base on Manufacturer’s specifications.","note2":"* Đánh giá theo yêu cầu kỹ thuật của khách hàng / Acceptance limit base on Customer request.","uncertTitle":"17.1 Độ không đảm bảo đo / Uncertainty:","uncertVN":"Độ không đảm bảo đo là độ không đảm bảo đo mở rộng được tính từ độ không đảm bảo đo chuẩn nhân với hệ số phủ k=2, phân bố chuẩn tương đương với 95% độ tin cậy.","uncertEN":"The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.","confTitle":"17.2. Công bố về sự phù hợp / Statements of conformity:","conf":["+ A: Kết quả đo khi tính cả độ không đảm bảo đo nằm trong giới hạn cho phép của tiêu chuẩn đánh giá. | The measurement reported with expanded uncertainty is within tolerance of standards.","+ B: Kết quả đo khi tính cả độ không đảm bảo đo hoàn toàn nằm ngoài giới hạn cho phép của tiêu chuẩn đánh giá. | The measurement reported with expanded uncertainty is out of tolerance of standards.","+ C: Kết quả đo khi tính cả độ không đảm bảo đo có thể nằm ngoài giới hạn cho phép của tiêu chuẩn. Không có kết luận trong trường hợp này. | The measurement reported with expanded uncertainty may be out of tolerance of standards. There is no conclusion for this measurement.","+ D: Tiêu chuẩn kỹ thuật không quy định dung sai của thông số đo. | There is no tolerance stated in technical standard and there is no conclusion for this measurement."],"otherTitle":"17.3 Khác / Other:","otherVN":"Các thông số có dấu (*) là không được công nhận ISO/IEC 17025","otherEN":"The characteristics marked with (*) is not accredited to comply with ISO/IEC 17025","otherVN2":"Các thông số đánh dấu (ᶜ) là kết quả hiệu chuẩn, các thông số đánh dấu (ᴹ) là kết quả đo thử nghiệm","otherEN2":"The characteristics marked with (ᶜ) are results of calibration, (ᴹ) are results of measurement","legal1":"Giấy chứng nhận này không được sao chép dưới bất kỳ hình thức nào nếu không có sự đồng ý bằng văn bản của LabMaster./ This form shall not be reproduced, without the expressed written consent of LabMaster.","legal2":"Phương tiện đo này không được sử dụng định lượng hàng hóa, dịch vụ trong mua bán, thanh toán, đảm bảo an toàn, bảo vệ sức khỏe cộng đồng, bảo vệ môi trường, trong thanh tra, kiểm tra, giám định tư pháp và trong các hoạt động công vụ khác. Phương tiện đo này không được sử dụng trực tiếp để kiểm định phương tiện đo nhóm 2.","legal3":"This instrument do not used for quantifying goods, service in trading, payment, safety assurance, social heathcare, protecting the enviroment, inspection law and in other public service activities. This instrument shall not be used directly for the verification of group 2 instruments.","legal4":"Chúng tôi cung cấp khả năng truy xuất nguồn gốc phép đo theo các tiêu chuẩn quốc gia được công nhận hoặc các phòng thí nghiệm tiêu chuẩn quốc gia được công nhận khác.","legal5":"This certificate provides traceability of measurement to recognised national standards or other national standards laboratories.","footer":"www.labmaster.vn  |  Textile – Footwear – Leather - Children product Safety Tester",            "page":"Trang/Page: "};

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
  // Draw a single grid row with dynamic height
  var lx = cx;
  var vx = cx + lw;
  // Label (bold)
  sf(doc, true); doc.fontSize(9).fillColor(BCLR);
  doc.text(label, lx, y, {width:lw-2});
  var labelH = doc.heightOfString(label, {width:lw-2});
  // Value
  sf(doc, boldVal||false); doc.fontSize(9).fillColor(BCLR);
  var valStr = '' + (val&&val!=='null'?val:'');
  doc.text(valStr, vx, y, {width:vw-lw});
  var valH = doc.heightOfString(valStr, {width:vw-lw});
  var vnH = Math.max(labelH, valH);
  if (en) {
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text(en, vx, y + vnH + 3, {width:vw-lw});
    var enH = doc.heightOfString(en, {width:vw-lw});
    return y + vnH + 3 + enH + 4;
  }
  return y + vnH + 5;
}

function dr2(doc, cx, cy, cw, l1, v1, e1, l2, v2, e2, lw1, lw2) {
  // Draw a 2-column grid row with dynamic height.
  // Left column: value LEFT-aligned right after the label, value x fixed
  //   at cx+lw1 so sections 1/2/3/4/11/12 all line up on the same guide.
  // Right column: value RIGHT-aligned to the row's right edge (cx+cw) so
  //   sections 5/6/13 line up with each other regardless of label length
  //   -- matching the reference certificate layout.
  if (lw1===undefined) lw1=100;
  if (lw2===undefined) lw2=90;
  var w2 = Math.floor((cw-10)/2);
  var x1 = cx;
  var x2 = cx + w2 + 10;
  var rightEdge = cx + cw;
  // Step 1: Draw & measure left VN (label + value)
  sf(doc, true); doc.fontSize(9).fillColor(BCLR);
  doc.text(l1, x1, cy, {width:lw1-2});
  var l1H = doc.heightOfString(l1, {width:lw1-2});
  sf(doc, false); doc.fontSize(9).fillColor(BCLR);
  var v1Str = '' + (v1&&v1!=='null'?v1:'');
  doc.text(v1Str, x1+lw1, cy, {width:w2-lw1});
  var v1H = doc.heightOfString(v1Str, {width:w2-lw1});
  var leftVnH = Math.max(l1H, v1H);
  // Step 2: Draw & measure right VN (label left-aligned, value right-aligned to rightEdge)
  sf(doc, true); doc.fontSize(9).fillColor(BCLR);
  doc.text(l2, x2, cy, {width:lw2-2});
  var l2H = doc.heightOfString(l2, {width:lw2-2});
  sf(doc, false); doc.fontSize(9).fillColor(BCLR);
  var v2Str = '' + (v2&&v2!=='null'?v2:'');
  var v2X = x2 + lw2;
  var v2W = rightEdge - v2X;
  doc.text(v2Str, v2X, cy, {width:v2W, align:'right'});
  var v2H = doc.heightOfString(v2Str, {width:v2W});
  var rightVnH = Math.max(l2H, v2H);
  // Step 3: Unified max VN height for English alignment
  var maxVnH = Math.max(leftVnH, rightVnH);
  // Step 4: Draw both English texts at the SAME height
  var leftEnH = 0, rightEnH = 0;
  if (e1) {
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text(e1, x1+lw1, cy + maxVnH + 3, {width:w2-lw1});
    leftEnH = doc.heightOfString(e1, {width:w2-lw1});
  }
  if (e2) {
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text(e2, v2X, cy + maxVnH + 3, {width:v2W, align:'right'});
    rightEnH = doc.heightOfString(e2, {width:v2W});
  }
  var maxEnH = Math.max(leftEnH, rightEnH);
  return cy + maxVnH + 3 + maxEnH + 4;
}

function drawSpecTable(doc, specs, proc, refStd, cx, startY) {
  var y = startY;
  
  // Section header: 7. \u0110\u1eb7c tr\u01b0ng k\u1ef9 thu\u1eadt - full width, left-aligned like sections 1-6
  sf(doc, true); doc.fontSize(9).fillColor(BCLR);
  doc.text(VN.spec, cx, y, {width:CW});
  y += 16;
  
  // Sub-table headers
  var cw = [CW*0.28, CW*0.18, CW*0.16, CW*0.19, CW*0.19];
  var h1 = [VN.param, VN.range.replace(':',''), VN.resolution.replace(':',''), VN.procedure, VN.refStd];
  var h2 = ['Parameter', 'Range', 'Resolution', 'Procedure', 'Reference Standard'];
  var hx = cx;
  sf(doc, false); doc.fontSize(8).fillColor(BCLR);
  for (var i = 0; i < h1.length; i++) { doc.text(h1[i], hx, y, {width:cw[i]-2, align:'center'}); hx += cw[i]; }
  var hy = y + 11; hx = cx;
  sf(doc, false, true); doc.fontSize(7.5).fillColor(BCLR);
  for (var i = 0; i < h2.length; i++) { doc.text(h2[i], hx, hy, {width:cw[i]-2, align:'center'}); hx += cw[i]; }
  var cy = hy + 14; doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx,cy).lineTo(cx+CW,cy).stroke(); cy += 3;
  
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
      ['', '', '', procVal || '', refVal || '']
    ];
  }
  for (var ri = 0; ri < rows.length; ri++) {
    // Draw line before data row (after header, skip before first row since we already have a line there)
    if (ri > 0) {
      doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx, cy).lineTo(cx+CW, cy).stroke();
      cy += 2;
    }
    var cl = rows[ri]; hx = cx;
    sf(doc, false); doc.fontSize(8).fillColor(BCLR);
    for (var ci = 0; ci < cl.length; ci++) { doc.text(cl[ci], hx, cy, {width:cw[ci]-3, align:ci===0?'left':'center'}); hx += cw[ci]; }
    cy += 17;
  }
  doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx,cy).lineTo(cx+CW,cy).stroke();
  return cy + 5;
}

function drawStandardsTable(doc, stds, cx, startY) {
  var y = startY;
  y += 6;
  var cols = [CW*0.22, CW*0.14, CW*0.16, CW*0.28, CW*0.20];
  sf(doc, true); doc.fontSize(9).fillColor(BCLR); doc.text(VN.sec15, cx, y); y += 15;
  var hl = ['Tên thiết bị','Số quản lý','Số chứng nhận','Liên kết chuẩn','Hiệu lực'];
  var hle = ['Name of Standard','ID','Certificate No.','Traceable to','Due date'];
  var hx = cx;
  sf(doc, false); doc.fontSize(7.5).fillColor(BCLR);
  for (var i = 0; i < hl.length; i++) { doc.text(hl[i], hx, y, {width:cols[i]-3, align:'center'}); hx += cols[i]; }
  hx = cx;
  sf(doc, false, true); doc.fontSize(7).fillColor(BCLR);
  for (var i = 0; i < hle.length; i++) { doc.text(hle[i], hx, y+10, {width:cols[i]-3, align:'center'}); hx += cols[i]; }
  y += 24; doc.lineWidth(0.3).strokeColor(BCLR).moveTo(cx,y).lineTo(cx+CW,y).stroke(); y += 2;
  if (stds && stds.length > 0) {
    for (var si = 0; si < stds.length; si++) {
      var s = stds[si]; hx = cx;
      var vs = [s.EQ_NAME||'-', s.EQ_CODE||'-', '-', s.LINK||'-', s.VALIDITY||'-'];
      sf(doc, false); doc.fontSize(7.5).fillColor(BCLR);
      for (var ci = 0; ci < vs.length; ci++) { doc.text(vs[ci], hx, y, {width:cols[ci]-3, align:ci===0?'left':'center'}); hx += cols[ci]; }
      y += 16;
    }
  } else { sf(doc,false); doc.fontSize(7.5).fillColor(BCLR); doc.text('...',cx,y,{width:CW,align:'center'}); y += 14; }
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

async function main(opts) {
  try {
    // Accept params from both CLI (process.argv) and direct call (opts object)
  var cNo = (opts && opts.certNo) || certNo;
  var dUrl = (opts && opts.downloadUrl) || downloadUrl;
  var eqName = (opts && opts.equipmentName) || equipmentName;
  if (!cNo) {
    var errMsg = 'Loi: Vui long cung cap ma so.';
    if (require.main === module) { console.error(errMsg); process.exit(1); }
    else throw new Error(errMsg);
  }
  var qr = null;
  if (dUrl) { try { qr = await QRCode.toBuffer(dUrl, {width:120,margin:1,color:{dark:'#004d4d',light:'#ffffff'}}); } catch(e) {} }
  var cert = await g('SELECT * FROM CERTIFICATES WHERE CERT_NO = ?', [cNo]);
    cert = toUpperKeys(cert);
  // Compute output paths inside main() (certNo is guaranteed to be valid here)
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
    var lp = path.join(BD, '_ref_logo.png');
    var logo = null;
    try { if (fs.existsSync(lp)) logo = fs.readFileSync(lp); } catch(e) {}
    
    var doc = new PDFDocument({size:'A4', margins:{top:MT,bottom:20,left:ML,right:MR}, autoFirstPage: false});
    var ws = fs.createWriteStream(OF);
    doc.pipe(ws);
    try {
      if (FR) doc.registerFont(FNR, FR);
      if (FB) doc.registerFont(FNB, FB);
      if (FI) doc.registerFont(FNI, FI);
      if (FBI) doc.registerFont(FNBI, FBI);
      // Register Vercel fallback fonts (Tahoma supports Vietnamese)
      if (!FR && FRv) { doc.registerFont('Helvetica', FRv); FR = FRv; FNR = 'Helvetica'; }
      if (!FB && FBv) { doc.registerFont('Helvetica-Bold', FBv); FB = FBv; FNB = 'Helvetica-Bold'; }
    } catch(e) {}
    curPage = 1;
    
    // ===== PAGE 1 =====
    doc.addPage();
    var curY = drawH(doc, logo, cNo, pd(cert.CAL_DATE), qr, 1);
    
    // === SECTIONS 1-6: Grid layout with data from DB ===
    // Section 1: Customer - full width
    var custName = (cert.CUSTOMER_NAME && cert.CUSTOMER_NAME!=='null') ? cert.CUSTOMER_NAME : '';
    var custAddr = (cert.CUSTOMER_ADDRESS && cert.CUSTOMER_ADDRESS!=='null') ? cert.CUSTOMER_ADDRESS : '';
    var custEn = 'Customer ' + custAddr;
    curY = dr(doc, ML, curY, 100, CW, '1. ' + VN.sec1 + ':', custName, custEn, false);
    
    // Section 2: Instrument - full width
    var instrName = (cert.INSTRUMENT_NAME && cert.INSTRUMENT_NAME!=='null') ? cert.INSTRUMENT_NAME : '';
    var instrNameEn = (cert.INSTRUMENT_NAME_EN && cert.INSTRUMENT_NAME_EN!=='null') ? cert.INSTRUMENT_NAME_EN : '';
    curY = dr(doc, ML, curY, 100, CW, '2. ' + VN.sec2 + ':', instrName, 'Instrument ' + instrNameEn, false);
    
    // Sections 3/5 (Row A) and 4/6 (Row B) - 2-column grid
    var modelVal = (cert.MODEL && cert.MODEL!=='null' && cert.MODEL!=='') ? cert.MODEL : '';
    var manufVal = (cert.MANUFACTURER && cert.MANUFACTURER!=='null') ? cert.MANUFACTURER : '';
    var equipId = (cert.EQUIPMENT_ID && cert.EQUIPMENT_ID!=='null') ? cert.EQUIPMENT_ID : '';
    var serialVal = (cert.SERIAL_NUMBER && cert.SERIAL_NUMBER!=='null') ? cert.SERIAL_NUMBER : '';
    
    var manufId = (cert.MANUFACTURER_ID && cert.MANUFACTURER_ID!=='null') ? cert.MANUFACTURER_ID : '';
    var modelSerial = (cert.MODEL_SERIAL && cert.MODEL_SERIAL!=='null') ? cert.MODEL_SERIAL : '';
    
    // Row A: 3 (Manufacturer) left, 5 (Model) right
    // NOTE: lw1/lw2 must match Row B exactly so the left value column
    // (3 vs 4) and the right value column (5 vs 6) both line up vertically.
    curY = dr2(doc, ML, curY, CW, 
      '3. ' + VN.sec3 + ':', manufVal, 'Manufacturer ' + (manufId||''),
      '5. ' + VN.sec5 + ':', modelVal, 'Model ' + (modelSerial||''),
      100, 90);
    
    // Row B: 4 (ID) left, 6 (Serial No.) right
    curY = dr2(doc, ML, curY, CW,
      '4. ' + VN.sec4 + ':', equipId, 'ID',
      '6. ' + VN.sec6 + ':', serialVal, 'Serial No.',
      100, 90);
    curY += 6;
    
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
    
    curY += 8;
    // 11. Place - full width
    var calDate = cert.CAL_DATE ? pd(cert.CAL_DATE) : '';
    var reCalDate = cert.RE_CAL_DATE ? pd(cert.RE_CAL_DATE) : '';
    var placeEn = 'Place of Performance ' + custAddr;
    curY = dr(doc, ML, curY, 100, CW, '11. ' + VN.sec11 + ':', custName, placeEn, false);
    
    // 12-13: Dates in 2-column grid
    curY = dr2(doc, ML, curY, CW,
      '12. ' + VN.sec12 + ':', calDate, 'Date of performance',
      '13. ' + VN.sec13 + ':', reCalDate, 'Date of next performance',
      100, 155);
    curY += 6;
    
    // 14. Environment
    var tempStr = (cert.TEMP_ENV && cert.TEMP_ENV !== 'null') ? cert.TEMP_ENV : '';
    var humiStr = (cert.HUMI_ENV && cert.HUMI_ENV !== 'null') ? cert.HUMI_ENV : '';
    // Label: 14. Điều kiện môi trường: (BOLD)
    sf(doc, true); doc.fontSize(9).fillColor(BCLR);
    doc.text('14. ' + VN.sec14 + ':', ML, curY, {width:120, align:'left'});
    // Temperature: Nhiệt độ + value
    var envX = ML + 120;
    sf(doc, false); doc.fontSize(9).fillColor(BCLR);
    doc.text(VN.temp + ' ' + tempStr, envX, curY, {width:CW-120-10, align:'left'});
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text('Temperature', envX, curY+13, {width:100, align:'left'});
    // Humidity
    var humX = envX + (CW-120)/2 + 5;
    sf(doc, false); doc.fontSize(9).fillColor(BCLR);
    doc.text(VN.humi + ' ' + humiStr, humX, curY, {width:(CW-120)/2-5, align:'left'});
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text('Humidity', humX, curY+13, {width:100, align:'left'});
    // Environment - third line to match demo
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text('Environment', ML+5, curY+26, {width:110, align:'left'});
    curY += 42;
    
    // 15. Standards
    curY = drawStandardsTable(doc, stds, ML, curY);
    
    // Signature
    var headLab = (cert.HEAD_OF_LAB && cert.HEAD_OF_LAB!=='null') ? cert.HEAD_OF_LAB : '';
    var director = (cert.DIRECTOR && cert.DIRECTOR!=='null') ? cert.DIRECTOR : '';
    curY = drawSignature(doc, headLab, director, ML, curY);
    drawFooter(doc, 1, 2);
    
    // ===== PAGE 2 =====
    curY = newPage(doc, logo, cNo, pd(cert.CAL_DATE), qr);
    
    // 16. Results
    sf(doc, true); doc.fontSize(10).fillColor(BCLR);
    doc.text(VN.sec16, ML, curY); curY += 16;
    var rCols = [CW*0.22, CW*0.20, CW*0.13, CW*0.18, CW*0.13, CW*0.14];
    var rHl = [VN.param, VN.foundVal, VN.uncert, VN.refVal, VN.tol, VN.conc];
    var rHle = [VN.paramEn, VN.foundEn, VN.uncertEn, VN.refEn, VN.tolEn, VN.concEn];
    var hx = ML;
    doc.lineWidth(0.3).strokeColor(BCLR);
    for (var i = 0; i < rHl.length; i++) {
      doc.rect(hx, curY, rCols[i], 24).fill('#F2F2F2').stroke(BCLR);
      sf(doc, true); doc.fontSize(8).fillColor(BCLR);
      doc.text(rHl[i], hx+2, curY+2, {width:rCols[i]-4, align:'center'});
      sf(doc, false, true); doc.fontSize(7.5).fillColor(BCLR);
      doc.text(rHle[i], hx+2, curY+12, {width:rCols[i]-4, align:'center'});
      hx += rCols[i];
    }
    curY += 24;
    
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
          if (curY > PH - 80) { curY = newPage(doc, logo, cNo, pd(cert.CAL_DATE), qr); }
          var pt = ri === 0 ? g2.name : '';
          var confVal = String(r.CONFORMITY||r.conformity||'');
          if (!confVal) confVal = 'A';
          var rawFound = String(r.AS_FOUND_VALUE||r.as_found_value||'');
          var foundAvg = '';
          if (rawFound) {
            var parts = rawFound.split('/');
            var nums = [];
            for (var pi = 0; pi < parts.length; pi++) {
              var n = parseFloat(parts[pi].trim());
              if (!isNaN(n)) nums.push(n);
            }
            if (nums.length > 0) {
              var sum = nums.reduce(function(a,b){return a+b;},0);
              foundAvg = (Math.round(sum / nums.length * 100) / 100).toString();
            }
          }
          var displayFound = foundAvg || rawFound;
          var vs = [pt, displayFound, String(r.UNCERTAINTY||r.uncertainty||''), String(r.REFERENCE_VALUE||r.reference_value||''), String(r.TOLERANCE||r.tolerance||''), confVal];
          hx = ML;
          for (var ci2 = 0; ci2 < vs.length; ci2++) {
            doc.rect(hx, curY, rCols[ci2], 22).stroke(BCLR);
            sf(doc, ri===0 && ci2===0);
            doc.fontSize(8.5).fillColor(BCLR);
            doc.text(vs[ci2], hx+2, curY+4, {width:rCols[ci2]-4, align:ci2===0?'left':'center'});
            hx += rCols[ci2];
          }
          curY += 22;
        }
      }
    } else {
      sf(doc, false); doc.fontSize(8).fillColor(BCLR);
      doc.text('Chưa có dữ liệu', ML, curY, {width:CW, align:'center'}); curY += 16;
    }
    curY += 6;
    
    // Notes
    sf(doc, true); doc.fontSize(9).fillColor(BCLR); doc.text(VN.note, ML, curY); curY += 16;
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR); doc.text(VN.note1, ML, curY, {width:CW}); curY += 15;
    doc.text(VN.note2, ML, curY, {width:CW}); curY += 19;
    
    // 17
    sf(doc, true); doc.fontSize(10).fillColor(BCLR); doc.text(VN.sec17, ML, curY); curY += 18;
    sf(doc, true); doc.fontSize(9.5).fillColor(BCLR); doc.text(VN.uncertTitle, ML, curY); curY += 16;
    // Use heightOfString for 17.1 to prevent VN/EN text overlap
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
    var uvh = doc.heightOfString(VN.uncertVN, {width:CW});
    doc.text(VN.uncertVN, ML, curY, {width:CW}); curY += uvh + 3;
    sf(doc, false, true); doc.fontSize(8.5).fillColor(BCLR);
    var ueh = doc.heightOfString(VN.uncertEN, {width:CW});
    doc.text(VN.uncertEN, ML, curY, {width:CW}); curY += ueh + 4;
    
    // 17.2
    sf(doc, true); doc.fontSize(9.5).fillColor(BCLR); doc.text(VN.confTitle, ML, curY); curY += 16;
    for (var ci = 0; ci < VN.conf.length; ci++) {
      var parts = VN.conf[ci].split(' | ');
      var vnPart = parts[0];
      var enPart = parts[1];
      // Extract letter (A/B/C/D) from format "+ X: ..."
      var vnPrefix = vnPart.substring(0, 2); // "+ "
      var letter = vnPart.charAt(2);          // "A"
      var vnSuffix = vnPart.substring(3);     // ": ..."
      
      // Pre-measure VN height with regular font
      sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
      var vnH = doc.heightOfString(vnPart, {width: CW - 5});
      
      // Draw VN: prefix (regular) + letter (bold) + suffix (regular) on same line
      sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
      doc.text(vnPrefix, ML, curY, {continued: true});
      sf(doc, true); doc.fontSize(8.5).fillColor(BCLR);
      doc.text(letter, {continued: true});
      sf(doc, false); doc.fontSize(8.5).fillColor(BCLR);
      doc.text(vnSuffix, {width: CW - 5});
      curY += vnH + 3;
      
      // Draw EN below (italic, not bold)
      sf(doc, false, true); doc.fontSize(8.5).fillColor(BCLR);
      var enH = doc.heightOfString(enPart, {width: CW - 5});
      doc.text(enPart, ML, curY, {width: CW - 5});
      curY += enH + 3;
    }
    curY += 6;
    
    // 17.3
    sf(doc, true); doc.fontSize(9.5).fillColor(BCLR); doc.text(VN.otherTitle, ML, curY); curY += 16;
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR); doc.text(VN.otherVN, ML, curY, {width:CW}); curY += 14;
    sf(doc, false, true); doc.fontSize(8.5).fillColor(BCLR); doc.text(VN.otherEN, ML, curY, {width:CW}); curY += 18;
    // New 17.3 lines
    sf(doc, false); doc.fontSize(8.5).fillColor(BCLR); doc.text(VN.otherVN2, ML, curY, {width:CW}); curY += 14;
    sf(doc, false, true); doc.fontSize(8.5).fillColor(BCLR); doc.text(VN.otherEN2, ML, curY, {width:CW}); curY += 18;
    
    // Legal - use heightOfString for each block to prevent overlapping
    sf(doc, false); doc.fontSize(8).fillColor(BCLR);
    var legalH1 = doc.heightOfString(VN.legal1, {width:CW});
    doc.text(VN.legal1, ML, curY, {width:CW}); curY += legalH1 + 4;
    var legalH2 = doc.heightOfString(VN.legal2, {width:CW});
    doc.text(VN.legal2, ML, curY, {width:CW}); curY += legalH2 + 4;
    var legalH3 = doc.heightOfString(VN.legal3, {width:CW});
    doc.text(VN.legal3, ML, curY, {width:CW}); curY += legalH3 + 4;
    var legalH4 = doc.heightOfString(VN.legal4, {width:CW});
    sf(doc, false); doc.fontSize(8).fillColor(BCLR);
    doc.text(VN.legal4, ML, curY, {width:CW}); curY += legalH4 + 4;
    var legalH5 = doc.heightOfString(VN.legal5, {width:CW});
    sf(doc, false, true); doc.fontSize(8).fillColor(BCLR);
    doc.text(VN.legal5, ML, curY, {width:CW}); curY += legalH5 + 4;
    
    drawFooter(doc, 2, 2);
    // Return a Promise that resolves when the PDF stream finishes writing
    // This is critical: process.exit() would kill the Express server!
    return new Promise(function(resolve, reject) {
      ws.on('finish', function() {
        console.log('[SUCCESS] Da xuat: GCN_'+SN+'.pdf');
        resolve();
      });
      ws.on('error', function(err) {
        console.error('LOI stream:', err);
        reject(err);
      });
      doc.end();
    });
  } catch(err) {
    console.error('LOI:', err);
    if (require.main === module) process.exit(1);
    else throw err;
  }
}

module.exports = { generatePDF: main };

// CLI entry point
if (require.main === module) { main(); }
