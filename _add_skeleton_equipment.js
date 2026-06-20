const fs = require('fs');
let content = fs.readFileSync('public/equipment.html', 'utf8');

if (content.includes('renderEquipmentSkeleton')) {
  console.log('ALREADY_EXISTS');
  process.exit(0);
}

// Add skeleton function before loadEquipment
const skeletonFn = `function renderEquipmentSkeleton(count) {
  const tbody = document.getElementById('equipment-table-body');
  const rows = count || 5;
  let html = '';
  for (let i = 0; i < rows; i++) {
    html += '<tr class="skeleton-row">' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell wide"></div></td>' +
      '<td><div class="skeleton-cell"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell badge"></div></td>' +
      '<td style="text-align:center;"><div class="skeleton-cell circle"></div></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

`;

content = content.replace(
  'async function loadEquipment()',
  skeletonFn + 'async function loadEquipment'
);

// Replace the spinner loading line
const loadingState = `        tbody.innerHTML = \`<tr><td colspan="12" class="eq-empty"><span class="empty-icon"><i class="fas fa-spinner fa-spin"></i></span><p>Loading equipment data...</p><small>Connecting to database</small></td></tr>\`;`;

const skeletonLoading = `        renderEquipmentSkeleton(5);`;

content = content.replace(loadingState, skeletonLoading);

fs.writeFileSync('public/equipment.html', content, 'utf8');
console.log('DONE');
