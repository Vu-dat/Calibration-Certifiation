const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');
const r = '\r\n';
let count = 0;

// ===== FIX 1: Remove syntax error on the comment line =====
const badLine = "    // The inner box placeholder is unused - we use the shared floating dropdown('.autocomplete-suggestions');";
const goodLine = "    // The inner box placeholder (in renderRefEqCell) is unused - we use the shared floating dropdown";

if (c.includes(badLine)) {
  c = c.replace(badLine, goodLine);
  count++;
  console.log('✅ Fixed syntax error in comment');
}

// ===== FIX 2: Replace positionRefEqSuggestions with smart positioning =====
const oldPos = [
  'function positionRefEqSuggestions(input, box) {',
  '    const rect = input.getBoundingClientRect();',
  '    const viewportPadding = 16;',
  '    const preferredWidth = 520;',
  '    const maxWidth = window.innerWidth - viewportPadding * 2;',
  '    const width = Math.min(Math.max(rect.width, preferredWidth), maxWidth);',
  '    let left = rect.left;',
  '',
  '    if (left + width > window.innerWidth - viewportPadding) {',
  '        left = window.innerWidth - viewportPadding - width;',
  '    }',
  '    if (left < viewportPadding) left = viewportPadding;',
  '',
  '    box.style.position = \'fixed\';',
  '    box.style.top = `${rect.bottom + 4}px`;',
  '    box.style.left = `${left}px`;',
  '    box.style.right = \'auto\';',
  '    box.style.width = `${width}px`;',
  '}'
].join(r);

const newPos = [
  'function positionRefEqSuggestions(input, box) {',
  '    const rect = input.getBoundingClientRect();',
  '    const viewportPadding = 12;',
  '    // Dynamic width: min 280px, max viewport minus padding',
  '    const minWidth = Math.max(rect.width, 280);',
  '    const maxWidth = window.innerWidth - viewportPadding * 2;',
  '    const width = Math.min(minWidth, maxWidth);',
  '    let left = rect.left;',
  '',
  '    if (left + width > window.innerWidth - viewportPadding) {',
  '        left = window.innerWidth - viewportPadding - width;',
  '    }',
  '    if (left < viewportPadding) left = viewportPadding;',
  '',
  '    // Auto-position: show below if room, otherwise show above (Google-style)',
  '    const spaceBelow = window.innerHeight - rect.bottom;',
  '    const spaceAbove = rect.top;',
  '    const estHeight = 240;',
  '',
  '    box.style.position = "fixed";',
  '    box.style.width = width + "px";',
  '    box.style.left = left + "px";',
  '    box.style.right = "auto";',
  '    box.style.maxHeight = "320px";',
  '',
  '    if (spaceBelow >= estHeight + 8 || spaceBelow > spaceAbove) {',
  '        box.style.top = (rect.bottom + 4) + "px";',
  '        box.style.bottom = "auto";',
  '    } else {',
  '        box.style.top = "auto";',
  '        box.style.bottom = (window.innerHeight - rect.top + 4) + "px";',
  '    }',
  '}'
].join(r);

if (c.includes(oldPos)) {
  c = c.replace(oldPos, newPos);
  count++;
  console.log('✅ Updated positionRefEqSuggestions with smart positioning');
} else {
  console.log('⚠ positionRefEqSuggestions old version not found with CRLF');
  // Try LF
  const oldPos2 = oldPos.split(r).join('\n');
  const newPos2 = newPos.split(r).join('\n');
  if (c.includes(oldPos2)) {
    c = c.replace(oldPos2, newPos2);
    count++;
    console.log('✅ Updated positionRefEqSuggestions (LF match)');
  } else {
    console.log('❌ positionRefEqSuggestions not found at all');
  }
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('Applied ' + count + ' fixes');
