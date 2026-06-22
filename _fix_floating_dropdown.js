const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');

// ===== 1. Update handleRefEqSearch to use floating dropdown =====
const oldCall = `    positionRefEqSuggestions(input, box);\r\n    box.style.display = 'block';\r\n}`;
const newCall = `    positionRefEqSuggestions(input, box);\r\n    box.style.display = 'block';\r\n}\r\n`;

// Find and replace the function to use floating dropdown
// Replace the old function's inner logic to use getRefEqDropdown()
const oldFuncStart = `function handleRefEqSearch(input) {\r\n    const wrapper = input.closest('.autocomplete-wrapper');\r\n    if (!wrapper) return;\r\n    const box = wrapper.querySelector('.autocomplete-suggestions');\r\n    if (!box) return;`;

const newFuncStart = `function handleRefEqSearch(input) {\r\n    const wrapper = input.closest('.autocomplete-wrapper');\r\n    if (!wrapper) return;\r\n    // Use body-level floating dropdown to escape overflow containers\r\n    const box = getRefEqDropdown();\r\n    // Store reference back to input for selection\r\n    box._activeInput = input;`;

if (c.includes(oldFuncStart)) {
    c = c.replace(oldFuncStart, newFuncStart);
    console.log('✅ Updated handleRefEqSearch to use floating dropdown');
} else {
    console.log('❌ oldFuncStart not found, trying without \\r...');
    const oldFuncStart2 = `function handleRefEqSearch(input) {\n    const wrapper = input.closest('.autocomplete-wrapper');\n    if (!wrapper) return;\n    const box = wrapper.querySelector('.autocomplete-suggestions');\n    if (!box) return;`;
    const newFuncStart2 = `function handleRefEqSearch(input) {\n    const wrapper = input.closest('.autocomplete-wrapper');\n    if (!wrapper) return;\n    // Use body-level floating dropdown to escape overflow containers\n    const box = getRefEqDropdown();\n    // Store reference back to input for selection\n    box._activeInput = input;`;
    if (c.includes(oldFuncStart2)) {
        c = c.replace(oldFuncStart2, newFuncStart2);
        console.log('✅ Updated handleRefEqSearch (LF match)');
    } else {
        console.log('❌ Could not find function start at all');
    }
}

// ===== 2. Update click-outside handler to also hide floating dropdown =====
const oldClickHandler = `document.addEventListener('click', function(e) {\r\n  if (!e.target.closest('.autocomplete-wrapper')) {\r\n    document.querySelectorAll('.autocomplete-suggestions').forEach(b=>b.style.display='none');\r\n  }\r\n});`;

const newClickHandler = `document.addEventListener('click', function(e) {\r\n  // Hide all suggestions including floating dropdown\r\n  if (!e.target.closest('.autocomplete-wrapper') && !e.target.closest('#ref-eq-floating-dropdown')) {\r\n    document.querySelectorAll('.autocomplete-suggestions').forEach(b=>b.style.display='none');\r\n  }\r\n});`;

if (c.includes(oldClickHandler)) {
    c = c.replace(oldClickHandler, newClickHandler);
    console.log('✅ Updated click handler to keep floating dropdown open');
} else {
    console.log('⚠ Old click handler not found with CRLF - trying LF...');
    const oldClickHandler2 = `document.addEventListener('click', function(e) {\n  if (!e.target.closest('.autocomplete-wrapper')) {\n    document.querySelectorAll('.autocomplete-suggestions').forEach(b=>b.style.display='none');\n  }\n});`;
    const newClickHandler2 = `document.addEventListener('click', function(e) {\n  // Hide all suggestions including floating dropdown\n  if (!e.target.closest('.autocomplete-wrapper') && !e.target.closest('#ref-eq-floating-dropdown')) {\n    document.querySelectorAll('.autocomplete-suggestions').forEach(b=>b.style.display='none');\n  }\n});`;
    if (c.includes(oldClickHandler2)) {
        c = c.replace(oldClickHandler2, newClickHandler2);
        console.log('✅ Updated click handler (LF match)');
    }
}

// ===== 3. Update positionRefEqSuggestions for better positioning =====
const oldPos = `function positionRefEqSuggestions(input, box) {\r\n    const rect = input.getBoundingClientRect();\r\n    const viewportPadding = 16;\r\n    const preferredWidth = 520;\r\n    const maxWidth = window.innerWidth - viewportPadding * 2;\r\n    const width = Math.min(Math.max(rect.width, preferredWidth), maxWidth);\r\n    let left = rect.left;\r\n\r\n    if (left + width > window.innerWidth - viewportPadding) {\r\n        left = window.innerWidth - viewportPadding - width;\r\n    }\r\n    if (left < viewportPadding) left = viewportPadding;\r\n\r\n    box.style.position = 'fixed';\r\n    box.style.top = \\`\\${rect.bottom + 4}px\\`;\r\n    box.style.left = \\`\\${left}px\\`;\r\n    box.style.right = 'auto';\r\n    box.style.width = \\`\\${width}px\\`;\r\n}`;

