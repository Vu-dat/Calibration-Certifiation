// Test HTTP export endpoint
const http = require('http');

const data = JSON.stringify({
  cert_no: 'TEST001',
  instrumentName: 'Test Instrument',
  manufacturer: 'Test Mfr',
  model: 'Test Model',
  equipmentId: 'EQ-001',
  serialNumber: 'SN-001',
  customerName: 'Test Customer',
  customerAddress: '123 Test St',
  calDate: '2026-07-06',
  reCalDate: '2027-07-06',
  procedure: 'PROC-01',
  refStandard: 'ISO 1234',
  tempEnv: '25 C',
  humiEnv: '65%',
  headOfLab: 'Head',
  director: 'Director'
});

const options = {
  hostname: 'localhost',
  port: 18080,
  path: '/api/calibration/export-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
    
    // Check if file was created
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'static', 'GCN_TEST001.pdf');
    if (fs.existsSync(filePath)) {
      console.log('FILE EXISTS:', filePath, 'size:', fs.statSync(filePath).size);
    } else {
      console.log('FILE NOT FOUND');
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
