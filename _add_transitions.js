const fs = require('fs');
let content = fs.readFileSync('public/project.html', 'utf8');

if (content.includes('page-transition')) {
  console.log('ALREADY_EXISTS');
  process.exit(0);
}

// === 1. ADD CSS PAGE TRANSITION STYLES ===
// Find the last @media block in the style and add before it
const cssInsertion = `
    /* ─── PAGE TRANSITION ANIMATIONS ─── */
    .page-transition {
        position: relative;
    }
    @keyframes pageSlideOut {
        0%   { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-20px) scale(0.96); }
    }
    @keyframes pageSlideIn {
        0%   { opacity: 0; transform: translateY(24px) scale(0.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .page-out {
        animation: pageSlideOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
        pointer-events: none;
    }
    .page-in {
        animation: pageSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
    }

    @media (max-width: 560px) {
`;

content = content.replace('    @media (max-width: 560px) {', cssInsertion);

// === 2. ADD transitionPage HELPER FUNCTION ===
// Insert before "function showProjectList()"
const transitionFn = `
/* ====== PAGE TRANSITION HELPER ====== */
function transitionPage(fromView, toView) {
  return new Promise((resolve) => {
    // Animate out the current view
    fromView.classList.add('page-out');
    
    setTimeout(() => {
      fromView.style.display = 'none';
      fromView.classList.remove('page-out');
      
      // Animate in the new view
      toView.style.display = 'block';
      toView.classList.add('page-in');
      
      setTimeout(() => {
        toView.classList.remove('page-in');
        resolve();
      }, 450);
    }, 350);
  });
}

`;

content = content.replace('function showProjectList()', transitionFn + 'function showProjectList()');

// === 3. MODIFY showProjectList() ===
const oldShowProjectList = `function showProjectList() {
  document.getElementById('project-list-view').style.display='block';
  document.getElementById('project-detail-view').style.display='none';
  document.getElementById('calibration-editor-view').style.display='none';
  
  // Xóa nội dung tìm kiếm khách hàng khi quay lại danh sách
  document.getElementById('cust-search-detail').value = '';
  document.getElementById('selected-cust-details').style.display = 'none';
  fetchProjects();
}`;

const newShowProjectList = `function showProjectList() {
  const listView = document.getElementById('project-list-view');
  const detailView = document.getElementById('project-detail-view');
  const editorView = document.getElementById('calibration-editor-view');
  
  // Xóa nội dung tìm kiếm khách hàng khi quay lại danh sách
  document.getElementById('cust-search-detail').value = '';
  document.getElementById('selected-cust-details').style.display = 'none';
  
  // Determine which view is currently visible
  const currentView = detailView.style.display !== 'none' ? detailView :
                      editorView.style.display !== 'none' ? editorView : null;
  
  if (currentView) {
    transitionPage(currentView, listView).then(() => {
      fetchProjects();
    });
  } else {
    listView.style.display = 'block';
    fetchProjects();
  }
}`;

content = content.replace(oldShowProjectList, newShowProjectList);

// === 4. MODIFY viewProjectDetail() ===
const oldViewDetailStart = `function viewProjectDetail(id) {
  currentProjectId = id;
  const proj = projectsList.find(p => p.ID === id);
  if(!proj) return;

  currentTitle = proj.TITLE;

  // --- LOGIC MỚI: Tìm tên thiết bị chuẩn từ Database Equipment dựa trên tên dự án ---
  const titleLower = proj.TITLE.toLowerCase();
  const templateMapping = {
    'wascator': 'Washing Machine', 'máy giặt': 'Washing Machine', 'sij': 'Washing Machine',
    'lò sấy': 'Dryer', 'dryer': 'Dryer',
    'tủ lạnh': 'Refrigerator', 'refrigerator': 'Refrigerator'
  };

  // Mặc định ban đầu nếu không khớp mẫu nào thì dùng tên dự án hiện tại
  currentEquipmentName = proj.TITLE; 

  // Kiểm tra từ khóa ánh xạ sang tên thiết bị chuẩn trong DB
  for (const [kw, tpl] of Object.entries(templateMapping)) {
    if (titleLower.includes(kw) && MockDatabaseEquipment[tpl]) {
      currentEquipmentName = tpl; // Gán bằng tên thiết bị lấy từ databasequipment
      break;
    }
  }
  // --------------------------------------------------------------------------------

  // --- Bọc an toàn cho phần ẩn/hiện giao diện (Tránh lỗi sập style) ---
  const listView = document.getElementById('project-list-view');
  const detailView = document.getElementById('project-detail-view');
  const editorView = document.getElementById('calibration-editor-view');

  if(listView) listView.style.display = 'none';
  if(detailView) detailView.style.display = 'block';
  if(editorView) editorView.style.display = 'none';`;

