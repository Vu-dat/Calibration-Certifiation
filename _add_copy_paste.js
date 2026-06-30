const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'project.html');
let content = fs.readFileSync(filePath, 'utf-8');

let changes = 0;

// ===== 1. Add Paste button to the create-project modal =====
const modalBodyEnd = '</div>\n        <div class="modal-premium-footer">';
const pasteInsert = '</div>\n\n            <!-- Paste button -->\n            <div style="margin-top:16px; padding-top:14px; border-top:1px dashed var(--border);">\n                <button class="btn btn-secondary btn-sm" onclick="pasteCopiedProject()" id="btn-paste-project" style="width:100%; padding:10px; font-size:13px;" disabled>\n                    📋 Dán dữ liệu từ dự án đã copy\n                </button>\n                <div id="paste-info" style="margin-top:6px; font-size:11px; color:var(--text-muted); text-align:center;"></div>\n            </div>\n\n        </div>\n        <div class="modal-premium-footer">';

if (content.includes(modalBodyEnd) && !content.includes('btn-paste-project')) {
    content = content.replace(modalBodyEnd, pasteInsert);
    changes++;
    console.log('✅ Added paste button to modal');
}

// ===== 2. Add Copy button to project rows in fetchProjects() =====
// The line is: <button class="delete-btn" onclick="deleteProject('${proj.ID}')\">🗑</button>
// We need to find this exact string pattern in the file
const oldDeleteBtnPattern = 'delete-btn" onclick="deleteProject(\'$';
const idx = content.indexOf(oldDeleteBtnPattern);
if (idx > 0 && !content.includes('copyProjectData(')) {
    // Find the full button line
    const lineStart = content.lastIndexOf('\n', idx);
    const lineEnd = content.indexOf('\n', idx);
    const oldLine = content.substring(lineStart, lineEnd);
    
    // Create the new line with copy button
    const newLine = oldLine.replace('<button class="delete-btn"', 
        '<button class="btn-sm" onclick="copyProjectData(\'${proj.ID}\')" title="Copy dữ liệu dự án" style="border:none;background:none;cursor:pointer;font-size:16px;padding:4px 6px;border-radius:6px;">📋</button>\n            <button class="delete-btn"');
    
    content = content.replace(oldLine, newLine);
    changes++;
    console.log('✅ Added copy button to project rows');
}

