const http = require('http');
const fs = require('fs');

// Delete old
const fp = './static/GCN_DEBUG001.docx';
if (fs.existsSync(fp)) fs.unlinkSync(fp);

const payload = {
  cert_no: 'DEBUG001',
  instrumentName: 'Máy thử nghiệm kéo',
  manufacturer: 'Test Manufacturer',
  model: 'Test Model',
  equipmentId: 'EQ-DEBUG',
  serialNumber: 'SN-DEBUG',
  customerName: 'Công ty TNHH Test',
  customerAddress: '123 Test Street',
  calDate: '2026-07-06',
  reCalDate: '2027-07-06',
  procedure: 'TEST-PROC',
  refStandard: 'TEST-STD',
  tempEnv: '25°C',
  humiEnv: '65%',
  headOfLab: 'Test Head',
  director: 'Test Director',
  equipmentName: ''
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
    if (res.statusCode === 200) {
      const j = JSON.parse(data);
      console.log('MSG:', j.message);
    } else {
      console.log('ERROR:', data.substring(0, 500));
    }
    
    // Now check DB and regenerate directly
    const sql = require('./db');
    const rows = await sql`SELECT * FROM CERTIFICATES WHERE CERT_NO = ${'DEBUG001'}`;
    console.log('\n=== DB CHECK ===');
    if (rows.length > 0) {
      console.log('cert_no:', rows[0].cert_no);
      console.log('instrument_name:', rows[0].instrument_name);
      console.log('Keys:', Object.keys(rows[0]));
    } else {
      console.log('NO DATA IN DB');
    }
    
    // Now call generateDocx directly from this process
    const { generateDocx } = require('./generate_docx');
    
    // Delete and regenerate
    const fp2 = './static/GCN_DEBUG001.docx';
    if (fs.existsSync(fp2)) fs.unlinkSync(fp2);
    
    try {
      await generateDocx({ 
        certNo: 'DEBUG001', 
        downloadUrl: 'http://localhost:18080/static/GCN_DEBUG001.docx',
        equipmentName: '' 
      });
      console.log('\n=== DIRECT CALL RESULT ===');
      if (fs.existsSync(fp2)) {
        console.log('FILE:', fs.statSync(fp2).size, 'bytes');
        
        const JSZip = require('jszip');
        const zip = await JSZip.loadAsync(fs.readFileSync(fp2));
        const docXml = await zip.files['word/document.xml'].async('text');
        
        ['Máy thử', 'Test Manufacturer', 'Test Model', 'Công ty TNHH Test', 'Test Head'].forEach(t => {
          console.log(docXml.includes(t) ? '✅' : '❌', t);
        });
      }
    } catch(e) {
      console.error('DIRECT CALL FAILED:', e.message);
    }
    
    process.exit(0);
  });
});
req.on('error', e => { console.error('HTTP ERROR:', e.message); process.exit(1); });
req.write(body);
req.end();
