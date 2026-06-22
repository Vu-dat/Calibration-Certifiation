const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');

// ===== 1. Add shared body-level floating dropdown =====
// Insert after the existing event delegation comment
const eventDelEnd = '});\r\n\r\n/* ─── Scroll Reveal ─── */';
const bodyDropdown = `});

/* ====== FLOATING DROPDOWN (escapes overflow containers) ====== */
let refEqDropdown = null;
function getRefEqDropdown() {
    if (!refEqDropdown) {
        refEqDropdown = document.createElement('div');
        refEqDropdown.id = 'ref-eq-floating-dropdown';
        refEqDropdown.className = 'autocomplete-suggestions';
        refEqDropdown.style.cssText = 'position:fixed;z-index:9999;display:none;';
        document.body.appendChild(refEqDropdown);
    }
    return refEqDropdown;
}

/* ─── Scroll Reveal ─── */`;

if (c.includes(eventDelEnd)) {
    c = c.replace(eventDelEnd, bodyDropdown);
    console.log('✅ Added floating dropdown at body level');
} else {
    console.log('❌ eventDelEnd marker not found. Checking alternatives...');
    // Try without CR
    const eventDelEnd2 = '});\n\n/* ─── Scroll Reveal ─── */';
    const bodyDropdown2 = `});\n\n/* ====== FLOATING DROPDOWN (escapes overflow containers) ====== */\nlet refEqDropdown = null;\nfunction getRefEqDropdown() {\n    if (!refEqDropdown) {\n        refEqDropdown = document.createElement('div');\n        refEqDropdown.id = 'ref-eq-floating-dropdown';\n        refEqDropdown.className = 'autocomplete-suggestions';\n        refEqDropdown.style.cssText = 'position:fixed;z-index:9999;display:none;';\n        document.body.appendChild(refEqDropdown);\n    }\n    return refEqDropdown;\n}\n\n/* ─── Scroll Reveal ─── */`;
    if (c.includes(eventDelEnd2)) {
        c = c.replace(eventDelEnd2, bodyDropdown2);
        console.log('✅ Added floating dropdown (LF match)');
    } else {
        console.log('❌ Could not find insertion point');
    }
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('File saved');
