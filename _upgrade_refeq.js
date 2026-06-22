const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');

// The old function to replace (exact match with CRLF)
const oldHandle = [
  'function handleRefEqSearch(input) {',
  '    const wrapper = input.closest(\'.autocomplete-wrapper\');',
  '    if (!wrapper) return;',
  '    const box = wrapper.querySelector(\'.autocomplete-suggestions\');',
  '    if (!box) return;',
  '    ',
  '    const keyword = input.value.trim();',
  '    box.innerHTML = \'\';',
  '    if (!keyword) { box.style.display = \'none\'; return; }',
  '',
  '    const keyLower = keyword.toLowerCase();',
  '    const combinedDB = getCombinedStandardsDB();',
  '    ',
  '    const filtered = combinedDB',
  '        .map(eq => {',
  '            const code = (eq.EQUIPMENT_ID || \'\').toLowerCase();',
  '            const name = (eq.NAME || \'\').toLowerCase();',
  '            let score = 100;',
  '            if (code === keyLower || name === keyLower) score = 0;',
  '            else if (code.startsWith(keyLower) || name.startsWith(keyLower)) score = 10;',
  '            else if (code.includes(keyLower) || name.includes(keyLower)) score = 20;',
  '            return { item: eq, score };',
  '        })',
  '        .filter(x => x.score < 100)',
  '        .sort((a, b) => a.score - b.score)',
  '        .map(x => x.item);',
  '',
  '    if (filtered.length === 0) {',
  '        box.innerHTML = \'<div class=\"suggestion-item\" style=\"color:var(--text-muted);cursor:default;padding:8px;\">❌ Không tìm thấy</div>\';',
  '    } else {',
  '        filtered.slice(0, 8).forEach(eq => {',
  '            const label = `${eq.EQUIPMENT_ID ? eq.EQUIPMENT_ID + \' - \' : \'\'}${eq.NAME || \'\'}`;',
  '            const div = document.createElement(\'div\');',
  '            div.className = \'suggestion-item ref-eq-suggestion-item\';',
  '            div.innerHTML = `🏷 <strong>${label}</strong>${eq.MANUFACTURER ? `<br><span style=\"font-size:11px;color:var(--text-muted);\">${eq.MANUFACTURER}</span>` : \'\'}`;',
  '            div.onclick = () => {',
  '                input.value = label;',
  '                input.title = label;',
  '                box.style.display = \'none\';',
  '            };',
  '            box.appendChild(div);',
  '        });',
  '    }',
  '    positionRefEqSuggestions(input, box);',
  '    box.style.display = \'block\';',
  '}'
].join('\n');

