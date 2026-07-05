const fs = require('fs');
let c = fs.readFileSync('public/project.html', 'utf-8').replace(/\r\n/g, '\n');

// 1. Remove resetWorkspaceForm() calls from loadExistingCalibration (3 occurrences)
// First one: after 404 check
c = c.replace(
  'console.log("Dự án mới, chưa có dữ liệu hiệu chuẩn cũ.");\n            resetWorkspaceForm();\n            return false;',
  'console.log("Dự án mới, chưa có dữ liệu hiệu chuẩn cũ.");\n            return false;'
);

// Second one: after hasSavedData check fails
c = c.replace(
  '            return true; \n        }\n\n        resetWorkspaceForm();\n        return false;\n\n    } catch (error) {',
  '            return true; \n        }\n\n        return false;\n\n    } catch (error) {'
);

// Third one: in catch block
c = c.replace(
  'console.error("Lỗi kiểm tra lịch sử hiệu chuẩn:", error);\n        resetWorkspaceForm();\n        return false;',
  'console.error("Lỗi kiểm tra lịch sử hiệu chuẩn:", error);\n        return false;'
);

// 2. Simplify Step 3 in openCalibrationWorkspace - ALWAYS reload template + table when !hasData
// Remove the complex if/else and just always restore both text fields AND table from template
const step3Old = `  // Bước 3: Đảm bảo tất cả thông tin thiết bị đúng (không bị ghi đè từ CERTIFICATES)
  if (equipmentNameFromRow && MockDatabaseEquipment[equipmentNameFromRow]) {
      if (!hasData) {
          // Không có dữ liệu DB → load lại toàn bộ template (kể cả bảng kết quả đo)
          selectEquipmentTemplate(equipmentNameFromRow);
      } else {
          // Có dữ liệu DB → chỉ restore text fields, giữ nguyên bảng từ DB
          const eq = MockDatabaseEquipment[equipmentNameFromRow];
          document.getElementById('f-inst-vi').value = equipmentNameFromRow;
          document.getElementById('f-inst-en').value = eq.instEn || equipmentNameFromRow;
          document.getElementById('f-mfr').value = eq.manufacturer || '';
          document.getElementById('f-model').value = eq.model || '';
          document.getElementById('f-id').value = eq.equipmentId || '';
          if (eq.procedure) document.getElementById('f-proc').value = eq.procedure;
          if (eq.refStandard) document.getElementById('f-ref').value = eq.refStandard;
          if (eq.nextDue) document.getElementById('f-recaldate').value = eq.nextDue;
      }
  }`;

const step3New = `  // Bước 3: Đảm bảo tất cả thông tin thiết bị đúng (không bị ghi đè từ CERTIFICATES)
  if (equipmentNameFromRow && MockDatabaseEquipment[equipmentNameFromRow]) {
      // Luôn restore text fields từ template (tránh bị ghi đè từ CERTIFICATES)
      const eq = MockDatabaseEquipment[equipmentNameFromRow];
      document.getElementById('f-inst-vi').value = equipmentNameFromRow;
      document.getElementById('f-inst-en').value = eq.instEn || equipmentNameFromRow;
      document.getElementById('f-mfr').value = eq.manufacturer || '';
      document.getElementById('f-model').value = eq.model || '';
      document.getElementById('f-id').value = eq.equipmentId || '';
      if (eq.procedure) document.getElementById('f-proc').value = eq.procedure;
      if (eq.refStandard) document.getElementById('f-ref').value = eq.refStandard;
      if (eq.nextDue) document.getElementById('f-recaldate').value = eq.nextDue;
      
      if (!hasData) {
          // Không có dữ liệu DB → load toàn bộ bảng kết quả đo từ template
          selectEquipmentTemplate(equipmentNameFromRow);
      }
  }`;

if (!c.includes(step3Old.trim())) {
  console.error('[FAIL] Could not find Step 3 block to replace');
  process.exit(1);
}

c = c.replace(step3Old, step3New);

// 3. Verify changes
const checks = [
  ['Removed resetWorkspaceForm after 404', !c.includes('console.log("Dự án mới, chưa có dữ liệu hiệu chuẩn cũ.");\n            resetWorkspaceForm();')],
  ['Removed resetWorkspaceForm after empty data', !c.includes('return true; \n        }\n\n        resetWorkspaceForm();')],
  ['Removed resetWorkspaceForm in catch', !c.includes('console.error("Lỗi kiểm tra lịch sử hiệu chuẩn:", error);\n        resetWorkspaceForm();')],
  ['Step 3 always restores text fields', c.includes('Luôn restore text fields từ template')],
  ['Step 3 conditionally loads table', c.includes('if (!hasData) {\n          selectEquipmentTemplate(equipmentNameFromRow);')],
];

let ok = 0, fail = 0;
checks.forEach(t => { console.log((t[1]?'[OK]':'[FAIL]') + ' ' + t[0]); if(t[1]) ok++; else fail++; });
console.log('Result: ' + ok + '/' + checks.length + ' passed' + (fail > 0 ? ', ' + fail + ' failed' : ''));

if (fail > 0) process.exit(1);

// Write back
fs.writeFileSync('public/project.html', c, 'utf-8');
console.log('[DONE] File written successfully');