const newPos = `function positionRefEqSuggestions(input, box) {\r\n    const rect = input.getBoundingClientRect();\r\n    const viewportPadding = 12;\r\n    // Dynamic width: prefer wide enough for content but not too wide\r\n    const minWidth = Math.max(rect.width, 280);\r\n    const maxWidth = window.innerWidth - viewportPadding * 2;\r\n    const width = Math.min(minWidth, maxWidth);\r\n    let left = rect.left;\r\n\r\n    if (left + width > window.innerWidth - viewportPadding) {\r\n        left = window.innerWidth - viewportPadding - width;\r\n    }\r\n    if (left < viewportPadding) left = viewportPadding;\r\n\r\n    // Check if there's room below, otherwise show above\r\n    const spaceBelow = window.innerHeight - rect.bottom;\r\n    const spaceAbove = rect.top;\r\n    const dropdownHeight = Math.min(box.scrollHeight || 240, 320);\r\n\r\n    box.style.position = 'fixed';\r\n    box.style.width = \\`\\${width}px\\`;\r\n    box.style.left = \\`\\${left}px\\`;\r\n    box.style.right = 'auto';\r\n    \r\n    if (spaceBelow >= dropdownHeight + 8 || spaceBelow > spaceAbove) {\r\n        box.style.top = \\`\\${rect.bottom + 4}px\\`;\r\n        box.style.bottom = 'auto';\r\n        box.style.maxHeight = \\`\\${Math.min(spaceBelow - 8, 320)}px\\`;\r\n    } else {\r\n        box.style.top = 'auto';\r\n        box.style.bottom = \\`\\${window.innerHeight - rect.top + 4}px\\`;\r\n        box.style.maxHeight = \\`\\${Math.min(spaceAbove - 8, 320)}px\\`;\r\n    }\r\n}`;

if (c.includes(oldPos)) {
    c = c.replace(oldPos, newPos);
    console.log('✅ Updated positionRefEqSuggestions with dynamic positioning');
} else {
    console.log('⚠ Old position function not found with CRLF - trying LF...');
    const oldPos2 = `function positionRefEqSuggestions(input, box) {\n    const rect = input.getBoundingClientRect();\n    const viewportPadding = 16;\n    const preferredWidth = 520;\n    const maxWidth = window.innerWidth - viewportPadding * 2;\n    const width = Math.min(Math.max(rect.width, preferredWidth), maxWidth);\n    let left = rect.left;\n\n    if (left + width > window.innerWidth - viewportPadding) {\n        left = window.innerWidth - viewportPadding - width;\n    }\n    if (left < viewportPadding) left = viewportPadding;\n\n    box.style.position = 'fixed';\n    box.style.top = \`\${rect.bottom + 4}px\`;\n    box.style.left = \`\${left}px\`;\n    box.style.right = 'auto';\n    box.style.width = \`\${width}px\`;\n}`;
    const newPos2 = `function positionRefEqSuggestions(input, box) {\n    const rect = input.getBoundingClientRect();\n    const viewportPadding = 12;\n    const minWidth = Math.max(rect.width, 280);\n    const maxWidth = window.innerWidth - viewportPadding * 2;\n    const width = Math.min(minWidth, maxWidth);\n    let left = rect.left;\n\n    if (left + width > window.innerWidth - viewportPadding) {\n        left = window.innerWidth - viewportPadding - width;\n    }\n    if (left < viewportPadding) left = viewportPadding;\n\n    const spaceBelow = window.innerHeight - rect.bottom;\n    const spaceAbove = rect.top;\n    const dropdownHeight = Math.min(box.scrollHeight || 240, 320);\n\n    box.style.position = 'fixed';\n    box.style.width = \`\${width}px\`;\n    box.style.left = \`\${left}px\`;\n    box.style.right = 'auto';\n    \n    if (spaceBelow >= dropdownHeight + 8 || spaceBelow > spaceAbove) {\n        box.style.top = \`\${rect.bottom + 4}px\`;\n        box.style.bottom = 'auto';\n        box.style.maxHeight = \`\${Math.min(spaceBelow - 8, 320)}px\`;\n    } else {\n        box.style.top = 'auto';\n        box.style.bottom = \`\${window.innerHeight - rect.top + 4}px\`;\n        box.style.maxHeight = \`\${Math.min(spaceAbove - 8, 320)}px\`;\n    }\n}`;
    if (c.includes(oldPos2)) {
        c = c.replace(oldPos2, newPos2);
        console.log('✅ Updated positionRefEqSuggestions (LF match)');
    }
}

// ===== 4. Update floating dropdown items onclick to use _activeInput =====
// The suggestions' onclick handlers currently set `input.value` which might 
// not work since we're using _activeInput. But input still refers to the 
// original function parameter (which is the same as _activeInput).
// This is fine because input is still in scope.

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('All changes saved');
