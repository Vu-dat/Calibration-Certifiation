/**
 * seed_real_equipments.js
 * 
 * Clears all existing equipment templates (test data) and seeds real templates 
 * from the Word files (1.1, 1.2, ref_crocking, 3, 4) into Supabase, 
 * including new metadata columns (model, serial_number, model_serial, 
 * manufacturer_id, spec_range, spec_resolution, standards_used, name_vi).
 * 
 * Run with: node seed_real_equipments.js
 */
require('dotenv').config({ override: true });
const sql = require('./db');

const templates = [
  {
    name: "1.1 Auto Crocking Meter",
    name_vi: "Máy thử bền màu ma sát",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "QV0388113",
    procedure: "FORCE-02:2026\nLINEAR-08:2026\nLINEAR-05:2026\nLAB-F01:2023",
    ref_standard: "AATCC TM 8, 165\nISO 105:X12, D02",
    model: "CROCKMASTER HD",
    serial_number: "TM092026",
    model_serial: "TM092026",
    manufacturer_id: "QV0388113",
    spec_range: "Lực tỳ/Downward force: 9 N\nHành trình/Stroke: 104 mm\nĐường kính đầu ma sát Finger Diameter: 16 mm\nTốc độ/Speed: 60 rpm",
    spec_resolution: "--------\n--------\n--------\n--------",
    standards_used: "[]",
    points: [
      { parameter: "Lực tỳ lên mẫu (M) Downward Force (N)", value: "BEGIN", asFound: "8,92", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Lực tỳ lên mẫu (M) Downward Force (N)", value: "MIDDLE", asFound: "8,93", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Lực tỳ lên mẫu (M) Downward Force (N)", value: "END", asFound: "8,94", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Hành trình ma sát (M) Stroke length (mm)", value: "", asFound: "102,8", ref: "104", unc: "0,08", tol: "± 3", conf: "A", std: "" },
      { parameter: "Đường kính đầu ma sát (M) Finger diameter (mm)", value: "", asFound: "16,02", ref: "16", unc: "0,02", tol: "± 0,1", conf: "A", std: "" },
      { parameter: "Tốc độ (C) Speed (rpm)", value: "", asFound: "60,5", ref: "60", unc: "0,5", tol: "± 1", conf: "A", std: "" },
      { parameter: "Bộ đếm (*) Counter", value: "", asFound: "10", ref: "10", unc: "--", tol: "--", conf: "--", std: "" }
    ]
  },
  {
    name: "1.2 Manual Crocking Meter",
    name_vi: "Máy thử bền màu ma sát",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "QV0388113",
    procedure: "FORCE-02:2026\nLINEAR-08:2026\nLINEAR-05:2026",
    ref_standard: "AATCC TM 8, 165\nISO 105:X12, D02",
    model: "CROCKMASTER HD",
    serial_number: "TM092026",
    model_serial: "TM092026",
    manufacturer_id: "QV0388113",
    spec_range: "Lực tỳ/Downward force: 9 N\nHành trình/Stroke: 104 mm\nĐường kính đầu ma sát Finger Diameter: 16 mm",
    spec_resolution: "--------\n--------\n--------",
    standards_used: "[]",
    points: [
      { parameter: "Lực tỳ lên mẫu (M) Downward Force (N)", value: "BEGIN", asFound: "8,92", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Lực tỳ lên mẫu (M) Downward Force (N)", value: "MIDDLE", asFound: "8,93", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Lực tỳ lên mẫu (M) Downward Force (N)", value: "END", asFound: "8,94", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Hành trình ma sát (M) Stroke length (mm)", value: "", asFound: "102,8", ref: "104", unc: "0,08", tol: "± 3", conf: "A", std: "" },
      { parameter: "Đường kính đầu ma sát (M) Finger diameter (mm)", value: "", asFound: "16,02", ref: "16", unc: "0,02", tol: "± 0,1", conf: "A", std: "" },
      { parameter: "Tốc độ (C) Speed (rpm)", value: "", asFound: "60,5", ref: "60", unc: "0,5", tol: "± 1", conf: "A", std: "" },
      { parameter: "Bộ đếm (*) Counter", value: "", asFound: "10", ref: "10", unc: "--", tol: "--", conf: "D", std: "" }
    ]
  },
  {
    name: "ref_crocking",
    name_vi: "Máy thử bền màu ma sát",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "QV0388113",
    procedure: "FORCE-02:2026\nLINEAR-08:2026\nLINEAR-05:2026",
    ref_standard: "AATCC TM 8, 165\nISO 105:X12, D02",
    model: "CROCKMASTER HD",
    serial_number: "TM092026",
    model_serial: "TM092026",
    manufacturer_id: "QV0388113",
    spec_range: "Lực tỳ/Downward force: 9 N\nHành trình/Stroke: 104 mm\nĐường kính đầu ma sát Finger Diameter: 16 mm",
    spec_resolution: "--------\n--------\n--------",
    standards_used: "[]",
    points: [
      { parameter: "Lực tỳ lên mẫu Downward Force (N)", value: "BEGIN", asFound: "8,92", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Lực tỳ lên mẫu Downward Force (N)", value: "MIDDLE", asFound: "8,93", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Lực tỳ lên mẫu Downward Force (N)", value: "END", asFound: "8,94", ref: "9", unc: "0,05", tol: "± 0,2", conf: "A", std: "" },
      { parameter: "Hành trình ma sát Stroke length (mm)", value: "", asFound: "102,8", ref: "104", unc: "0,08", tol: "± 3", conf: "A", std: "" },
      { parameter: "Đường kính đầu ma sát Finger diameter (mm)", value: "", asFound: "16,02", ref: "16", unc: "0,02", tol: "± 0,1", conf: "A", std: "" },
      { parameter: "Tốc độ Speed (rpm)", value: "", asFound: "60,5", ref: "60", unc: "0,5", tol: "± 1", conf: "A", std: "" },
      { parameter: "Bộ đếm Counter", value: "", asFound: "10", ref: "10", unc: "--", tol: "--", conf: "--", std: "" }
    ]
  },
  {
    name: "3. JIS Rubbing Tester",
    name_vi: "Máy thử bền màu ma sát",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "QV0388113",
    procedure: "LAB-M-01:2023\nLINEAR-08:2026\nLINEAR-05:2026\nLAB-F-01:2023",
    ref_standard: "JIS L0849 Type II\nJIS L0823",
    model: "CROCKMASTER HD",
    serial_number: "TM092026",
    model_serial: "TM092026",
    manufacturer_id: "QV0388113",
    spec_range: "Tải trọng/weight: 500 g\nHành trình/Stroke: 120 mm\nKích thước đầu ma sát Finger Dimension: 20 mm\nTốc độ/Speed: 30 cpm",
    spec_resolution: "--------\n--------\n--------\n--------",
    standards_used: "[\"LAB-BALANCE.01\",\"LAB-CALIPER.01\",\"LAB-TACHO.01\"]",
    points: [
      { parameter: "Tốc độ (C) Speed (rpm)", value: "", asFound: "60,5", ref: "30", unc: "0,5", tol: "± 1", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Hành trình ma sát (M) Stroke length (mm)", value: "", asFound: "102,8", ref: "120", unc: "0,02", tol: "± 3", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Bán kính bàn giữ mẫu(*) Specimen stage surface Radius (mm)", value: "", asFound: "200", ref: "200", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" },
      { parameter: "Tải trọng của búa chà sát(C) Friction hammer load (g)", value: "1", asFound: "", ref: "200", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng của búa chà sát(C) Friction hammer load (g)", value: "2", asFound: "", ref: "200", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng của búa chà sát(C) Friction hammer load (g)", value: "3", asFound: "", ref: "200", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng của búa chà sát(C) Friction hammer load (g)", value: "4", asFound: "", ref: "200", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng của búa chà sát(C) Friction hammer load (g)", value: "5", asFound: "", ref: "200", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng của búa chà sát(C) Friction hammer load (g)", value: "6", asFound: "", ref: "200", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng phụ(C) Auxiliary load (g)", value: "1", asFound: "", ref: "300", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng phụ(C) Auxiliary load (g)", value: "2", asFound: "", ref: "300", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng phụ(C) Auxiliary load (g)", value: "3", asFound: "", ref: "300", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng phụ(C) Auxiliary load (g)", value: "4", asFound: "", ref: "300", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng phụ(C) Auxiliary load (g)", value: "5", asFound: "", ref: "300", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng phụ(C) Auxiliary load (g)", value: "6", asFound: "", ref: "300", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Kích thước của búa chà sát: (Dài x Rộng x Bán kính) Dimension of Friction hammer (L x W x R) (mm)", value: "1", asFound: "", ref: "20x20x45", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước của búa chà sát: (Dài x Rộng x Bán kính) Dimension of Friction hammer (L x W x R) (mm)", value: "2", asFound: "", ref: "20x20x45", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước của búa chà sát: (Dài x Rộng x Bán kính) Dimension of Friction hammer (L x W x R) (mm)", value: "3", asFound: "", ref: "20x20x45", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước của búa chà sát: (Dài x Rộng x Bán kính) Dimension of Friction hammer (L x W x R) (mm)", value: "4", asFound: "", ref: "20x20x45", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước của búa chà sát: (Dài x Rộng x Bán kính) Dimension of Friction hammer (L x W x R) (mm)", value: "5", asFound: "", ref: "20x20x45", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước của búa chà sát: (Dài x Rộng x Bán kính) Dimension of Friction hammer (L x W x R) (mm)", value: "6", asFound: "", ref: "20x20x45", unc: "0,02", tol: "--", conf: "D", std: "LAB-CALIPER.01" }
    ]
  },
  {
    name: "4. Veslic Rubbing Tester",
    name_vi: "Máy đo độ bền chà xát Veslic",
    manufacturer: "Gester",
    next_due: "2027-06-25",
    equipment_id: "--",
    procedure: "LAB-M-01:2023\nLINEAR-08:2026\nLAB-F01:2023",
    ref_standard: "ISO 11640\nSATRA PM 173",
    model: "GT-KC01-1",
    serial_number: "TM092026",
    model_serial: "TM092026",
    manufacturer_id: "",
    spec_range: "Tải trọng/Downward force: 1000 g\nHành trình/Stroke: 40 mm\nTốc độ/Speed: 40 mm",
    spec_resolution: "--------\n--------\n--------",
    standards_used: "[\"LAB-BALANCE.01\",\"LAB-CALIPER.01\",\"LAB-TACHO.01\"]",
    points: [
      { parameter: "Tải trọng (C)Downward Force(g)", value: "Quả tảiWeight", asFound: "502.4", ref: "500", unc: "0.43", tol: "±10", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng (C)Downward Force(g)", value: "Thanh gắng mẫuRubbing finger", asFound: "498.9", ref: "500", unc: "0.43", tol: "±10", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng (C)Downward Force(g)", value: "Tổng cộngTotal", asFound: "1001.3", ref: "1000", unc: "0.43", tol: "±20", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Hành trình ma sát (M)Stroke length(mm)", value: "", asFound: "36.65", ref: "35 - 40", unc: "0.2", tol: "--", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Tốc độ (C)Speed(rpm)", value: "", asFound: "39.3", ref: "40", unc: "0.6", tol: "± 2", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Bộ đếm (*)Counter", value: "", asFound: "10", ref: "10", unc: "--", tol: "--", conf: "--", std: "" }
    ]
  },
  {
    name: "2. LINEAR-07 QTHC Tensile Tester",
    name_vi: "Máy thử cường lực",
    manufacturer: "GOTECH",
    next_due: "2027-01-08",
    equipment_id: "--",
    procedure: "LINEAR-07",
    ref_standard: "",
    model: "AI-3000",
    serial_number: "TC150601359",
    model_serial: "TC150601359",
    manufacturer_id: "",
    spec_range: "Dải đo Range: 800 mm",
    spec_resolution: "0.1 mm",
    standards_used: '["LAB-LINEAR.01"]',
    points: [
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "50", ref: "50,014", unc: "0,058", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" },
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "100,2", ref: "100,213", unc: "0,058", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" },
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "200,1", ref: "200,078", unc: "0,077", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" },
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "299,8", ref: "299,814", unc: "0,058", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" },
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "400", ref: "400,012", unc: "0,058", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" },
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "500,2", ref: "500,212", unc: "0,058", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" },
      { parameter: "Hành trình dịch chuyển (M) Crosshead Displacement (mm)", value: "", asFound: "600,2", ref: "600,211", unc: "0,058", tol: "± 1", conf: "A", std: "LAB-LINEAR.01" }
    ]
  }
];

async function main() {
  try {
    console.log("🚀 Starting database migration for equipment templates with metadata and Vietnamese name...");

    await sql.begin(async (tx) => {
      // 1. Delete all existing templates and their template points
      console.log("🧹 Clearing existing templates and points...");
      await tx`DELETE FROM TEMPLATE_POINTS`;
      await tx`DELETE FROM EQUIPMENT_TEMPLATES`;

      // 2. Insert new templates with all metadata fields and points
      for (const t of templates) {
        console.log(`📥 Seeding template: "${t.name}" ("${t.name_vi}")...`);
        await tx`
          INSERT INTO EQUIPMENT_TEMPLATES (NAME, MANUFACTURER, NEXT_DUE, EQUIPMENT_ID, PROCEDURE, REF_STANDARD, MODEL, SERIAL_NUMBER, MODEL_SERIAL, MANUFACTURER_ID, SPEC_RANGE, SPEC_RESOLUTION, STANDARDS_USED, NAME_VI)
          VALUES (${t.name}, ${t.manufacturer}, ${t.next_due}, ${t.equipment_id}, ${t.procedure}, ${t.ref_standard}, ${t.model}, ${t.serial_number}, ${t.model_serial}, ${t.manufacturer_id}, ${t.spec_range}, ${t.spec_resolution}, ${t.standards_used}, ${t.name_vi})
        `;

        for (const p of t.points) {
          await tx`
            INSERT INTO TEMPLATE_POINTS (TEMPLATE_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, REFERENCE_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, STANDARD_EQUIPMENT)
            VALUES (${t.name}, ${p.parameter}, ${p.value}, ${p.asFound}, ${p.ref}, ${p.unc}, ${p.tol}, ${p.conf}, ${p.std})
          `;
        }
      }
    });

    console.log("🎉 Database migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