// ===== 3. Add JavaScript functions at the end before </script> =====
const newFunctions = '\n' +
'/* ====== COPY / PASTE PROJECT DATA ====== */\n' +
'let _copiedProjectData = null;\n' +
'\n' +
'async function copyProjectData(projectId) {\n' +
'    try {\n' +
'        const proj = projectsList.find(p => p.ID === projectId);\n' +
'        if (!proj) {\n' +
'            showToast(\'Không tìm thấy dự án!\', \'warning\');\n' +
'            return;\n' +
'        }\n' +
'        showToast(\'📋 Đang sao chép dữ liệu dự án...\', \'info\');\n' +
'        const certNo = projectId.replace(\'PRJ-\', \'\');\n' +
'        let calibrationData = null;\n' +
'        try {\n' +
'            const response = await fetch(`${API_BASE_URL}/api/calibration/${certNo}`);\n' +
'            if (response.ok) {\n' +
'                calibrationData = await response.json();\n' +
'            }\n' +
'        } catch (e) {\n' +
'            console.warn(\'Không có dữ liệu hiệu chuẩn cũ:\', e);\n' +
'        }\n' +
'        const clipboardData = {\n' +
'            project: { title: proj.TITLE, tech: proj.TECH, status: proj.STATUS },\n' +
'            customer: window._selectedCustomer || null,\n' +
'            calibration: calibrationData,\n' +
'            copiedAt: new Date().toISOString()\n' +
'        };\n' +
'        localStorage.setItem(\'labmaster_copied_project\', JSON.stringify(clipboardData));\n' +
'        _copiedProjectData = clipboardData;\n' +
'        const pasteBtn = document.getElementById(\'btn-paste-project\');\n' +
'        if (pasteBtn) {\n' +
'            pasteBtn.disabled = false;\n' +
'            pasteBtn.style.opacity = \'1\';\n' +
'            pasteBtn.style.cursor = \'pointer\';\n' +
'        }\n' +
'        showToast(`✅ Đã sao chép dự án: ${proj.TITLE}`, \'success\');\n' +
'    } catch (error) {\n' +
'        console.error(\'Lỗi copy dự án:\', error);\n' +
'        showToast(\'Lỗi khi sao chép dự án!\', \'danger\');\n' +
'    }\n' +
'}\n' +
'\n' +
'function pasteCopiedProject() {\n' +
'    let stored = localStorage.getItem(\'labmaster_copied_project\');\n' +
'    if (stored) {\n' +
'        try { _copiedProjectData = JSON.parse(stored); } catch (e) {}\n' +
'    }\n' +
'    if (!_copiedProjectData || !_copiedProjectData.project) {\n' +
'        showToast(\'Không có dữ liệu dự án nào đã được copy!\', \'warning\');\n' +
'        return;\n' +
'    }\n' +
'    const data = _copiedProjectData.project;\n' +
'    const nameInput = document.getElementById(\'m-proj-name\');\n' +
'    const techInput = document.getElementById(\'m-proj-tech\');\n' +
'    if (nameInput) {\n' +
'        let newTitle = data.title || \'\';\n' +
'        const currentYear = new Date().getFullYear().toString();\n' +
'        const match = data.title?.match(/\\b(20\\d{2})\\b/);\n' +
'        if (match) {\n' +
'            const oldYear = match[1];\n' +
'            if (oldYear !== currentYear) {\n' +
'                newTitle = data.title.replace(oldYear, currentYear);\n' +
'            }\n' +
'        }\n' +
'        nameInput.value = newTitle;\n' +
'    }\n' +
'    if (techInput) techInput.value = data.tech || \'\';\n' +
'    const info = document.getElementById(\'paste-info\');\n' +
'    if (info) {\n' +
'        const copiedAt = _copiedProjectData.copiedAt ? new Date(_copiedProjectData.copiedAt).toLocaleString(\'vi-VN\') : \'không rõ\';\n' +
'        const hasCal = _copiedProjectData.calibration ? \'✅ Có dữ liệu hiệu chuẩn\' : \'❌ Không có dữ liệu hiệu chuẩn\';\n' +
'        info.innerHTML = `Đã dán từ "<strong>${data.title}</strong>" (${copiedAt})<br>${hasCal}`;\n' +
'    }\n' +
'    showToast(`📋 Đã dán dữ liệu từ: ${data.title}`, \'success\');\n' +
'}\n' +
'\n' +
'function checkCopiedData() {\n' +
'    const stored = localStorage.getItem(\'labmaster_copied_project\');\n' +
'    const pasteBtn = document.getElementById(\'btn-paste-project\');\n' +
'    const info = document.getElementById(\'paste-info\');\n' +
'    if (stored && pasteBtn) {\n' +
'        try {\n' +
'            const data = JSON.parse(stored);\n' +
'            if (data && data.project) {\n' +
'                pasteBtn.disabled = false;\n' +
'                pasteBtn.style.opacity = \'1\';\n' +
'                pasteBtn.style.cursor = \'pointer\';\n' +
'                _copiedProjectData = data;\n' +
'                if (info) {\n' +
'                    const copiedAt = data.copiedAt ? new Date(data.copiedAt).toLocaleString(\'vi-VN\') : \'\';\n' +
'                    info.innerHTML = `📋 Có dữ liệu từ "<strong>${data.project.title}</strong>"${copiedAt ? \' (\' + copiedAt + \')\' : \'\'}`;\n' +
'                }\n' +
'            }\n' +
'        } catch (e) {}\n' +
'    }\n' +
'}\n';

const lastScriptClose = '</script>';
const lastScriptIndex = content.lastIndexOf(lastScriptClose);

if (lastScriptIndex !== -1 && !content.includes('_copiedProjectData')) {
    const beforeScript = content.substring(0, lastScriptIndex);
    const afterScript = content.substring(lastScriptIndex);
    content = beforeScript + newFunctions + afterScript;
    changes++;
    console.log('✅ Added Copy/Paste JavaScript functions');
}

// ===== 4. Enable paste button check on modal open =====
const oldOpenModal = 'function openModal(id) { document.getElementById(id).style.display=\'flex\'; }';
const newOpenModal = 'function openModal(id) { \n' +
'    document.getElementById(id).style.display=\'flex\'; \n' +
'    if (id === \'modal-create-project\') {\n' +
'        setTimeout(checkCopiedData, 100);\n' +
'    }\n' +
'}';

if (content.includes(oldOpenModal) && !content.includes("id === 'modal-create-project'")) {
    content = content.replace(oldOpenModal, newOpenModal);
    changes++;
    console.log('✅ Updated openModal to check copied data');
}

// ===== 5. Modified executeCreateProject to duplicate calibration data =====
const oldExecuteCreate = 'async function executeCreateProject(payload) {\n' +
'    try {\n' +
'        const response = await fetch(`${API_URL}/projects`, {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify(payload)\n' +
'        });\n' +
'        const result = await response.json();\n' +
'        if (result.success) {\n' +
'            showToast("Khởi tạo dự án thành công!");\n' +
'            fetchProjects(); \n' +
'        } else {\n' +
'            showToast("Lỗi: " + result.message, "danger");\n' +
'        }\n' +
'    } catch (error) {\n' +
'        console.error("Lỗi khi tạo dự án:", error);\n' +
'        showToast("Lỗi kết nối máy chủ!", "danger");\n' +
'    }\n' +
'}';