const newHandle = [
  'function handleRefEqSearch(input) {',
  '    const wrapper = input.closest(\'.autocomplete-wrapper\');',
  '    if (!wrapper) return;',
  '    const box = wrapper.querySelector(\'.autocomplete-suggestions\');',
  '    if (!box) return;',
  '    ',
  '    const keyword = input.value.trim();',
  '    box.innerHTML = \'\';',
  '    if (!keyword) { box.style.display = \'none\'; return; }',
  '',
  '    // YouTube-style smart search: normalize Vietnamese + multi-field scoring',
  '    const keyNorm = normalizeVietnameseKeyword(keyword);',
  '    const keyL = keyword.toLowerCase();',
  '    const combinedDB = getCombinedStandardsDB();',
  '    ',
  '    const filtered = combinedDB',
  '        .map(eq => {',
  '            const codeNorm = normalizeVietnameseKeyword(eq.EQUIPMENT_ID || \'\');',
  '            const nameNorm = normalizeVietnameseKeyword(eq.NAME || \'\');',
  '            const manuNorm = normalizeVietnameseKeyword(eq.MANUFACTURER || \'\');',
  '            const code = (eq.EQUIPMENT_ID || \'\').toLowerCase();',
  '            const name = (eq.NAME || \'\').toLowerCase();',
  '            const manu = (eq.MANUFACTURER || \'\').toLowerCase();',
  '            ',
  '            let score = 100;',
  '            ',
  '            // Exact match (ưu tiên cao nhất)',
  '            if (codeNorm === keyNorm || nameNorm === keyNorm) score = 0;',
  '            else if (code === keyL || name === keyL) score = 0;',
  '            ',
  '            // Code prefix match (gõ ID rất nhanh)',
  '            else if (code.startsWith(keyL) || codeNorm.startsWith(keyNorm)) score = 5;',
  '            ',
  '            // Name starts with',
  '            else if (name.startsWith(keyL) || nameNorm.startsWith(keyNorm)) score = 10;',
  '            ',
  '            // Word boundary match (mỗi từ bắt đầu bằng từ khóa)',
  '            else if (name.split(/[\\s\\-\\/]+/).some(w => w.startsWith(keyL) || normalizeVietnameseKeyword(w).startsWith(keyNorm))) score = 12;',
  '            ',
  '            // Name includes',
  '            else if (name.includes(keyL) || nameNorm.includes(keyNorm)) score = 15;',
  '            ',
  '            // Code includes',
  '            else if (code.includes(keyL) || codeNorm.includes(keyNorm)) score = 18;',
  '            ',
  '            // Manufacturer match',
  '            else if (manu.includes(keyL) || manuNorm.includes(keyNorm)) score = 25;',
  '',
  '            return { item: eq, score };',
  '        })',
  '        .filter(x => x.score < 100)',
  '        .sort((a, b) => {',
  '            if (a.score !== b.score) return a.score - b.score;',
  '            return (a.item.NAME || \'\').localeCompare(b.item.NAME || \'\');',
  '        })',
  '        .map(x => x.item);',
  '',
  '    if (filtered.length === 0) {',
  '        box.innerHTML = \'<div class=\"suggestion-item\" style=\"color:var(--text-muted);cursor:default;padding:10px;text-align:center;\">❌ Không tìm thấy thiết bị chuẩn phù hợp</div>\';',
  '    } else {',
  '        const maxResults = Math.min(filtered.length, 10);',
  '        for (let i = 0; i < maxResults; i++) {',
  '            const eq = filtered[i];',
  '            const code = eq.EQUIPMENT_ID || \'\';',
  '            const name = eq.NAME || \'\';',
  '            const manu = eq.MANUFACTURER || \'\';',
  '            const due = eq.NEXT_DUE || \'\';',
  '            const label = code ? code + \' - \' + name : name;',
  '',
  '            // Check validity status badge',
  '            let statusBadge = \'\';',
  '            if (due) {',
  '                const dueDate = new Date(due);',
  '                const today = new Date();',
  '                const daysLeft = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));',
  '                if (daysLeft < 0) {',
  '                    statusBadge = \'<span style=\"font-size:10px;padding:1px 6px;border-radius:3px;background:#fef2f2;color:#dc2626;font-weight:600;\">❌ Hết hạn</span>\';',
  '                } else if (daysLeft <= 30) {',
  '                    statusBadge = \'<span style=\"font-size:10px;padding:1px 6px;border-radius:3px;background:#fffbeb;color:#d97706;font-weight:600;\">⚠ Sắp hết hạn</span>\';',
  '                } else {',
  '                    const dueStr = dueDate.toLocaleDateString(\'vi-VN\', {day:\'2-digit\',month:\'2-digit\',year:\'numeric\'});',
  '                    statusBadge = \'<span style=\"font-size:10px;padding:1px 6px;border-radius:3px;background:#f0fdf4;color:#16a34a;font-weight:600;\">✅ \' + dueStr + \'</span>\';',
  '                }',
  '            }',
  '',
  '            const div = document.createElement(\'div\');',
  '            div.className = \'suggestion-item ref-eq-suggestion-item\';',
  '            div.innerHTML = \'<div style=\"display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;\">\' +',
  '                \'<div style=\"display:flex;align-items:center;gap:6px;flex-wrap:wrap;\">\' +',
  '                \'<strong style=\"font-size:13px;color:#0f172a;\">\' + label + \'</strong>\' +',
  '                (manu ? \'<span style=\"font-size:10px;color:var(--text-muted);background:#f1f5f9;padding:1px 5px;border-radius:3px;\">\' + manu + \'</span>\' : \'\') +',
  '                statusBadge +',
  '                \'</div>\' +',
  '                (code ? \'<span style=\"font-size:11px;color:var(--text-muted);\">🏭 \' + (manu || \'N/A\') + \'</span>\' : \'\') +',
  '                \'</div>\';',
  '            div.onclick = () => {',
  '                input.value = label;',
  '                input.title = label;',
  '                box.style.display = \'none\';',
  '            };',
  '            box.appendChild(div);',
  '        }',
  '        ',
  '        // Show count indicator if there are more results',
  '        if (filtered.length > maxResults) {',
  '            const more = document.createElement(\'div\');',
  '            more.className = \'suggestion-item\';',
  '            more.style.cssText = \'text-align:center;color:var(--text-muted);font-size:11px;padding:6px;cursor:default;background:#f8fafc;border-top:1px solid var(--border);\';',
  '            more.textContent = \'… và \' + (filtered.length - maxResults) + \' kết quả khác\';',
  '            box.appendChild(more);',
  '        }',
  '    }',
  '    positionRefEqSuggestions(input, box);',
  '    box.style.display = \'block\';',
  '}'
].join('\n');

// Check if already upgraded
if (c.includes('YouTube-style smart search')) {
  console.log('ALREADY UPGRADED - skipping');
} else if (c.includes(oldHandle)) {
  c = c.replace(oldHandle, newHandle);
  fs.writeFileSync('public/project.html', c, 'utf8');
  console.log('✅ handleRefEqSearch upgraded with YouTube-style smart search');
} else {
  console.log('❌ Old handleRefEqSearch function NOT FOUND with exact match');
  console.log('Trying fuzzy match by line count...');
  // Check if function exists by finding the start
  const idx = c.indexOf('function handleRefEqSearch(input)');
  if (idx !== -1) {
    console.log('Function found at index:', idx);
    // Try with \r\n line endings
    const oldHandleCRLF = oldHandle.split('\n').join('\r\n');
    if (c.includes(oldHandleCRLF)) {
      c = c.replace(oldHandleCRLF, newHandle.split('\n').join('\r\n'));
      fs.writeFileSync('public/project.html', c, 'utf8');
      console.log('✅ handleRefEqSearch upgraded (CRLF match)');
    } else {
      console.log('❌ Function found but content differs - may need manual update');
    }
  } else {
    console.log('❌ Function NOT FOUND at all!');
  }
}
