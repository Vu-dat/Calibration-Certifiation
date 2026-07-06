const http = require('http');

const data = JSON.stringify({
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
  director: 'Lưu Ngọc Thống'
});

const req = http.request({
  hostname: 'localhost',
  port: 18080,
  path: '/api/calibration/export-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body.substring(0, 500));
    if (res.statusCode === 200) {
      const json = JSON.parse(body);
      if (json.file_url) {
        const fs = require('fs');
        const filePath = json.file_url.replace('http://localhost:18080/', './');
        if (fs.existsSync(filePath)) {
          console.log('✓ PDF FILE EXISTS:', filePath, 'Size:', fs.statSync(filePath).size, 'bytes');
        } else {
          console.log('✗ PDF file NOT found at:', filePath);
        }
      }
    }
    process.exit(0);
  });
});
req.on('error', (e) => {
  console.error('REQUEST FAILED:', e.message);
  process.exit(1);
});
req.write(data);
req.end();
