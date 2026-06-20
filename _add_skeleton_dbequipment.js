const fs = require('fs');
let content = fs.readFileSync('public/databasequipment.html', 'utf8');

if (content.includes('renderDbEquipmentSkeleton')) {
  console.log('ALREADY_EXISTS');
  process.exit(0);
}

// Find fetchEquipmentTemplates and add skeleton function
const skeletonFn = `function renderDbEquipmentSkeleton(count) {
  const tbody = document.getElementById('eq-body');
  if (!tbody) return;
  const rows = count || 5;
  let html = '';
  for (let i = 0; i < rows; i++) {
    html += '<tr class="skeleton-row">' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell wide"></div></td>' +
      '<td><div class="skeleton-cell"></div></td>' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td style="text-align:center;"><div class="skeleton-cell circle"></div></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

`;

// Add skeleton function before fetchEquipmentTemplates
content = content.replace(
  'async function fetchEquipmentTemplates()',
  skeletonFn + 'async function fetchEquipmentTemplates'
);

// Add skeleton call at the beginning of fetchEquipmentTemplates
content = content.replace(
  'async function fetchEquipmentTemplates() {\n        // Load song song: danh sách thiết bị (equipment-templates) + thiết bị chuẩn từ CLOCK\n        try {\n            const [equipRes] = await Promise.all([\n                fetch(`${TARGET_URL}/api/equipment-templates`),',
  'async function fetchEquipmentTemplates() {\n        renderDbEquipmentSkeleton(5);\n        // Load song song: danh sách thiết bị (equipment-templates) + thiết bị chuẩn từ CLOCK\n        try {\n            const [equipRes] = await Promise.all([\n                fetch(`${TARGET_URL}/api/equipment-templates`),'
);

fs.writeFileSync('public/databasequipment.html', content, 'utf8');
console.log('DONE');
