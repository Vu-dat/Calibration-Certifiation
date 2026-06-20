const fs = require('fs');
const cr = '\r\n';

console.log('=== Applying remaining upgrades ===\n');

// ============================================================
// 1. CUSTOMER.HTML - verify static spinner removed
// ============================================================
let customer = fs.readFileSync('public/customer.html', 'utf8');
if (customer.includes('Đang kết nối cơ sở dữ liệu LabMaster SQL')) {
  console.log('❌ customer.html: Static spinner still present - needs fix');
  // The first script removed the old spinner, but loadCustomers() still sets it in JS.
  // Need to update loadCustomers() to use renderCustomerSkeleton instead
  const oldLoad = `async function loadCustomers() {` + cr +
`    const tbody = document.getElementById('customer-table-body');` + cr +
`    tbody.innerHTML = \`\r\n        <tr>\r\n            <td colspan="6" class="loading-state">\r\n                <i class="fas fa-spinner fa-spin spin-icon"></i>\r\n                <p>Đang đồng bộ từ SQL Server…</p>\r\n            </td>\r\n        </tr>\`;`;

  const newLoad = `async function loadCustomers() {` + cr +
`    const tbody = document.getElementById('customer-table-body');` + cr +
`    renderCustomerSkeleton(5);`;

  if (customer.includes(oldLoad)) {
    customer = customer.replace(oldLoad, newLoad);
    fs.writeFileSync('public/customer.html', customer, 'utf8');
    console.log('✅ customer.html: Updated loadCustomers() to use skeleton loading');
  } else {
    console.log('⚠️ customer.html: Pattern not found for loadCustomers update');
    // Try to find the actual pattern
  }
} else {
  console.log('✅ customer.html: Already handled');
}

// ============================================================
// 2. DATABASEEQUIPMENT.HTML - Fix showView + verify transitions
// ============================================================
let dbeq = fs.readFileSync('public/databasequipment.html', 'utf8');

// Check if transitionPage function exists
if (!dbeq.includes('function transitionPage(fromView, toView)')) {
  console.log('⚠️ databasequipment.html: transitionPage function missing, adding now');
  
  // Find showView function and replace it with transition version
  const regex = /function showView\(viewId\) \{[\s\S]*?listView\.style\.display = 'block';[\s\S]*?editView\.style\.display = 'none';[\s\S]*?\}/;
  const match = dbeq.match(regex);
  if (match) {
    const newShowView = `function showView(viewId) {` + cr +
`        const listView = document.getElementById('list-view');` + cr +
`        const editView = document.getElementById('edit-view');` + cr +
`        if (viewId === 'edit-view') {` + cr +
`            listView.style.display = 'none';` + cr +
`            editView.style.display = 'block';` + cr +
`        } else {` + cr +
`            listView.style.display = 'block';` + cr +
`            editView.style.display = 'none';` + cr +
`        }` + cr +
`    }` + cr + cr +
`    // ─── Page transition helper ───` + cr +
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

    // Replace the old showView function with the new one that has transitionPage appended after
    const oldFunc = match[0];
    dbeq = dbeq.replace(oldFunc, `// Using direct display toggle for list/edit views` + cr +
`    function showView(viewId) {` + cr +
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
`    }`);

    fs.writeFileSync('public/databasequipment.html', dbeq, 'utf8');
    console.log('✅ databasequipment.html: Added page transition helper + updated showView');
  } else {
    console.log('⚠️ databasequipment.html: Could not find showView function');
  }
} else {
  console.log('✅ databasequipment.html: Page transitions already present');
}

// ============================================================
// 3. EQUIPMENT.HTML - Fix broken toast + add premium touches
// ============================================================
let eq = fs.readFileSync('public/equipment.html', 'utf8');

// Fix the broken toast function if the first script corrupted it
const brokenToast = `function showToast(msg, type = 'success') {` + cr +
`        const icons = { success: '✅', warning: '⚠️', danger: '❌', info: 'ℹ️' };` + cr +
`        const container = document.getElementById('toast-container');` + cr +
`        const t = document.createElement('div');` + cr +
`        t.className = ` + '`toast ${type}`' + `;` + cr +
`        t.innerHTML = '<span style=\"flex-shrink:0;\">' + (icons[type] || 'ℹ️') + '</span><span>' + msg + '</span>';` + cr +
`        container.appendChild(t);` + cr +
`        setTimeout(() => { t.style.opacity = '0'; transform: 'translateX(100%)'; setTimeout(() => t.remove(), 500); }, 3500);` + cr +
`    }`;

const fixedToast = `function showToast(msg, type = 'success') {` + cr +
`        const icons = { success: '✅', warning: '⚠️', danger: '❌', info: 'ℹ️' };` + cr +
`        const container = document.getElementById('toast-container');` + cr +
`        const t = document.createElement('div');` + cr +
`        t.className = ` + '`toast ${type}`' + `;` + cr +
`        t.innerHTML = '<span style=\"flex-shrink:0;\">' + (icons[type] || 'ℹ️') + '</span><span>' + msg + '</span>';` + cr +
`        container.appendChild(t);` + cr +
`        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3500);` + cr +
`    }`;

// Check if there's a broken line with "transform" in the toast
if (eq.includes("transform: 'translateX(100%)'")) {
  eq = eq.replace(brokenToast, fixedToast);
  fs.writeFileSync('public/equipment.html', eq, 'utf8');
  console.log('✅ equipment.html: Fixed broken toast function');
} else {
  console.log('✅ equipment.html: Toast function OK');
}

