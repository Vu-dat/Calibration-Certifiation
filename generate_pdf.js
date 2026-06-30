'use strict';

/**
 * generate_pdf.js - Tao Giay Chung Nhan Hieu Chuan (PDF)
 * Thiet ke theo mau DOCX: co header (logo + cong ty + ISO),
 * bang border #767171, header bg #F2F2F2, day du cac muc 1-17.
 * Su dung: node generate_pdf.js <CERT_NO> [download_url]
 */

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

const fpr = [path.join(BD, 'arial.ttf'), 'C:\\Windows\\Fonts\\arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'];
const fpb = [path.join(BD, 'arialbd.ttf'), 'C:\\Windows\\Fonts\\arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'];
function ff(ps) { for (var i = 0; i < ps.length; i++) { try { if (fs.existsSync(ps[i])) return ps[i]; } catch(e) {} } return null; }
var FR = ff(fpr); var FB = ff(fpb);
var FNR = 'AR'; var FNB = 'AB';

var db = new sqlite3.Database(DP);
db.run('PRAGMA journal_mode = WAL'); db.configure('busyTimeout', 5000);
function g(sql, p) { return new Promise(function(r, j) { db.get(sql, p, function(e, d) { if(e) j(e); else r(d); }); }); }
function a(sql, p) { return new Promise(function(r, j) { db.all(sql, p, function(e, d) { if(e) j(e); else r(d); }); }); }

function pd(d) { if (!d) return ''; var p = d.split('-'); return p.length === 3 ? p[2]+'.'+p[1]+'.'+p[0] : d; }
function sf(doc, b) {
  if (b === undefined) b = false;
  if (b && FB) { try { doc.font(FNB); } catch(e) { doc.font('Helvetica-Bold'); } }
  else if (!b && FR) { try { doc.font(FNR); } catch(e) { doc.font('Helvetica'); } }
  else { doc.font(b ? 'Helvetica-Bold' : 'Helvetica'); }
}

// DOCX design constants
var CB = '#767171', CH = '#F2F2F2', CT = '#1a1a1a', CG = '#555555', PW = 595.28, PH = 841.89, ML = 45, MR = 45, MT = 130, CW = PW - ML - MR;

function drawH(doc, logo) {
  var y = 15;
  if (logo) { try { doc.image(logo, ML - 5, y, {width:68,height:26}); } catch(e) {} }
  sf(doc, true); doc.fontSize(10).fillColor('#000000');
  doc.text('Labmaster ST Company Limited', ML, y, {align:'right',width:CW});
  sf(doc, false); doc.fontSize(7.5).fillColor(CT);
  doc.text('17 street 179, Tang Nhon Phu ward, Ho Chi Minh city', ML, y+14, {align:'right',width:CW});
  doc.text('Email: sale@labmaster.vn / Phone: (+84) 938 088 239', ML, y+24, {align:'right',width:CW});
  sf(doc, true); doc.fontSize(8).fillColor(CT);
  doc.text('ISO/IEC 17025:2017', ML, y+42, {align:'right',width:CW});
  doc.lineWidth(1).strokeColor(CB).moveTo(ML, y+56).lineTo(PW-MR, y+56).stroke();
}

