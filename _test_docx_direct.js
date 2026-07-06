const { generateDocx } = require('./generate_docx');
const fs = require('fs');

async function main() {
  // Delete old file
  const fp = './static/GCN_TEST001.docx';
  if (fs.existsSync(fp)) fs.unlinkSync(fp);

  try {
    await generateDocx({ 
      certNo: 'TEST001', 
      downloadUrl: 'http://localhost:18080/static/GCN_TEST001.docx',
      equipmentName: ''
    });
    console.log('generateDocx SUCCESS');
    if (fs.existsSync(fp)) {
      console.log('FILE:', fp, fs.statSync(fp).size, 'bytes');
    }
  } catch(e) {
    console.error('FAILED:', e.message);
    console.error(e.stack);
  }
  process.exit(0);
}
main();