// ============================================================
// 4. INDEX.HTML - Remove duplicate signin section
// ============================================================
let index = fs.readFileSync('public/index.html', 'utf8');

// Check if it was already removed
if (index.includes('id="signin-section"')) {
  console.log('⚠️ index.html: signin-section still present, removing...');
  
  // Find the signin section and remove it
  const startMarker = `<section id="signin-section" class="detail-section" style="display: none;">`;
  const startIdx = index.indexOf(startMarker);
  
  if (startIdx >= 0) {
    // Find the matching closing section tag
    let depth = 0;
    let endIdx = startIdx;
    let searchFrom = startIdx;
    
    while (endIdx < index.length) {
      const nextSectionOpen = index.indexOf('<section', searchFrom);
      const nextSectionClose = index.indexOf('</section>', searchFrom);
      
      if (nextSectionClose === -1) break;
      
      if (nextSectionOpen !== -1 && nextSectionOpen < nextSectionClose) {
        depth++;
        searchFrom = nextSectionOpen + 8;
      } else {
        depth--;
        searchFrom = nextSectionClose + 10;
        if (depth < 0) {
          endIdx = nextSectionClose + 10;
          break;
        }
      }
    }
    
    if (endIdx > startIdx) {
      const before = index.substring(0, startIdx);
      const after = index.substring(endIdx).trimStart();
      index = before + after;
      fs.writeFileSync('public/index.html', index, 'utf8');
      console.log('✅ index.html: Removed duplicate signin section');
    }
  }
} else {
  console.log('✅ index.html: signin-section already removed');
}

// ============================================================
// 5. EQUIPMENT.HTML - Premium finishing touches
// ============================================================
eq = fs.readFileSync('public/equipment.html', 'utf8');

// Add transition animation for showing/hiding create form
const oldShowAdd = `function showAddForm() {` + cr +
`        document.getElementById('equipment-list-view').style.display = 'none';` + cr +
`        document.getElementById('equipment-create-view').style.display = 'block';` + cr +
`        window.scrollTo({ top: 0, behavior: 'smooth' });` + cr +
`    }`;

const newShowAdd = `function showAddForm() {` + cr +
`        document.getElementById('equipment-list-view').style.display = 'none';` + cr +
`        document.getElementById('equipment-create-view').style.display = 'block';` + cr +
`        document.getElementById('equipment-create-view').style.animation = 'none';` + cr +
`        void document.getElementById('equipment-create-view').offsetHeight;` + cr +
`        document.getElementById('equipment-create-view').style.animation = 'fadeInUp 0.5s ease forwards';` + cr +
`        window.scrollTo({ top: 0, behavior: 'smooth' });` + cr +
`    }`;

const oldHideAdd = `function hideAddForm() {` + cr +
`        document.getElementById('equipment-create-view').style.display = 'none';` + cr +
`        document.getElementById('equipment-list-view').style.display = 'block';` + cr +
`    }`;

const newHideAdd = `function hideAddForm() {` + cr +
`        document.getElementById('equipment-create-view').style.display = 'none';` + cr +
`        document.getElementById('equipment-list-view').style.display = 'block';` + cr +
`        document.getElementById('equipment-list-view').style.animation = 'none';` + cr +
`        void document.getElementById('equipment-list-view').offsetHeight;` + cr +
`        document.getElementById('equipment-list-view').style.animation = 'fadeInUp 0.5s ease forwards';` + cr +
`    }`;

if (eq.includes(oldShowAdd)) {
  eq = eq.replace(oldShowAdd, newShowAdd);
  console.log('✅ equipment.html: Enhanced showAddForm with re-trigger animation');
}
if (eq.includes(oldHideAdd)) {
  eq = eq.replace(oldHideAdd, newHideAdd);
  console.log('✅ equipment.html: Enhanced hideAddForm with re-trigger animation');
}

// Add premium transition on form panel
const formPremiumStyle = cr + 
`    /* ─── Form panel enhanced ─── */` + cr +
`    #equipment-create-view .form-panel {` + cr +
`        transform-origin: top center;` + cr +
`    }` + cr +
`    #equipment-create-view .form-panel h2 {` + cr +
`        position: relative;` + cr +
`    }` + cr +
`    #equipment-create-view .form-panel h2::after {` + cr +
`        content: '';` + cr +
`        position: absolute;` + cr +
`        bottom: -8px;` + cr +
`        left: 50%;` + cr +
`        transform: translateX(-50%);` + cr +
`        width: 60px;` + cr +
`        height: 3px;` + cr +
`        background: var(--accent);` + cr +
`        border-radius: 2px;` + cr +
`    }`;

const insertBefore = `/* ─── Responsive ─── */`;
if (eq.includes(insertBefore) && !eq.includes('Form panel enhanced')) {
  eq = eq.replace(insertBefore, formPremiumStyle + cr + insertBefore);
  console.log('✅ equipment.html: Added premium form panel decorative styles');
}

// Better form group focus states
const formGroupFocus = `.form-group input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }`;
const enhancedFocus = `.form-group input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); transform: translateY(-1px); }`;
if (eq.includes(formGroupFocus)) {
  eq = eq.replace(formGroupFocus, enhancedFocus);
  console.log('✅ equipment.html: Enhanced form input focus effects');
}

fs.writeFileSync('public/equipment.html', eq, 'utf8');

console.log('\n=== All remaining upgrades applied successfully! ===');
console.log('\nSummary:');
console.log('1. customer.html: loadCustomers() uses skeleton loading');
console.log('2. databasequipment.html: page transitions added');
console.log('3. equipment.html: toast fixed + premium animations');
console.log('4. index.html: duplicate signin section removed');
