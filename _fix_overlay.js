const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');
let cr = String.fromCharCode(13,10);

// === 1. ADD OVERLAY CSS after .page-in ===
// Find the closing brace of .page-in class
const searchAfterPageIn = '    .page-in {' + cr +
'        animation: pageSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;' + cr +
'    }';

const overlayCssBlock = '    .page-in {' + cr +
'        animation: pageSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;' + cr +
'    }' + cr +
'' + cr +
'    /* ─── Crossfade overlay ─── */' + cr +
'    .page-overlay {' + cr +
'        position: fixed;' + cr +
'        top: 0; left: 0;' + cr +
'        width: 100%; height: 100%;' + cr +
'        background: #f1f5f9;' + cr +
'        z-index: 999;' + cr +
'        pointer-events: none;' + cr +
'        opacity: 0;' + cr +
'        will-change: opacity;' + cr +
'        transition: opacity 0.25s ease;' + cr +
'    }' + cr +
'    .page-overlay.show {' + cr +
'        opacity: 1;' + cr +
'    }';

if (c.includes(searchAfterPageIn)) {
  c = c.replace(searchAfterPageIn, overlayCssBlock);
  console.log('CSS ADDED');
} else {
  console.log('CSS SEARCH NOT FOUND');
}

// === 2. UPDATE transitionPage FUNCTION ===
const oldFn = 'function transitionPage(fromView, toView) {' + cr +
'  return new Promise((resolve) => {' + cr +
'    // Animate out the current view' + cr +
'    fromView.classList.add(\'page-out\');' + cr +
'    ' + cr +
'    setTimeout(() => {' + cr +
'      fromView.style.display = \'none\';' + cr +
'      fromView.classList.remove(\'page-out\');' + cr +
'      ' + cr +
'      // Animate in the new view' + cr +
'      toView.style.display = \'block\';' + cr +
'      toView.classList.add(\'page-in\');' + cr +
'      ' + cr +
'      setTimeout(() => {' + cr +
'        toView.classList.remove(\'page-in\');' + cr +
'        resolve();' + cr +
'      }, 450);' + cr +
'    }, 350);' + cr +
'  });' + cr +
'}';

const newFn = 'function transitionPage(fromView, toView) {' + cr +
'  return new Promise((resolve) => {' + cr +
'    const overlay = document.getElementById(\'page-transition-overlay\');' + cr +
'    ' + cr +
'    // Show crossfade overlay' + cr +
'    if (overlay) overlay.classList.add(\'show\');' + cr +
'    ' + cr +
'    // Animate out the current view' + cr +
'    fromView.classList.add(\'page-out\');' + cr +
'    ' + cr +
'    setTimeout(() => {' + cr +
'      fromView.style.display = \'none\';' + cr +
'      fromView.classList.remove(\'page-out\');' + cr +
'      ' + cr +
'      // Animate in the new view' + cr +
'      toView.style.display = \'block\';' + cr +
'      toView.classList.add(\'page-in\');' + cr +
'      ' + cr +
'      // Hide overlay with slight delay for smooth crossfade' + cr +
'      setTimeout(() => {' + cr +
'        if (overlay) overlay.classList.remove(\'show\');' + cr +
'      }, 80);' + cr +
'      ' + cr +
'      setTimeout(() => {' + cr +
'        toView.classList.remove(\'page-in\');' + cr +
'        resolve();' + cr +
'      }, 450);' + cr +
'    }, 350);' + cr +
'  });' + cr +
'}';

if (c.includes(oldFn)) {
  c = c.replace(oldFn, newFn);
  console.log('TRANSITION UPDATED');
} else {
  console.log('TRANSITION NOT FOUND');
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('DONE');
