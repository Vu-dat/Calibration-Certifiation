const fs = require('fs');
let lines = fs.readFileSync('public/project.html', 'utf8').split('\n');
let changed = false;

// 1. Add overlay CSS after line 329 (closing brace of .page-in)
// Lines 328-329 are: (.page-in class + closing })
// Insert after line 329
const overlayCss = [
  '',
  '    /* \u2500\u2500\u2500 Crossfade overlay \u2500\u2500\u2500 */',
  '    .page-overlay {',
  '        position: fixed;',
  '        top: 0; left: 0;',
  '        width: 100%; height: 100%;',
  '        background: #f1f5f9;',
  '        z-index: 999;',
  '        pointer-events: none;',
  '        opacity: 0;',
  '        will-change: opacity;',
  '        transition: opacity 0.25s ease;',
  '    }',
  '    .page-overlay.show {',
  '        opacity: 1;',
  '    }',
  ''
];

// Verify line 329 is the closing brace
if (lines[328] && lines[328].includes('}')) {
  lines.splice(329, 0, ...overlayCss);
  changed = true;
  console.log('CSS added after line 329');
} else {
  console.log('Line 329 is not as expected: ' + (lines[328] || 'undefined'));
}

// 2. Replace transitionPage function (lines 939-958)
// Re-index after CSS insertion shifted everything!
// Find the function by content
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function transitionPage(fromView, toView)')) {
    const startLine = i;
    // Find the closing brace of the function (at proper indentation)
    let endLine = i;
    for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
      if (lines[j].trim() === '}' && j > i) {
        endLine = j;
        break;
      }
    }
    
    if (endLine > startLine) {
      const newFn = [
        'function transitionPage(fromView, toView) {',
        '  return new Promise((resolve) => {',
        '    const overlay = document.getElementById(\'page-transition-overlay\');',
        '    ',
        '    // Show crossfade overlay',
        '    if (overlay) overlay.classList.add(\'show\');',
        '    ',
        '    // Animate out the current view',
        '    fromView.classList.add(\'page-out\');',
        '    ',
        '    setTimeout(() => {',
        '      fromView.style.display = \'none\';',
        '      fromView.classList.remove(\'page-out\');',
        '      ',
        '      // Animate in the new view',
        '      toView.style.display = \'block\';',
        '      toView.classList.add(\'page-in\');',
        '      ',
        '      // Hide overlay with slight delay for smooth crossfade',
        '      setTimeout(() => {',
        '        if (overlay) overlay.classList.remove(\'show\');',
        '      }, 80);',
        '      ',
        '      setTimeout(() => {',
        '        toView.classList.remove(\'page-in\');',
        '        resolve();',
        '      }, 450);',
        '    }, 350);',
        '  });',
        '}'
      ];
      
      lines.splice(startLine, endLine - startLine + 1, ...newFn);
      changed = true;
      console.log('transitionPage replaced at lines ' + (startLine + 1) + '-' + (endLine + 1));
      break;
    }
  }
}

fs.writeFileSync('public/project.html', lines.join('\n'), 'utf8');
console.log('DONE changed=' + changed);
