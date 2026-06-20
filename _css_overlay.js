const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');

// Find .page-in { ... } pattern and insert overlay CSS after it
const pageInPattern = '.page-in {';

let idx = c.indexOf(pageInPattern);
if (idx === -1) {
  console.log('page-in NOT FOUND');
  process.exit(1);
}

// Find the closing brace after .page-in
let closeBrace = c.indexOf('}', idx + 10);
if (closeBrace === -1) {
  console.log('closing brace NOT FOUND');
  process.exit(1);
}

const overlayCss = '\n' +
'    /* \u2500\u2500\u2500 Crossfade overlay \u2500\u2500\u2500 */\n' +
'    .page-overlay {\n' +
'        position: fixed;\n' +
'        top: 0; left: 0;\n' +
'        width: 100%; height: 100%;\n' +
'        background: #f1f5f9;\n' +
'        z-index: 999;\n' +
'        pointer-events: none;\n' +
'        opacity: 0;\n' +
'        will-change: opacity;\n' +
'        transition: opacity 0.25s ease;\n' +
'    }\n' +
'    .page-overlay.show {\n' +
'        opacity: 1;\n' +
'    }\n';

// Insert after the closing brace
c = c.slice(0, closeBrace + 1) + overlayCss + c.slice(closeBrace + 1);

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('CSS ADDED');
