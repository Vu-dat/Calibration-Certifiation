const fs = require('fs');
let content = fs.readFileSync('public/project.html', 'utf8');

// Check if already added
if (content.includes('renderProjectSkeleton')) {
  console.log('ALREADY_EXISTS');
  process.exit(0);
}

const skeletonFn = `function renderProjectSkeleton(count) {
  const tbody = document.getElementById('project-table-body');
  tbody.innerHTML = '';
  const rows = count || 5;
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    tr.className = 'skeleton-row';
    tr.innerHTML = [
      '<td><div class="skeleton-cell narrow"></div></td>',
      '<td><div class="skeleton-cell wide"></div></td>',
      '<td><div class="skeleton-cell"></div></td>',
      '<td><div class="skeleton-cell narrow"></div></td>',
      '<td><div class="skeleton-cell badge"></div></td>',
      '<td style="text-align:center;"><div class="skeleton-cell circle"></div></td>'
    ].join('\\n');
    tbody.appendChild(tr);
  }
}

`;

// Insert skeleton function before fetchProjects
content = content.replace(
  'async function fetchProjects() {',
  skeletonFn + 'async function fetchProjects() {'
);

// Add skeleton call at the beginning of fetchProjects
content = content.replace(
  '  const res = await fetch(`${API_URL}/projects`);',
  '  renderProjectSkeleton(5);\n  const res = await fetch(`${API_URL}/projects`);'
);

fs.writeFileSync('public/project.html', content, 'utf8');
console.log('DONE');
