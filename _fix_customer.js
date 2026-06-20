const fs = require('fs');
let c = fs.readFileSync('public/customer.html', 'utf8');
let changed = false;

// 1. Add overlay HTML before the toast div
const overlayHtml = '<div id="page-transition-overlay" class="page-overlay"></div>\n';
const toastDiv = '<div id="toast-container"></div>';
if (c.includes(toastDiv)) {
  c = c.replace(toastDiv, overlayHtml + toastDiv);
  changed = true;
  console.log('HTML: OK');
}

// 2. Update showList()
const oldShow = 'function showList() {\n' +
  '    document.getElementById(\'customer-item-detail\').style.display = \'none\';\n' +
  '    document.getElementById(\'customer-list-view\').style.display   = \'block\';\n' +
  '    currentViewingId = null;\n' +
  '    setEditState(false);\n' +
  '    loadCustomers();\n' +
  '}';

const newShow = 'function showList() {\n' +
  '    const detailView = document.getElementById(\'customer-item-detail\');\n' +
  '    const listView = document.getElementById(\'customer-list-view\');\n' +
  '    currentViewingId = null;\n' +
  '    setEditState(false);\n' +
  '    transitionPage(detailView, listView).then(() => {\n' +
  '        loadCustomers();\n' +
  '    });\n' +
  '}';

if (c.includes(oldShow)) {
  c = c.replace(oldShow, newShow);
  changed = true;
  console.log('showList: OK');
} else {
  console.log('showList: FAIL');
}

// 3. Update viewCustomerDetail - replace the display toggle
const oldDetail = '    setEditState(false);\n\n' +
  '    document.getElementById(\'customer-list-view\').style.display   = \'none\';\n' +
  '    document.getElementById(\'customer-item-detail\').style.display = \'block\';';

const newDetail = '    setEditState(false);\n\n' +
  '    const custListView = document.getElementById(\'customer-list-view\');\n' +
  '    const custDetailView = document.getElementById(\'customer-item-detail\');\n' +
  '    transitionPage(custListView, custDetailView);';

if (c.includes(oldDetail)) {
  c = c.replace(oldDetail, newDetail);
  changed = true;
  console.log('viewCustomerDetail: OK');
} else {
  console.log('viewCustomerDetail: FAIL');
}

fs.writeFileSync('public/customer.html', c, 'utf8');
console.log('ALL DONE changed=' + changed);