const newExecuteCreate = 'async function executeCreateProject(payload) {\n' +
'    try {\n' +
'        const response = await fetch(`${API_URL}/projects`, {\n' +
'            method: \'POST\',\n' +
'            headers: { \'Content-Type\': \'application/json\' },\n' +
'            body: JSON.stringify(payload)\n' +
'        });\n' +
'        const result = await response.json();\n' +
'        if (result.success) {\n' +
'            showToast("Khởi tạo dự án thành công!");\n' +
'            const newProjectId = result.id;\n' +
'            if (newProjectId && _copiedProjectData && _copiedProjectData.calibration) {\n' +
'                try {\n' +
'                    const newCertNo = newProjectId.replace(\'PRJ-\', \'\');\n' +
'                    const cal = _copiedProjectData.calibration;\n' +
'                    const calPayload = {\n' +
'                        certNo: newCertNo,\n' +
'                        instrumentName: cal.cert?.INSTRUMENT_NAME || payload.title || \'\',\n' +
'                        manufacturer: cal.cert?.MANUFACTURER || \'\',\n' +
'                        model: cal.cert?.MODEL || \'\',\n' +
'                        equipmentId: cal.cert?.EQUIPMENT_ID || \'\',\n' +
'                        serialNumber: cal.cert?.SERIAL_NUMBER || \'\',\n' +
'                        customerName: cal.cert?.CUSTOMER_NAME || (window._selectedCustomer?.NAME || \'\'),\n' +
'                        calDate: \'\',\n' +
'                        reCalDate: \'\',\n' +
'                        procedure: cal.cert?.PROCEDURE || \'\',\n' +
'                        refStandard: cal.cert?.REF_STANDARD || \'\',\n' +
'                        tempEnv: cal.cert?.TEMP_ENV || \'\',\n' +
'                        humiEnv: cal.cert?.HUMI_ENV || \'\',\n' +
'                        headOfLab: cal.cert?.HEAD_OF_LAB || \'\',\n' +
'                        director: cal.cert?.DIRECTOR || \'\',\n' +
'                        points: (cal.points || []).map(p => ({\n' +
'                            parameterName: p.PARAMETER_NAME || \'\',\n' +
'                            calPoint: p.CAL_POINT || \'\',\n' +
'                            asFoundValue: p.AS_FOUND_VALUE || \'\',\n' +
'                            uncertainty: p.UNCERTAINTY || \'\',\n' +
'                            tolerance: p.TOLERANCE || \'\',\n' +
'                            conformity: p.CONFORMITY || \'\',\n' +
'                            refEq: p.REF_EQUIPMENT || p.STANDARD_EQUIPMENT || \'\'\n' +
'                        })),\n' +
'                        standards: (cal.standards || []).map(s => ({\n' +
'                            name: s.EQ_NAME || \'\',\n' +
'                            id: s.EQ_CODE || \'\',\n' +
'                            trace: s.LINK || \'\',\n' +
'                            due: s.VALIDITY || \'\'\n' +
'                        })),\n' +
'                        currentUser: (JSON.parse(localStorage.getItem(\'labmaster_user\') || \'{}\'))?.fullName || "KTV"\n' +
'                    };\n' +
'                    const saveRes = await fetch(`${API_URL}/calibration/save`, {\n' +
'                        method: \'POST\',\n' +
'                        headers: { \'Content-Type\': \'application/json\' },\n' +
'                        body: JSON.stringify(calPayload)\n' +
'                    });\n' +
'                    const saveResult = await saveRes.json();\n' +
'                    if (saveResult.success) {\n' +
'                        showToast("✅ Đã duplicate dữ liệu hiệu chuẩn sang dự án mới!");\n' +
'                    }\n' +
'                } catch (dupError) {\n' +
'                    console.warn(\'Không thể duplicate dữ liệu hiệu chuẩn:\', dupError);\n' +
'                }\n' +
'            }\n' +
'            fetchProjects(); \n' +
'        } else {\n' +
'            showToast("Lỗi: " + result.message, "danger");\n' +
'        }\n' +
'    } catch (error) {\n' +
'        console.error("Lỗi khi tạo dự án:", error);\n' +
'        showToast("Lỗi kết nối máy chủ!", "danger");\n' +
'    }\n' +
'}';

if (content.includes(oldExecuteCreate) && !content.includes('_copiedProjectData && _copiedProjectData.calibration')) {
    content = content.replace(oldExecuteCreate, newExecuteCreate);
    changes++;
    console.log('✅ Updated executeCreateProject to duplicate calibration data');
}

// Write the modified file
fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n✅ Hoàn thành! Đã thực hiện ${changes} thay đổi.`);
