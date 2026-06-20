const fs = require('fs');
let c = fs.readFileSync('public/customer.html', 'utf8');
let changed = false;

// ============================================================================
// 1. ADD CSS: page transition animations + overlay
// ============================================================================
// Find the last @media rule in the style section and insert before it
const targetMedia = '        @media (max-width: 600px) {';

const transitionCss = '\n' +
'        /* \u2500\u2500\u2500 PAGE TRANSITION ANIMATIONS \u2500\u2500\u2500 */\n' +
'        @keyframes pageSlideOut {\n' +
'            0%   { opacity: 1; transform: translateY(0) scale(1); }\n' +
'            100% { opacity: 0; transform: translateY(-20px) scale(0.96); }\n' +
'        }\n' +
'        @keyframes pageSlideIn {\n' +
'            0%   { opacity: 0; transform: translateY(24px) scale(0.96); }\n' +
'            100% { opacity: 1; transform: translateY(0) scale(1); }\n' +
'        }\n' +
'        .page-out {\n' +
'            animation: pageSlideOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n' +
'            pointer-events: none;\n' +
'        }\n' +
'        .page-in {\n' +
'            animation: pageSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;\n' +
'        }\n' +
'\n' +
'        /* \u2500\u2500\u2500 Crossfade overlay \u2500\u2500\u2500 */\n' +
'        .page-overlay {\n' +
'            position: fixed;\n' +
'            top: 0; left: 0;\n' +
'            width: 100%; height: 100%;\n' +
'            background: var(--bg);\n' +
'            z-index: 999;\n' +
'            pointer-events: none;\n' +
'            opacity: 0;\n' +
'            will-change: opacity;\n' +
'            transition: opacity 0.25s ease;\n' +
'        }\n' +
'        .page-overlay.show {\n' +
'            opacity: 1;\n' +
'        }\n' +
'\n' +
'        ' + targetMedia;

if (c.includes(targetMedia)) {
  c = c.replace(targetMedia, transitionCss);
  changed = true;
  console.log('CSS: OK');
} else {
  console.log('CSS: NOT FOUND');
}

// ============================================================================
// 2. ADD HTML: overlay element
// ============================================================================
const overlayHtml = '<div id="page-transition-overlay" class="page-overlay"></div>\n\n';
const toastAnchor = '<!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n<!--   TOAST CONTAINER                           -->\n<!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->';

if (c.includes(toastAnchor)) {
  c = c.replace(toastAnchor, overlayHtml + toastAnchor);
  changed = true;
  console.log('HTML: OK');
} else {
  console.log('HTML: NOT FOUND');
}

// ============================================================================
// 3. ADD JS: transitionPage helper function
// ============================================================================
// Insert after DOMContentLoaded event listener that handles scroll reveal
const transitionFn = '\n' +
'/* \u2500\u2500\u2500 PAGE TRANSITION HELPER \u2500\u2500\u2500 */\n' +
'function transitionPage(fromView, toView) {\n' +
'  return new Promise((resolve) => {\n' +
'    const overlay = document.getElementById(\'page-transition-overlay\');\n' +
'    if (overlay) overlay.classList.add(\'show\');\n' +
'    fromView.classList.add(\'page-out\');\n' +
'    setTimeout(() => {\n' +
'      fromView.style.display = \'none\';\n' +
'      fromView.classList.remove(\'page-out\');\n' +
'      toView.style.display = \'block\';\n' +
'      toView.classList.add(\'page-in\');\n' +
'      setTimeout(() => {\n' +
'        if (overlay) overlay.classList.remove(\'show\');\n' +
'      }, 80);\n' +
'      setTimeout(() => {\n' +
'        toView.classList.remove(\'page-in\');\n' +
'        resolve();\n' +
'      }, 450);\n' +
'    }, 350);\n' +
'  });\n' +
'}\n\n';

// Find a good insertion point: before showList function
const showListAnchor = 'function showList()';
if (c.includes(showListAnchor)) {
  c = c.replace(showListAnchor, transitionFn + showListAnchor);
  changed = true;
  console.log('transitionPage: OK');
} else {
  console.log('transitionPage: NOT FOUND');
}

// ============================================================================
// 4. UPDATE: showList() to use transition
// ============================================================================
const oldShowList = 'function showList() {\n' +
'    document.getElementById(\'customer-item-detail\').style.display = \'none\';\n' +
'    document.getElementById(\'customer-list-view\').style.display   = \'block\';\n' +
'    currentViewingId = null;\n' +
'    setEditState(false);\n' +
'    loadCustomers();\n' +
'}';

const newShowList = 'function showList() {\n' +
'    const detailView = document.getElementById(\'customer-item-detail\');\n' +
'    const listView = document.getElementById(\'customer-list-view\');\n' +
'    currentViewingId = null;\n' +
'    setEditState(false);\n' +
'    transitionPage(detailView, listView).then(() => {\n' +
'        loadCustomers();\n' +
'    });\n' +
'}';

if (c.includes(oldShowList)) {
  c = c.replace(oldShowList, newShowList);
  changed = true;
  console.log('showList: UPDATED');
} else {
  console.log('showList: NOT FOUND - trying alternate');
  // Try without exact whitespace match
}

// ============================================================================
// 5. UPDATE: viewCustomerDetail() display section
// ============================================================================
// Find the view toggle section
const oldViewToggle = '    setEditState(false);\n\n' +
'    document.getElementById(\'customer-list-view\').style.display   = \'none\';\n' +
'    document.getElementById(\'customer-item-detail\').style.display = \'block\';\n\n' +
'    window.scrollTo({ top: 0, behavior: \'smooth\' });';

const newViewToggle = '    setEditState(false);\n\n' +
'    const custListView = document.getElementById(\'customer-list-view\');\n' +
'    const custDetailView = document.getElementById(\'customer-item-detail\');\n' +
'    transitionPage(custListView, custDetailView);\n\n' +
'    window.scrollTo({ top: 0, behavior: \'smooth\' });';

if (c.includes(oldViewToggle)) {
  c = c.replace(oldViewToggle, newViewToggle);
  changed = true;
  console.log('viewCustomerDetail: UPDATED');
} else {
  console.log('viewCustomerDetail: NOT FOUND');
}

fs.writeFileSync('public/customer.html', c, 'utf8');
console.log('ALL DONE changed=' + changed);