function drawT(doc, hds, rows, opts) {
  if (!opts) opts = {};
  var sx = opts.startX||ML, sy = opts.startY||doc.y, rh = opts.rowHeight||22, mh = opts.minRowH||22, hbg = opts.headerBg||CH, bc = opts.borderColor||CB;
  var y = sy;
  var tot = 0; for (var i = 0; i < hds.length-1; i++) tot += (hds[i].width||80);
  var rem = CW - tot, cw = [];
  for (var i = 0; i < hds.length; i++) cw.push(i < hds.length-1 ? (hds[i].width||80) : Math.max(rem, 60));
  if (y + (hds.length?rh:0) + rows.length*rh + 8 > PH-50) { doc.addPage(); drawH(doc, opts._logo); y = MT; }
  doc.lineWidth(0.5).strokeColor(bc);
  var x = sx;
  for (var i = 0; i < hds.length; i++) {
    doc.rect(x, y, cw[i], rh).fill(hbg).stroke(bc);
    sf(doc, true); doc.fontSize(hds[i].size||8).fillColor(CT);
    doc.text(hds[i].text, x+3, y+4, {width:cw[i]-6,align:hds[i].align||'center',lineBreak:false});
    x += cw[i];
  }
  y += rh;
  for (var ri = 0; ri < rows.length; ri++) {
    x = sx;
    var arh = Math.max(rh, mh);
    if (y + arh > PH-50) { doc.addPage(); drawH(doc, opts._logo); y = MT; x = sx; for (var i = 0; i < hds.length; i++) { doc.rect(x, y, cw[i], rh).fill(hbg).stroke(bc); sf(doc, true); doc.fontSize(hds[i].size||8).fillColor(CT); doc.text(hds[i].text, x+3, y+4, {width:cw[i]-6,align:hds[i].align||'center',lineBreak:false}); x += cw[i]; } y += rh; x = sx; }
    var row = rows[ri];
    for (var ci = 0; ci < row.length; ci++) {
      var cell = row[ci];
      doc.rect(x, y, cw[ci], arh).stroke(bc);
      sf(doc, cell.bold||false);
      doc.fontSize(cell.size||7.5).fillColor(cell.color||CT);
      doc.text(String(cell.text||''), x+3, y+4, {width:cw[ci]-6,align:cell.align||'center',lineBreak:false});
      x += cw[ci];
    }
    y += arh;
  }
  return y;
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

    var doc = new PDFDocument({size:'A4',margins:{top:MT,bottom:40,left:ML,right:MR}});
    var ws = fs.createWriteStream(OF);
    doc.pipe(ws);
    try { if (FR) doc.registerFont(FNR, FR); if (FB) doc.registerFont(FNB, FB); } catch(e) {}
    doc.on('pageAdded', function() { drawH(doc, logo); });
    drawH(doc, logo); doc.y = MT;
    if (qr) doc.image(qr, PW-MR-55, MT-22, {width:40,height:40});

    sf(doc, true); doc.fontSize(15).fillColor('#000000');
    doc.text('GIAY CHUNG NHAN HIEU CHUAN', ML, doc.y, {align:'center',width:CW}); doc.moveDown(0.2);
    sf(doc, false); doc.fontSize(13).fillColor(CT);
    doc.text('CERTIFICATE OF CALIBRATION', ML, doc.y, {align:'center',width:CW}); doc.moveDown(0.8);

    var lw = 95, hw = Math.floor((CW-lw*2)/2)+10, hw2 = hw-20;
    var ir = [
      [{text:'1. Ten thiet bi:\nInstrument',align:'left',size:7.5,bold:true},{text:cert.INSTRUMENT_NAME||'-',align:'left',size:7.5},{text:'8. So GCN:\nCertificate No.',align:'left',size:7.5,bold:true},{text:cert.CERT_NO||certNo,align:'left',size:7.5}],
      [{text:'2. Nha san xuat:\nManufacturer',align:'left',size:7.5,bold:true},{text:cert.MANUFACTURER||'-',align:'left',size:7.5},{text:'9. Ngay hieu chuan:\nCal. Date',align:'left',size:7.5,bold:true},{text:pd(cert.CAL_DATE||''),align:'left',size:7.5}],
      [{text:'3. Kieu:\nModel',align:'left',size:7.5,bold:true},{text:cert.MODEL||'-',align:'left',size:7.5},{text:'10. Ngay HC tiep theo:\nRe-cal. Date',align:'left',size:7.5,bold:true},{text:pd(cert.RE_CAL_DATE||''),align:'left',size:7.5}],
      [{text:'4. ID:',align:'left',size:7.5,bold:true},{text:cert.EQUIPMENT_ID||'-',align:'left',size:7.5},{text:'',align:'left',size:7.5},{text:'',align:'left',size:7.5}],
      [{text:'5. So san xuat:\nSN',align:'left',size:7.5,bold:true},{text:cert.SERIAL_NUMBER||'-',align:'left',size:7.5},{text:'',align:'left',size:7.5},{text:'',align:'left',size:7.5}],
      [{text:'6. Ten khach hang:\nCustomer',align:'left',size:7.5,bold:true},{text:cert.CUSTOMER_NAME||'-',align:'left',size:7.5,bold:true,color:'#000000'},{text:'',align:'left',size:7.5},{text:'',align:'left',size:7.5}],
      [{text:'7. Dia chi:\nAddress',align:'left',size:7.5,bold:true},{text:cert.CUSTOMER_ADDRESS||'-',align:'left',size:7.5,bold:true,color:'#000000'},{text:'',align:'left',size:7.5},{text:'',align:'left',size:7.5}]
    ];
    var iy = drawT(doc, [{text:'Muc / Item',width:lw,align:'center',size:7.5},{text:'Noi dung / Content',width:hw,align:'center',size:7.5},{text:'Muc / Item',width:lw,align:'center',size:7.5},{text:'Noi dung / Content',width:hw2,align:'center',size:7.5}], ir, {startX:ML,startY:doc.y,rowHeight:26,minRowH:26,borderColor:CB,headerBg:CH,_logo:logo});
    doc.y = iy + 6;

    var cl = 95, cv1 = Math.floor((CW-cl*2)*0.55), cv2 = CW-cl*2-cv1;
    var bhds = [{text:'Muc / Item',width:cl,align:'center',size:7.5},{text:'Noi dung / Content',width:cv1,align:'center',size:7.5},{text:'Muc / Item',width:cl,align:'center',size:7.5},{text:'Noi dung / Content',width:cv2,align:'center',size:7.5}];
    var bro = [];
    bro.push([{text:'11. Quy trinh hieu chuan:\nCal. Procedure',align:'left',size:7,bold:true},{text:cert.PROCEDURE||'-',align:'left',size:7},{text:'12. Tieu chuan tham chieu:\nRef. Standard',align:'left',size:7,bold:true},{text:cert.REF_STANDARD||'-',align:'left',size:7}]);
    if (stds.length > 0) {
      bro.push([{text:'13. Chuan su dung / Standards Used:',align:'left',size:7,bold:true,color:CT},{text:'',align:'left',size:7},{text:'',align:'left',size:7},{text:'',align:'left',size:7}]);
      bro.push([{text:'Ten thiet bi chuan / Standard Name',align:'center',size:7,bold:true,color:CT},{text:'ID',align:'center',size:7,bold:true,color:CT},{text:'Lien ket / Traceableto',align:'center',size:7,bold:true,color:CT},{text:'Hieu luc / Due date',align:'center',size:7,bold:true,color:CT}]);
      for (var si=0; si<stds.length; si++) {
        var s=stds[si]; bro.push([{text:s.EQ_NAME||'-',align:'left',size:7},{text:s.EQ_CODE||'-',align:'left',size:7},{text:s.LINK||'-',align:'center',size:7},{text:s.VALIDITY||'-',align:'center',size:7}]);
      }
    }
    bro.push([{text:'',align:'left',size:6},{text:'',align:'left',size:6},{text:'',align:'left',size:6},{text:'',align:'left',size:6}]);
    bro.push([{text:'14. Noi hieu chuan:\nPlace of Calibration',align:'left',size:7,bold:true},{text:(cert.CUSTOMER_NAME||'')+'\n'+(cert.CUSTOMER_ADDRESS||''),align:'left',size:7,bold:true,color:'#000000'},{text:'',align:'left',size:7},{text:'',align:'left',size:7}]);
    bro.push([{text:'15. Moi truong hieu chuan:\nCal. Environment',align:'left',size:7,bold:true},{text:'+ Nhiet do / Temperature:',align:'left',size:7},{text:'',align:'left',size:7},{text:cert.TEMP_ENV||'-',align:'left',size:7}]);
    bro.push([{text:'',align:'left',size:7},{text:'+ Do am / Humidity:',align:'left',size:7},{text:'',align:'left',size:7},{text:cert.HUMI_ENV||'-',align:'left',size:7}]);
    for (var i=0; i<3; i++) bro.push([{text:'',align:'center',size:6},{text:'',align:'center',size:6},{text:'',align:'center',size:6},{text:'',align:'center',size:6}]);
    var by = drawT(doc, bhds, bro, {startX:ML,startY:doc.y,rowHeight:20,minRowH:18,borderColor:CB,headerBg:CH,_logo:logo});
    doc.y = by + 6;

    // === CHU KY CHUYEN NGHIEP ===
    if (doc.y > PH-130) { doc.addPage(); drawH(doc, logo); doc.y = MT; }
    var sigY = doc.y;
    var sigColW = (CW - 20) / 2;
    var sigLeftX = ML;
    var sigRightX = ML + sigColW + 20;

    // Left: Head of Calibration Lab
    sf(doc, true); doc.fontSize(8).fillColor(CT);
    doc.text('PHU TRACH PHONG HIEU CHUAN', sigLeftX, sigY, {align:'center',width:sigColW});
    var subY = sigY + 14;
    sf(doc, false); doc.fontSize(7.5).fillColor(CG);
    doc.text('HEAD OF CALIBRATION LAB.', sigLeftX, subY, {align:'center',width:sigColW});

    // Right: Director
    sf(doc, true); doc.fontSize(8).fillColor(CT);
    doc.text('GIAM DOC', sigRightX, sigY, {align:'center',width:sigColW});
    sf(doc, false); doc.fontSize(7.5).fillColor(CG);
    doc.text('DIRECTOR', sigRightX, subY, {align:'center',width:sigColW});

    // Signature lines
    var lineY = subY + 46;
    doc.lineWidth(0.8).strokeColor('#000000');
    doc.moveTo(sigLeftX + 20, lineY).lineTo(sigLeftX + sigColW - 20, lineY).stroke();
    doc.moveTo(sigRightX + 20, lineY).lineTo(sigRightX + sigColW - 20, lineY).stroke();

    // Names below lines
    if (cert.HEAD_OF_LAB) {
      sf(doc, false); doc.fontSize(8).fillColor(CT);
      doc.text(cert.HEAD_OF_LAB, sigLeftX, lineY + 4, {align:'center',width:sigColW});
    }
    if (cert.DIRECTOR) {
      sf(doc, false); doc.fontSize(8).fillColor(CT);
      doc.text(cert.DIRECTOR, sigRightX, lineY + 4, {align:'center',width:sigColW});
    }

    doc.y = lineY + 22;

    sf(doc, false); doc.fontSize(7.5).fillColor(CT);
    doc.text('So GCN / Certificate No.: '+certNo, ML, doc.y, {align:'right',width:CW}); doc.moveDown(0.5);

    sf(doc, true); doc.fontSize(8).fillColor(CT);
    doc.text('16. Ket qua hieu chuan / Cal. Results:', ML, doc.y, {align:'left'}); doc.moveDown(0.4);
    var rH = [{text:'Thong so\nParameters',width:62,align:'center',size:6.5},{text:'Diem HC\nCal. Point',width:52,align:'center',size:6.5},{text:'Gia tri do duoc\nAs Found Value',width:60,align:'center',size:6.5},{text:'Do KDBD\nUncertainty',width:55,align:'center',size:6.5},{text:'Dung sai\nTolerance',width:50,align:'center',size:6.5},{text:'Thiet bi chuan\nStd. Equipment',width:72,align:'center',size:6.5},{text:'Su phu hop\nConformity',align:'center',size:6.5}];
    var rD = [];
    if (pts.length===0) { rD.push([{text:'Chua co du lieu',align:'center',size:7,color:CG},{text:'',align:'center',size:7},{text:'',align:'center',size:7},{text:'',align:'center',size:7},{text:'',align:'center',size:7},{text:'',align:'center',size:7},{text:'',align:'center',size:7}]); }
    else { for (var pi=0; pi<pts.length; pi++) { var p=pts[pi]; rD.push([{text:p.PARAMETER_NAME||p.parameter_name||'-',align:'left',size:6.5,bold:true},{text:String(p.CAL_POINT||p.cal_point||'-'),align:'center',size:6.5},{text:String(p.AS_FOUND_VALUE||p.as_found_value||'-'),align:'center',size:6.5},{text:String(p.UNCERTAINTY||p.uncertainty||'-'),align:'center',size:6.5},{text:String(p.TOLERANCE||p.tolerance||'-'),align:'center',size:6.5},{text:String(p.REF_EQUIPMENT||p.STANDARD_EQUIPMENT||p.ref_equipment||p.standard_equipment||'–'),align:'left',size:6},{text:String(p.CONFORMITY||p.conformity||'-'),align:'center',size:6.5}]); } }
    var ry = drawT(doc, rH, rD, {startX:ML,startY:doc.y,rowHeight:24,minRowH:22,borderColor:CB,headerBg:CH,_logo:logo});
    doc.y = ry + 8;

    sf(doc, true); doc.fontSize(8).fillColor(CT);
    doc.text('17. Thong tin khac / Other information:', ML, doc.y, {align:'left'}); doc.moveDown(0.4);
    sf(doc, true); doc.fontSize(7.5).fillColor(CT);
    doc.text('17.1 Do khong dam bao do / Uncertainty:', ML, doc.y); doc.moveDown(0.2);
    sf(doc, false); doc.fontSize(7).fillColor(CT);
    doc.text('Do khong dam bao do la do khong dam bao do mo rong duoc tinh tu do khong dam bao do chuan nhan voi he so phu k=2, phan bo chuan tuong duong voi 95% do tin cay.', ML, doc.y, {align:'left',width:CW}); doc.moveDown(0.1);
    doc.fontSize(7).fillColor('#555555');
    doc.text('The reported expanded uncertainty of measurement is stated as the standard uncertainty multiplied by a coverage factor k=2, which for a normal distribution corresponds to a coverage probability of approximately 95%.', ML, doc.y, {align:'left',width:CW}); doc.moveDown(0.4);
    sf(doc, true); doc.fontSize(7.5).fillColor(CT);
    doc.text('17.2 Cong bo ve su phu hop / Statements of conformity:', ML, doc.y); doc.moveDown(0.2);
    var cs = [{l:'A: ',v:'Ket qua do khi tinh ca do khong dam bao do nam trong gioi han cho phep.',e:'Within tolerance.'},{l:'B: ',v:'Ket qua do nam ngoai gioi han cho phep.',e:'Out of tolerance.'},{l:'C: ',v:'Ket qua do co the nam ngoai gioi han. Khong co ket luan.',e:'May be out of tolerance. No conclusion.'},{l:'D: ',v:'Tieu chuan ky thuat khong quy dinh dung sai.',e:'No tolerance stated.'}];
    for (var ci=0; ci<cs.length; ci++) {
      var c=cs[ci]; sf(doc,true); doc.fontSize(7).fillColor(CT); doc.text('+ '+c.l,{continued:true});
      sf(doc,false); doc.fontSize(7).fillColor(CT); doc.text(c.v+' ',{continued:true});
      doc.fontSize(7).fillColor('#555555'); doc.text(c.e); doc.moveDown(0.1);
    }
    doc.moveDown(2);
    sf(doc, false); doc.fontSize(7).fillColor(CG);
    doc.text('www.labmaster.vn  |  Textile - Footwear - Children Products Safety Tester', ML, PH-35, {align:'center',width:CW});
    doc.end();
    ws.on('finish', function() { console.log('[SUCCESS] Da xuat: GCN_'+SN+'.pdf'); db.close(); process.exit(0); });
  } catch(err) { console.error('LOI:', err); db.close(); process.exit(1); }
}
main();

// END