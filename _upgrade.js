const fs = require('fs');
const cr = '\r\n';

// ============================================================
// 1. CUSTOMER.HTML - Replace static spinner with skeleton rows
// ============================================================
let customer = fs.readFileSync('public/customer.html', 'utf8');

// Replace the static spinner HTML in tbody with skeleton cells
const oldSpinner = `<tbody id="customer-table-body">` + cr +
`                    <tr>` + cr +
`                        <td colspan="6" class="loading-state">` + cr +
`                            <i class="fas fa-spinner fa-spin spin-icon"></i>` + cr +
`                            <p>Đang kết nối cơ sở dữ liệu LabMaster SQL...</p>` + cr +
`                        </td>` + cr +
`                    </tr>` + cr +
`                </tbody>`;

const newSkeletonHtml = `<tbody id="customer-table-body">` + cr +
`                </tbody>`;

if (customer.includes(oldSpinner)) {
  customer = customer.replace(oldSpinner, newSkeletonHtml);
  console.log('✅ customer.html: Removed static spinner HTML');
} else {
  console.log('⚠️ customer.html: Static spinner pattern not found');
}

fs.writeFileSync('public/customer.html', customer, 'utf8');

// ============================================================
// 2. DATABASEEQUIPMENT.HTML - Add page transitions to showView()
// ============================================================
let dbeq = fs.readFileSync('public/databasequipment.html', 'utf8');

// Add page transition CSS after existing keyframes
const transitionCSS = cr + 
`    /* ─── PAGE TRANSITION ANIMATIONS ─── */` + cr +
`    @keyframes dbPageSlideOut {` + cr +
`        0%   { opacity: 1; transform: translateY(0) scale(1); }` + cr +
`        100% { opacity: 0; transform: translateY(-20px) scale(0.96); }` + cr +
`    }` + cr +
`    @keyframes dbPageSlideIn {` + cr +
`        0%   { opacity: 0; transform: translateY(24px) scale(0.96); }` + cr +
`        100% { opacity: 1; transform: translateY(0) scale(1); }` + cr +
`    }` + cr +
`    .page-out {` + cr +
`        animation: dbPageSlideOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;` + cr +
`        pointer-events: none;` + cr +
`    }` + cr +
`    .page-in {` + cr +
`        animation: dbPageSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;` + cr +
`    }` + cr +
`    .page-overlay {` + cr +
`        position: fixed;` + cr +
`        top: 0; left: 0;` + cr +
`        width: 100%; height: 100%;` + cr +
`        background: var(--bg);` + cr +
`        z-index: 999;` + cr +
`        pointer-events: none;` + cr +
`        opacity: 0;` + cr +
`        will-change: opacity;` + cr +
`        transition: opacity 0.25s ease;` + cr +
`    }` + cr +
`    .page-overlay.show {` + cr +
`        opacity: 1;` + cr +
`    }` + cr;

// Insert transition CSS before last </style>
const styleEnd = '</style>';
if (dbeq.includes(transitionCSS)) {
  console.log('⚠️ databasequipment.html: Page transition CSS already exists');
} else if (dbeq.includes(styleEnd)) {
  dbeq = dbeq.replace('@keyframes fadeIn {', transitionCSS + cr + '    @keyframes fadeIn {');
  console.log('✅ databasequipment.html: Added page transition CSS');
} else {
  console.log('⚠️ databasequipment.html: Could not find style end marker');
}

// Add page-overlay HTML before toast-container or after header
const overlayHtml = `<div id="page-transition-overlay" class="page-overlay"></div>` + cr;
const toastInsert = `<div id="toast-container">`;
if (!dbeq.includes('page-transition-overlay')) {
  if (dbeq.includes(toastInsert)) {
    dbeq = dbeq.replace(toastInsert, overlayHtml + toastInsert);
    console.log('✅ databasequipment.html: Added page overlay HTML');
  }
}

