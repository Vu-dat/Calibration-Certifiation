const http = require('http');
const fs = require('fs');

// Delete old file
const fp = './static/GCN_TEST001.docx';
if (fs.existsSync(fp)) fs.unlinkSync(fp);

// Test with equipmentName = '' (same as direct call that worked)
const payload = {
  cert_no: 'TEST001',
  instrumentName: 'May thử bền màu ma sát',
  manufacturer: 'James Heal',
  model: 'CROCKMASTER HD',
  equipmentId: 'EQ-001',
  serialNumber: 'SN-001',
  customerName: 'CÔNG TY TNHH May Alliance One',
  customerAddress: 'Khu B, KCN Giao Long, Vĩnh Long',
  calDate: '2026-07-06',
  reCalDate: '2027-07-06',
  procedure: 'FORCE-02:2026',
  refStandard: 'AATCC TM 8',
  tempEnv: '[25 ± 2] °C',
  humiEnv: '[65 ± 5] %RH',
  headOfLab: 'Lê Cảnh Nhật Quang',
  director: 'Lưu Ngọc Thống',
  equipmentName: ''  // <-- EMPTY like direct call
};

const body = JSON.stringify(payload);
const req = http.request({
  hostname: 'localhost', port: 18080,
  path: '/api/calibration/export-docx',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, async (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    console.log('STATUS:', res.statusCode);
    if (res.statusCode === 200 && fs.existsSync(fp)) {
      console.log('FILE SIZE:', fs.statSync(fp).size, 'bytes');
      
      const JSZip = require('jszip');
      const zip = await JSZip.loadAsync(fs.readFileSync(fp));
      const docXml = await zip.files['word/document.xml'].async('text');
      
      const checks = ['May thử', 'James Heal', 'CROCKMASTER', 'Alliance One', 'Lê Cảnh Nhật Quang'];
      let found = 0;
      checks.forEach(t => {
        const ok = docXml.includes(t);
        console.log(ok ? '✅' : '❌', t);
        if (ok) found++;
      });
      console.log('RESULT:', found + '/' + checks.length + ' fields found');
    }
    process.exit(0);
  });
});
req.on('error', e => { console.error('HTTP ERROR:', e.message); process.exit(1); });
req.write(body);
req.end();
