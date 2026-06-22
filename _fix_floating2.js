const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');
const r = '\r\n';
let count = 0;

// ===== 1. Update handleRefEqSearch to use getRefEqDropdown() =====
// Find: "if (!wrapper) return;\n    const box = wrapper.querySelector"
// Replace with: "if (!wrapper) return;\n    const box = getRefEqDropdown();"

const needle1 = 'if (!wrapper) return;' + r + '    const box = wrapper.querySelector';
const replacement1 = 'if (!wrapper) return;' + r + '    // Use body-level floating dropdown to escape overflow containers' + r + '    const box = getRefEqDropdown();' + r + '    // Store reference for onclick handlers' + r + '    box._activeInput = input;' + r + '    // The inner box placeholder is unused - we use the shared floating dropdown';

if (c.includes(needle1)) {
  c = c.replace(needle1, replacement1);
  count++;
}

// ===== 2. Update positionRefEqSuggestions =====
// Find the old function and replace it entirely
const oldPosStart = 'function positionRefEqSuggestions(input, box) {' + r +
'    const rect = input.getBoundingClientRect();' + r +
'    const viewportPadding = 16;' + r +
'    const preferredWidth = 520;';

const newPos = 'function positionRefEqSuggestions(input, box) {' + r +
'    const rect = input.getBoundingClientRect();' + r +
'    const viewportPadding = 12;' + r +
'    const minWidth = Math.max(rect.width, 280);' + r +
'    const maxWidth = window.innerWidth - viewportPadding * 2;' + r +
'    const width = Math.min(minWidth, maxWidth);' + r +
'    let left = rect.left;' + r +
'' + r +
'    if (left + width > window.innerWidth - viewportPadding) {' + r +
'        left = window.innerWidth - viewportPadding - width;' + r +
'    }' + r +
'    if (left < viewportPadding) left = viewportPadding;' + r +
'' + r +
'    // Auto-position: show below if room, otherwise show above (like Google)' + r +
'    const spaceBelow = window.innerHeight - rect.bottom;' + r +
'    const spaceAbove = rect.top;' + r +
'    const estHeight = 240; // estimated dropdown height' + r +
'' + r +
'    box.style.position = "fixed";' + r +
'    box.style.width = width + "px";' + r +
'    box.style.left = left + "px";' + r +
'    box.style.right = "auto";' + r +
'    box.style.maxHeight = "320px";' + r +
'' + r +
'    if (spaceBelow >= estHeight + 8 || spaceBelow > spaceAbove) {' + r +
'        box.style.top = (rect.bottom + 4) + "px";' + r +
'        box.style.bottom = "auto";' + r +
'    } else {' + r +
'        box.style.top = "auto";' + r +
'        box.style.bottom = (window.innerHeight - rect.top + 4) + "px";' + r +
'    }' + r +
'}';

// Find the old function by its unique start
if (c.includes(oldPosStart)) {
  // Find the full old function end
  const funcEnd = '    box.style.right = \'auto\';' + r + '    box.style.width = \\`\\${width}px\\`;' + r + '}';
  if (c.includes(funcEnd)) {
    const oldPosFull = oldPosStart.substring(0, oldPosStart.indexOf('const viewportPadding'));
    // Actually let's just replace from function start to its closing brace
    const startIdx = c.indexOf('function positionRefEqSuggestions');
    if (startIdx !== -1) {
      // Find the matching closing brace for the function
      // Count braces from the start of the function
      let braceCount = 0;
      let endIdx = startIdx;
      let foundStart = false;
      for (let i = startIdx; i < c.length; i++) {
        if (c[i] === '{') { braceCount++; foundStart = true; }
        else if (c[i] === '}') { braceCount--; }
        if (foundStart && braceCount === 0) { endIdx = i; break; }
      }
      if (endIdx > startIdx) {
        const oldFunc = c.substring(startIdx, endIdx + 1);
        c = c.replace(oldFunc, newPos);
        count++;
      }
    }
  }
}

// ===== 3. Update click handler to keep floating dropdown open =====
const oldClick = '  if (!e.target.closest(\'.autocomplete-wrapper\')) {' + r +
'    document.querySelectorAll(\'.autocomplete-suggestions\').forEach(b=>b.style.display=\'none\');';

const newClick = '  // Hide suggestions but keep floating dropdown open if clicking inside it' + r +
'  if (!e.target.closest(\'.autocomplete-wrapper\') && !e.target.closest(\'#ref-eq-floating-dropdown\')) {' + r +
'    document.querySelectorAll(\'.autocomplete-suggestions\').forEach(b=>b.style.display=\'none\');';

if (c.includes(oldClick)) {
  c = c.replace(oldClick, newClick);
  count++;
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('Changes applied: ' + count);
