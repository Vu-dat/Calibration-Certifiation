const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');
let cr = String.fromCharCode(13,10);
let changed = false;

// === 1. ADD OVERLAY CSS ===
// Find the page transition section and add overlay styles after .page-in
const overlayCss = `    .page-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: #f1f5f9;
        z-index: 999;
        pointer-events: none;
        opacity: 0;
        will-change: opacity;
        transition: opacity 0.25s ease;
    }
    .page-overlay.show {
        opacity: 1;
    }

`;

const pageInCss = '        animation: pageSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;' + cr + '    }';

if (c.includes(pageInCss)) {
  c = c.replace(pageInCss, pageInCss + cr + cr + overlayCss);
  changed = true;
  console.log('CSS ADDED');
} else {
  console.log('CSS NOT FOUND');
}

// === 2. ADD OVERLAY HTML ELEMENT ===
// Add before the toast container
const overlayHtml = '<div id="page-transition-overlay" class="page-overlay"></div>' + cr;

const toastContainer = '<div id="toast-container"></div>';
if (c.includes(toastContainer)) {
  c = c.replace(toastContainer, overlayHtml + toastContainer);
  changed = true;
  console.log('HTML ADDED');
} else {
  console.log('HTML NOT FOUND');
}

// === 3. UPDATE transitionPage FUNCTION ===
const oldTransitionFn = 'function transitionPage(fromView, toView) {' + cr +
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

const newTransitionFn = 'function transitionPage(fromView, toView) {' + cr +
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

if (c.includes(oldTransitionFn)) {
  c = c.replace(oldTransitionFn, newTransitionFn);
  changed = true;
  console.log('TRANSITION UPDATED');
} else {
  console.log('TRANSITION NOT FOUND - trying alternate...');
  // Try without the comment line
  const altOld = 'function transitionPage(fromView, toView) {' + cr +
    '  return new Promise((resolve) => {' + cr +
    '    fromView.classList.add(\'page-out\');' + cr +
    '    ' + cr +
    '    setTimeout(() => {' + cr +
    '      fromView.style.display = \'none\';' + cr +
    '      fromView.classList.remove(\'page-out\');' + cr +
    '      ' + cr +
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
    
  if (c.includes(altOld)) {
    c = c.replace(altOld, newTransitionFn);
    changed = true;
    console.log('TRANSITION UPDATED (alt)');
  } else {
    console.log('STILL NOT FOUND');
  }
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('ALL_DONE changed=' + changed);
