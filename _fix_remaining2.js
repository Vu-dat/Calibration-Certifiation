const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'project.html');
let content = fs.readFileSync(filePath, 'utf-8');

let changes = 0;

// 1. Add Paste button HTML to modal - exact lines from the file
const oldModalSection = '<input type="text" id="m-proj-tech" placeholder="Nhập tên kỹ thuật viên...">\r\n            </div>\r\n\r\n        </div>\r\n        <div class="modal-premium-footer">';
const newModalSection = '<input type="text" id="m-proj-tech" placeholder="Nhập tên kỹ thuật viên...">\r\n            </div>\r\n\r\n            <!-- Paste button -->\r\n            <div style="margin-top:16px; padding-top:14px; border-top:1px dashed var(--border);">\r\n                <button class="btn btn-secondary btn-sm" onclick="pasteCopiedProject()" id="btn-paste-project" style="width:100%; padding:10px; font-size:13px;" disabled>\r\n                    📋 Dán dữ liệu từ dự án đã copy\r\n                </button>\r\n                <div id="paste-info" style="margin-top:6px; font-size:11px; color:var(--text-muted); text-align:center;"></div>\r\n            </div>\r\n\r\n        </div>\r\n        <div class="modal-premium-footer">';

if (content.includes(oldModalSection) && !content.includes('<!-- Paste button -->')) {
    content = content.replace(oldModalSection, newModalSection);
    changes++;
    console.log('✅ Added paste button HTML to modal');
}

// 2. Update executeCreateProject to add auto-duplication
const oldFnLines = '            showToast("Khởi tạo dự án thành công!");\r\n            fetchProjects(); \r\n        } else {';
const newFnLines = '            showToast("Khởi tạo dự án thành công!");\r\n\r\n            // Auto-duplicate calibration data if copied from another project\r\n            const newId = result.id;\r\n            if (newId && typeof _copiedProjectData !== \'undefined\' && _copiedProjectData && _copiedProjectData.calibration && _copiedProjectData.calibration.cert) {\r\n                (async () => {\r\n                    try {\r\n                        const c = _copiedProjectData.calibration;\r\n                        const p = {\r\n                            certNo: newId.replace(\'PRJ-\', \'\'),\r\n                            instrumentName: c.cert?.INSTRUMENT_NAME || payload.title || \'\',\r\n                            manufacturer: c.cert?.MANUFACTURER || \'\',\r\n                            model: c.cert?.MODEL || \'\',\r\n                            equipmentId: c.cert?.EQUIPMENT_ID || \'\',\r\n                            serialNumber: c.cert?.SERIAL_NUMBER || \'\',\r\n                            customerName: c.cert?.CUSTOMER_NAME || \'\',\r\n                            calDate: \'\',\r\n                            reCalDate: \'\',\r\n                            procedure: c.cert?.PROCEDURE || \'\',\r\n                            refStandard: c.cert?.REF_STANDARD || \'\',\r\n                            tempEnv: c.cert?.TEMP_ENV || \'\',\r\n                            humiEnv: c.cert?.HUMI_ENV || \'\',\r\n                            headOfLab: c.cert?.HEAD_OF_LAB || \'\',\r\n                            director: c.cert?.DIRECTOR || \'\',\r\n                            points: (c.points || []).map(pt => ({\r\n                                parameterName: pt.PARAMETER_NAME || \'\',\r\n                                calPoint: pt.CAL_POINT || \'\',\r\n                                asFoundValue: pt.AS_FOUND_VALUE || \'\',\r\n                                uncertainty: pt.UNCERTAINTY || \'\',\r\n                                tolerance: pt.TOLERANCE || \'\',\r\n                                conformity: pt.CONFORMITY || \'\',\r\n                                refEq: pt.REF_EQUIPMENT || pt.STANDARD_EQUIPMENT || \'\'\r\n                            })),\r\n                            standards: (c.standards || []).map(s => ({\r\n                                name: s.EQ_NAME || \'\',\r\n                                id: s.EQ_CODE || \'\',\r\n                                trace: s.LINK || \'\',\r\n                                due: s.VALIDITY || \'\'\r\n                            })),\r\n                            currentUser: (JSON.parse(localStorage.getItem(\'labmaster_user\') || \'{}\'))?.fullName || \'KTV\'\r\n                        };\r\n                        const r = await fetch(API_URL + \'/calibration/save\', {\r\n                            method: \'POST\',\r\n                            headers: { \'Content-Type\': \'application/json\' },\r\n                            body: JSON.stringify(p)\r\n                        });\r\n                        const j = await r.json();\r\n                        if (j.success) showToast(\'✅ Đã duplicate dữ liệu hiệu chuẩn sang dự án mới!\');\r\n                    } catch(e) { console.warn(\'Lỗi duplicate:\', e); }\r\n                })();\r\n            }\r\n\r\n            fetchProjects(); \r\n        } else {';

if (content.includes(oldFnLines) && !content.includes('_copiedProjectData && _copiedProjectData.calibration')) {
    content = content.replace(oldFnLines, newFnLines);
    changes++;
    console.log('✅ Updated executeCreateProject to auto-duplicate calibration data');
} else {
    // Try with \n instead of \r\n
    const oldFnLines2 = oldFnLines.replace(/\r\n/g, '\n');
    const newFnLines2 = newFnLines.replace(/\r\n/g, '\n');
    if (content.includes(oldFnLines2) && !content.includes('_copiedProjectData && _copiedProjectData.calibration')) {
        content = content.replace(oldFnLines2, newFnLines2);
        changes++;
        console.log('✅ Updated executeCreateProject (pattern 2)');
    } else {
        // Debug: show what's around the target
        const idx = content.indexOf('showToast("Khởi tạo dự án thành công!")');
        if (idx > 0) {
            console.log('Found target at position', idx);
            console.log('Context:', content.substring(idx, idx + 80).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
        }
    }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n✅ Done! ${changes} changes made.`);
