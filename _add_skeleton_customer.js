const fs = require('fs');
let content = fs.readFileSync('public/customer.html', 'utf8');

if (content.includes('renderCustomerSkeleton')) {
  console.log('ALREADY_EXISTS');
  process.exit(0);
}

// Add skeleton function before loadCustomers
const skeletonFn = `function renderCustomerSkeleton(count) {
  const tbody = document.getElementById('customer-table-body');
  const rows = count || 5;
  let html = '';
  for (let i = 0; i < rows; i++) {
    html += '<tr class="skeleton-row">' +
      '<td><div class="skeleton-cell narrow"></div></td>' +
      '<td><div class="skeleton-cell"></div></td>' +
      '<td><div class="skeleton-cell wide"></div></td>' +
      '<td><div class="skeleton-cell" style="max-width:140px"></div></td>' +
      '<td><div class="skeleton-cell badge"></div></td>' +
      '<td style="text-align:center;"><div class="skeleton-cell circle"></div></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
}

`;

content = content.replace(
  'async function loadCustomers()',
  skeletonFn + 'async function loadCustomers'
);

// Replace the spinner loading state in loadCustomers
const loadingState = `    tbody.innerHTML = \`
        <tr>
            <td colspan="6" class="loading-state">
                <i class="fas fa-spinner fa-spin spin-icon"></i>
                <p>Đang đồng bộ từ SQL Server…</p>
            </td>
        </tr>\`;`;

const skeletonLoading = `    renderCustomerSkeleton(5);`;

content = content.replace(loadingState, skeletonLoading);

fs.writeFileSync('public/customer.html', content, 'utf8');
console.log('DONE');