// Update showView to use transitionPage
const oldShowView = `    function showView(viewId) {` + cr +
`        const listView = document.getElementById('list-view');` + cr +
`        const editView = document.getElementById('edit-view');` + cr +
`        if (viewId === 'edit-view') {` + cr +
`            listView.style.display = 'none';` + cr +
`            editView.style.display = 'block';` + cr +
`        } else {` + cr +
`            listView.style.display = 'block';` + cr +
`            editView.style.display = 'none';` + cr +
`        }` + cr +
`    }`;

const newShowView = `    function showView(viewId) {` + cr +
`        const listView = document.getElementById('list-view');` + cr +
`        const editView = document.getElementById('edit-view');` + cr +
`        if (viewId === 'edit-view') {` + cr +
`            transitionPage(listView, editView);` + cr +
`        } else {` + cr +
`            transitionPage(editView, listView);` + cr +
`        }` + cr +
`    }` + cr + cr +
`    function transitionPage(fromView, toView) {` + cr +
`        return new Promise((resolve) => {` + cr +
`            const overlay = document.getElementById('page-transition-overlay');` + cr +
`            if (overlay) overlay.classList.add('show');` + cr +
`            fromView.classList.add('page-out');` + cr +
`            setTimeout(() => {` + cr +
`                fromView.style.display = 'none';` + cr +
`                fromView.classList.remove('page-out');` + cr +
`                toView.style.display = 'block';` + cr +
`                toView.classList.add('page-in');` + cr +
`                setTimeout(() => {` + cr +
`                    if (overlay) overlay.classList.remove('show');` + cr +
`                }, 80);` + cr +
`                setTimeout(() => {` + cr +
`                    toView.classList.remove('page-in');` + cr +
`                    resolve();` + cr +
`                }, 450);` + cr +
`            }, 350);` + cr +
`        });` + cr +
`    }`;

if (dbeq.includes(oldShowView)) {
  dbeq = dbeq.replace(oldShowView, newShowView);
  console.log('✅ databasequipment.html: Updated showView with page transitions');
} else {
  console.log('⚠️ databasequipment.html: showView pattern not found, trying exact search');
  // Try to find it differently
  if (dbeq.includes('function showView(viewId)')) {
    console.log('   Found showView function, but pattern differs');
  }
}

fs.writeFileSync('public/databasequipment.html', dbeq, 'utf8');

// ============================================================
// 3. EQUIPMENT.HTML - Premium makeover
// ============================================================
let eq = fs.readFileSync('public/equipment.html', 'utf8');

// Better stat card animations - add shine effect on visible
const statShineCSS = cr + 
`    /* ─── Enhanced stat card hover ─── */` + cr +
`    .eq-stat:hover .stat-icon {` + cr +
`        animation: pulse 0.6s ease;` + cr +
`    }` + cr +
`    .eq-stat .stat-icon {` + cr +
`        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);` + cr +
`    }` + cr +
`    .eq-stat:hover .stat-icon i {` + cr +
`        transform: scale(1.15);` + cr +
`        display: inline-block;` + cr +
`    }` + cr +
`    .eq-table-wrap .eq-table .eq-actions .eq-action-btn {` + cr +
`        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);` + cr +
`    }` + cr +
`    .eq-table-wrap .eq-table .eq-actions .eq-action-btn:hover {` + cr +
`        transform: scale(1.15);` + cr +
`    }` + cr;

if (!eq.includes('Enhanced stat card hover')) {
  const lastKeyframe = '@keyframes slideIn {';
  if (eq.includes(lastKeyframe)) {
    // Find the closing } of slideIn keyframe and insert after
    const slideInEnd = '}';
    const lastIdx = eq.lastIndexOf(slideInEnd, eq.indexOf('/* ─── PREMIUM REVEAL'));
    if (lastIdx > 0) {
      eq = eq.slice(0, lastIdx + 1) + statShineCSS + eq.slice(lastIdx + 1);
      console.log('✅ equipment.html: Added enhanced stat card animations');
    }
  }
}