const newViewDetailStart = `function viewProjectDetail(id) {
  currentProjectId = id;
  const proj = projectsList.find(p => p.ID === id);
  if(!proj) return;

  currentTitle = proj.TITLE;

  // --- LOGIC MỚI: Tìm tên thiết bị chuẩn từ Database Equipment dựa trên tên dự án ---
  const titleLower = proj.TITLE.toLowerCase();
  const templateMapping = {
    'wascator': 'Washing Machine', 'máy giặt': 'Washing Machine', 'sij': 'Washing Machine',
    'lò sấy': 'Dryer', 'dryer': 'Dryer',
    'tủ lạnh': 'Refrigerator', 'refrigerator': 'Refrigerator'
  };

  // Mặc định ban đầu nếu không khớp mẫu nào thì dùng tên dự án hiện tại
  currentEquipmentName = proj.TITLE; 

  // Kiểm tra từ khóa ánh xạ sang tên thiết bị chuẩn trong DB
  for (const [kw, tpl] of Object.entries(templateMapping)) {
    if (titleLower.includes(kw) && MockDatabaseEquipment[tpl]) {
      currentEquipmentName = tpl; // Gán bằng tên thiết bị lấy từ databasequipment
      break;
    }
  }
  // --------------------------------------------------------------------------------

  // --- Bọc an toàn cho phần ẩn/hiện giao diện (Tránh lỗi sập style) ---
  const listView = document.getElementById('project-list-view');
  const detailView = document.getElementById('project-detail-view');
  const editorView = document.getElementById('calibration-editor-view');

  // Animate transition
  transitionPage(listView, detailView).then(() => {`;

content = content.replace(oldViewDetailStart, newViewDetailStart);

// Find the end of the initial setup block in viewProjectDetail and add the closing bracket
const oldDetailTransitionEnd = `  // --- Đổ dữ liệu vào các thẻ hiển thị chi tiết ---
  if(document.getElementById('pd-id')) document.getElementById('pd-id').textContent = proj.ID;`;

const newDetailTransitionEnd = `  // --- Đổ dữ liệu vào các thẻ hiển thị chi tiết ---
  if(document.getElementById('pd-id')) document.getElementById('pd-id').textContent = proj.ID;`;

// Instead of complex matching, let me add the closing ) after the initial setup
// Actually, the viewProjectDetail function is very complex. Let me take a different approach.
// I'll wrap the content after the transition in a simpler way.

// Let me find a more reliable approach. Just modify the key parts.
// The issue is that viewProjectDetail is complex. Let me find the right pattern.

// Actually, looking more carefully, the old pattern I tried to replace has the issue that 
// the code inside viewProjectDetail continues with a lot of stuff. Let me just modify
// the transition approach to be cleaner.

// Simpler approach: Just replace the inline display changes in the viewProjectDetail's
// safe wrapping section with the transition call.

// Actually, let me revert the approach and instead modify showProjectList only, 
// and handle viewProjectDetail more simply.

// Let me re-read and try a cleaner approach.

// Check if oldViewDetailStart matches exactly...
// The indentation might be off. Let me use a different approach.

// Actually, let me just do the CSS and the showProjectList modification, 
// and handle viewProjectDetail by wrapping just the display changes.

// Let me look at what we've already changed and see if there were errors.
// The first two replacements should work (CSS and showProjectList).
// The viewProjectDetail one is more complex. Let me check and adjust.

console.log('PARTIALLY_DONE');
fs.writeFileSync('public/project.html', content, 'utf8');
