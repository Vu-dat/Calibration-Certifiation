const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'project.html');
let content = fs.readFileSync(filePath, 'utf-8');

const target = 'async function copyProjectData(projectId) {\n    try {\n        const proj = projectsList.find(p => p.ID === projectId);\n        if (!proj) {\n            showToast(\'Không tìm thấy dự án!\', \'warning\');\n            return;\n        }\n        showToast(\'📋 Đang sao chép dữ liệu dự án...\', \'info\');';

const newTarget = 'async function copyProjectData(projectId) {\n    try {\n        const proj = projectsList.find(p => p.ID === projectId);\n        if (!proj) {\n            showToast(\'Không tìm thấy dự án!\', \'warning\');\n            return;\n        }\n        if (!confirm(`Xác nhận sao chép toàn bộ dữ liệu của dự án "${proj.TITLE}" (${projectId})? Dữ liệu này sẽ được dùng để tạo dự án mới.`)) {\n            return;\n        }\n        showToast(\'📋 Đang sao chép dữ liệu dự án...\', \'info\');';

if (content.includes(target) && !content.includes('confirm(`Xác nhận sao chép')) {
    content = content.replace(target, newTarget);
    console.log('✅ Added confirm dialog before copy');
} else {
    // Try with \r\n
    const target2 = target.replace(/\n/g, '\r\n');
    const newTarget2 = newTarget.replace(/\n/g, '\r\n');
    if (content.includes(target2) && !content.includes('confirm(`Xác nhận sao chép')) {
        content = content.replace(target2, newTarget2);
        console.log('✅ Added confirm dialog before copy (CRLF)');
    } else {
        console.log('⚠️ Target not found');
    }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Done');