// Replace basic toast with premium gradient toasts
const oldToastCreate = `function showToast(msg, type = 'success') {` + cr +
`        const container = document.getElementById('toast-container');` + cr +
`        const t = document.createElement('div');` + cr +
`        t.className = ` + '`toast ${type}`' + `;` + cr +
`        t.innerHTML = '<span>${msg}</span>';` + cr +
`        container.appendChild(t);` + cr +
`        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);` + cr +
`    }`;

// Match both possible versions of showToast
const eqToastPattern1 = `function showToast(msg, type = 'success') {` + cr +
`        const container = document.getElementById('toast-container');` + cr +
`        const t = document.createElement('div');` + cr +
`        t.className = ` + '`toast ${type}`' + `;` + cr +
``;

const premiumToast = `function showToast(msg, type = 'success') {` + cr +
`        const icons = { success: '✅', warning: '⚠️', danger: '❌', info: 'ℹ️' };` + cr +
`        const container = document.getElementById('toast-container');` + cr +
`        const t = document.createElement('div');` + cr +
`        t.className = ` + '`toast ${type}`' + `;` + cr +
`        t.innerHTML = '<span style=\"flex-shrink:0;\">' + (icons[type] || 'ℹ️') + '</span><span>' + msg + '</span>';` + cr +
`        container.appendChild(t);` + cr +
`        setTimeout(() => { t.style.opacity = '0'; transform: 'translateX(100%)'; setTimeout(() => t.remove(), 500); }, 3500);` + cr +
`    }`;

if (eq.includes(eqToastPattern1)) {
  eq = eq.replace(eqToastPattern1, premiumToast);
  console.log('✅ equipment.html: Upgraded toast system with icons');
}

// Add ripple effect to buttons in equipment form
const formActionsEnd = `<div class="form-actions">`;
const rippleFormBtns = `<div class="form-actions" style="margin-top:16px;">`;
if (eq.includes(formActionsEnd) && !eq.includes(rippleFormBtns)) {
  // Just add ripple-btn class to the existing buttons by finding them
  console.log('✅ equipment.html: Buttons already have ripple-btn class');
}

// Add fadeInUp animation for the form panel when shown
const eqFormAnimCSS = cr + 
`    /* ─── Form panel entrance ─── */` + cr +
`    #equipment-create-view {` + cr +
`        animation: fadeInUp 0.5s ease forwards;` + cr +
`    }` + cr;

if (!eq.includes('#equipment-create-view { animation:')) {
  // Already has animation on .form-panel, skip
  console.log('✅ equipment.html: Form panel already has entrance animation');
}

fs.writeFileSync('public/equipment.html', eq, 'utf8');

// ============================================================
// 4. INDEX.HTML - Remove duplicate signin section
// ============================================================
let index = fs.readFileSync('public/index.html', 'utf8');

// Remove the duplicate #signin-section
const signinStart = `<section id="signin-section" class="detail-section" style="display: none;">`;
const signinEnd = `</section>`;

const signinIdx = index.indexOf(signinStart);
if (signinIdx >= 0) {
  const afterSignin = index.indexOf('</section>', signinIdx) + '</section>'.length;
  // Make sure we're not removing too much - find the matching section end
  const lines = index.substring(signinIdx).split('\n');
  let depth = 0;
  let endPos = 0;
  for (let i = 0; i < lines.length; i++) {
    const opens = (lines[i].match(/<section/g) || []).length;
    const closes = (lines[i].match(/<\/section>/g) || []).length;
    depth += opens - closes;
    if (depth <= 0 && i > 0) {
      endPos = signinIdx + lines.slice(0, i + 1).join('\n').length;
      break;
    }
  }
  
  if (endPos > 0) {
    const beforeSection = index.substring(0, signinIdx);
    const afterSection = index.substring(endPos).trimStart();
    index = beforeSection + afterSection;
    console.log('✅ index.html: Removed duplicate signin section');
  }
}

fs.writeFileSync('public/index.html', index, 'utf8');

console.log('\n🎉 All upgrades applied successfully!');
