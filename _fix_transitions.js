const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf8');

let changed = false;

// 1. Replace showProjectList
const oldShowList = 'function showProjectList() {\n  document.getElementById(\'project-list-view\').style.display=\'block\';\n  document.getElementById(\'project-detail-view\').style.display=\'none\';\n  document.getElementById(\'calibration-editor-view\').style.display=\'none\';\n  \n  // Xóa nội dung tìm kiếm khách hàng khi quay lại danh sách\n  document.getElementById(\'cust-search-detail\').value = \'\';\n  document.getElementById(\'selected-cust-details\').style.display = \'none\';\n  fetchProjects();\n}';

const newShowList = 'function showProjectList() {\n  const listView = document.getElementById(\'project-list-view\');\n  const detailView = document.getElementById(\'project-detail-view\');\n  const editorView = document.getElementById(\'calibration-editor-view\');\n  \n  // Xóa nội dung tìm kiếm khách hàng khi quay lại danh sách\n  document.getElementById(\'cust-search-detail\').value = \'\';\n  document.getElementById(\'selected-cust-details\').style.display = \'none\';\n  \n  // Determine which view is currently visible\n  const currentView = detailView.style.display !== \'none\' && detailView.style.display !== \'\' ? detailView :\n                      editorView.style.display !== \'none\' && editorView.style.display !== \'\' ? editorView : null;\n  \n  if (currentView) {\n    transitionPage(currentView, listView).then(() => {\n      fetchProjects();\n    });\n  } else {\n    listView.style.display = \'block\';\n    fetchProjects();\n  }\n}';

if (c.includes(oldShowList)) {
  c = c.replace(oldShowList, newShowList);
  changed = true;
  console.log('showProjectList REPLACED');
} else {
  console.log('showProjectList NOT FOUND');
}

// 2. Replace the display switching section in viewProjectDetail
const oldViewDetailDisplay = '  // --- Bọc an toàn cho phần ẩn/hiện giao diện (Tránh lỗi sập style) ---\n  const listView = document.getElementById(\'project-list-view\');\n  const detailView = document.getElementById(\'project-detail-view\');\n  const editorView = document.getElementById(\'calibration-editor-view\');\n\n  if(listView) listView.style.display = \'none\';\n  if(detailView) detailView.style.display = \'block\';\n  if(editorView) editorView.style.display = \'none\';';

const newViewDetailDisplay = '  // --- Bọc an toàn cho phần ẩn/hiện giao diện (Tránh lỗi sập style) ---\n  const listView = document.getElementById(\'project-list-view\');\n  const detailView = document.getElementById(\'project-detail-view\');\n  const editorView = document.getElementById(\'calibration-editor-view\');\n\n  // Animate transition\n  transitionPage(listView, detailView);';

if (c.includes(oldViewDetailDisplay)) {
  c = c.replace(oldViewDetailDisplay, newViewDetailDisplay);
  changed = true;
  console.log('viewProjectDetail REPLACED');
} else {
  console.log('viewProjectDetail NOT FOUND');
}

// 3. Replace backToProjectDetail
const oldBackToDetail = 'function backToProjectDetail() {\n  document.getElementById(\'calibration-editor-view\').style.display=\'none\';\n  document.getElementById(\'project-detail-view\').style.display=\'block\';\n}';

const newBackToDetail = 'function backToProjectDetail() {\n  const editorView = document.getElementById(\'calibration-editor-view\');\n  const detailView = document.getElementById(\'project-detail-view\');\n  transitionPage(editorView, detailView);\n}';

if (c.includes(oldBackToDetail)) {
  c = c.replace(oldBackToDetail, newBackToDetail);
  changed = true;
  console.log('backToProjectDetail REPLACED');
} else {
  console.log('backToProjectDetail NOT FOUND');
}

fs.writeFileSync('public/project.html', c, 'utf8');
console.log('DONE changed=' + changed);
