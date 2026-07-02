const docx = require('docx');
const fs = require('fs');

async function test() {
  const pb = new docx.PageBorders({
    top: { style: docx.BorderStyle.SINGLE, size: 6, color: '000000', space: 24 },
    bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: '000000', space: 24 },
    left: { style: docx.BorderStyle.SINGLE, size: 6, color: '000000', space: 24 },
    right: { style: docx.BorderStyle.SINGLE, size: 6, color: '000000', space: 24 },
  });
  console.log('PageBorders created:', !!pb);

  const doc = new docx.Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, bottom: 1080, left: 1080, right: 1080 } },
        pageBorders: pb,
      },
      children: [new docx.Paragraph({ children: [new docx.TextRun('Test with page borders')] })],
    }],
  });
  console.log('Document created successfully');
  const buffer = await docx.Packer.toBuffer(doc);
  fs.writeFileSync('_test_page_border.docx', buffer);
  console.log('File saved: _test_page_border.docx (OK)');
}
test().catch(e => console.error('Error:', e.message));
