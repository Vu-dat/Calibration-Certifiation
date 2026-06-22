const fs = require('fs');
const c = fs.readFileSync('public/project.html', 'utf8');
const r = '\r\n';

let count = 0;

// ===== 1. Remove orphaned suggestions div from renderRefEqCell =====
const oldRender = [
  '    return `<div class="autocomplete-wrapper" style="position:relative;display:inline-block;width:100%;">',
  '        <input type="text" class="lab-input-cell ref-eq-val" value="${escapedValue}" ',
  '               placeholder="🔍 Gõ tên thiết bị chuẩn..." autocomplete="off" style="width:100%;">',
  '        <div class="autocomplete-suggestions ref-eq-suggestions"></div>',
  '    </div>`;'
].join(r);

const newRender = [
  '    return `<div class="autocomplete-wrapper" style="position:relative;display:inline-block;width:100%;">',
  '        <input type="text" class="lab-input-cell ref-eq-val" value="${escapedValue}" ',
  '               placeholder="🔍 Gõ tên thiết bị chuẩn..." autocomplete="off" style="width:100%;">',
  '    </div>`;'
].join(r);

if (c.includes(oldRender)) {
  const result = c.replace(oldRender, newRender);
  if (result !== c) {
    fs.writeFileSync('public/project.html', result, 'utf8');
    count++;
    console.log('✅ Removed orphaned suggestions div from renderRefEqCell');
  } else {
    console.log('⚠ replace returned same string');
  }
} else {
  console.log('⚠ oldRender pattern not found');
}

// ===== 2. Remove box._activeInput = input =====
const c2 = fs.readFileSync('public/project.html', 'utf8');
const oldActive = '    // Store reference for onclick handlers' + r + '    box._activeInput = input;' + r + '    // The inner box placeholder (in renderRefEqCell) is unused - we use the shared floating dropdown';
const newActive = '    // Using body-level floating dropdown that escapes overflow containers';

if (c2.includes(oldActive)) {
  const result = c2.replace(oldActive, newActive);
  fs.writeFileSync('public/project.html', result, 'utf8');
  count++;
  console.log('✅ Removed box._activeInput and cleaned up comments');
} else {
  console.log('⚠ oldActive pattern not found');
}

console.log(`Total: ${count} changes applied`);
