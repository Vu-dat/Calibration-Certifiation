const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'project.html');
let content = fs.readFileSync(filePath, 'utf-8');

let changes = 0;

// ===== 1. Add Paste button to modal =====
// Find the modal body end: after tech input, before footer
const modalSearch1 = 'id="m-proj-tech" placeholder="Nhập tên kỹ thuật viên...">\n            </div>\n\n        </div>\n        <div class="modal-premium-footer">';

const pasteHtml = 'id="m-proj-tech" placeholder="Nhập tên kỹ thuật viên...">\n            </div>\n\n            <!-- Paste button -->\n            <div style="margin-top:16px; padding-top:14px; border-top:1px dashed var(--border);">\n                <button class="btn btn-secondary btn-sm" onclick="pasteCopiedProject()" id="btn-paste-project" style="width:100%; padding:10px; font-size:13px;" disabled>\n                    📋 Dán dữ liệu từ dự án đã copy\n                </button>\n                <div id="paste-info" style="margin-top:6px; font-size:11px; color:var(--text-muted); text-align:center;"></div>\n            </div>\n\n        </div>\n        <div class="modal-premium-footer">';

if (content.includes(modalSearch1) && !content.includes('btn-paste-project')) {
    content = content.replace(modalSearch1, pasteHtml);
    changes++;
    console.log('✅ Added paste button to modal');
} else {
    // Try alternative pattern without the newline after >
    const modalSearch2 = 'id="m-proj-tech" placeholder="Nhập tên kỹ thuật viên...">\n            </div>\n\n        </div>\n        <div class="modal-premium-footer">';
    const modalSearch2b = modalSearch2.replace(/\n/g, '\r\n');
    if (content.includes(modalSearch2b) && !content.includes('btn-paste-project')) {
        const pasteHtml2 = pasteHtml.replace(/\n/g, '\r\n');
        content = content.replace(modalSearch2b, pasteHtml2);
        changes++;
        console.log('✅ Added paste button to modal (pattern 2)');
    }
}

// ===== 2. Fix executeCreateProject to duplicate calibration data =====
const oldFn = `        if (result.success) {
            showToast("Khởi tạo dự án thành công!");
            fetchProjects(); 
        } else {`;

const newFn = `        if (result.success) {
            showToast("Khởi tạo dự án thành công!");
            
            // Auto-duplicate calibration data if copied
            const newProjectId = result.id;
            if (newProjectId && window._copiedProjectData && window._copiedProjectData.calibration) {
                try {
                    const newCertNo = newProjectId.replace('PRJ-', '');
                    const cal = window._copiedProjectData.calibration;
                    const calPayload = {
                        certNo: newCertNo,
                        instrumentName: cal.cert?.INSTRUMENT_NAME || payload.title || '',
                        manufacturer: cal.cert?.MANUFACTURER || '',
                        model: cal.cert?.MODEL || '',
                        equipmentId: cal.cert?.EQUIPMENT_ID || '',
                        serialNumber: cal.cert?.SERIAL_NUMBER || '',
                        customerName: cal.cert?.CUSTOMER_NAME || (window._selectedCustomer?.NAME || ''),
                        calDate: '',
                        reCalDate: '',
                        procedure: cal.cert?.PROCEDURE || '',
                        refStandard: cal.cert?.REF_STANDARD || '',
                        tempEnv: cal.cert?.TEMP_ENV || '',
                        humiEnv: cal.cert?.HUMI_ENV || '',
                        headOfLab: cal.cert?.HEAD_OF_LAB || '',
                        director: cal.cert?.DIRECTOR || '',
                        points: (cal.points || []).map(p => ({
                            parameterName: p.PARAMETER_NAME || '',
                            calPoint: p.CAL_POINT || '',
                            asFoundValue: p.AS_FOUND_VALUE || '',
                            uncertainty: p.UNCERTAINTY || '',
                            tolerance: p.TOLERANCE || '',
                            conformity: p.CONFORMITY || '',
                            refEq: p.REF_EQUIPMENT || p.STANDARD_EQUIPMENT || ''
                        })),
                        standards: (cal.standards || []).map(s => ({
                            name: s.EQ_NAME || '',
                            id: s.EQ_CODE || '',
                            trace: s.LINK || '',
                            due: s.VALIDITY || ''
                        })),
                        currentUser: (JSON.parse(localStorage.getItem('labmaster_user') || '{}'))?.fullName || 'KTV'
                    };
                    const saveRes = await fetch(API_URL + '/calibration/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(calPayload)
                    });
                    const saveResult = await saveRes.json();
                    if (saveResult.success) {
                        showToast('✅ Đã duplicate dữ liệu hiệu chuẩn sang dự án mới!');
                    }
                } catch (dupError) {
                    console.warn('Không thể duplicate dữ liệu hiệu chuẩn:', dupError);
                }
            }
            
            fetchProjects(); 
        } else {`;

if (content.includes(oldFn) && !content.includes('_copiedProjectData && _copiedProjectData.calibration')) {
    content = content.replace(oldFn, newFn);
    changes++;
    console.log('✅ Fixed executeCreateProject to auto-duplicate calibration data');
} else {
    console.log('⚠️ Could not find old executeCreateProject pattern');
}

// Write the modified file
fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n✅ Done! ${changes} changes made.`);
