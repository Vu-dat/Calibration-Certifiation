const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');

// Fix 1: Remove redundant manufacturer chip badge (keep only the factory line)
const oldBadge = `(manu ? '<span style="font-size:10px;color:var(--text-muted);background:#f1f5f9;padding:1px 5px;border-radius:3px;">' + manu + '</span>' : '') +`;
// Replace with nothing (remove the line entirely)
const newBadge = `// manufacturer shown in factory line below`;
let count = 0;

if (c.includes(oldBadge)) {
  c = c.replace(oldBadge, newBadge);
  count++;
  console.log('FIX 1: Removed redundant manufacturer chip');
}

// Fix 2: Change 'N/A' fallback to em-dash
const oldFallback = `(manu || 'N/A')`;
const newFallback = `(manu || '\u2014')`;
if (c.includes(oldFallback)) {
  c = c.replace(oldFallback, newFallback);
  count++;
  console.log('FIX 2: Changed N/A fallback to em-dash (\u2014)');
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log(`Applied ${count} fixes`);
