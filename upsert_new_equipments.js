/**
 * upsert_new_equipments.js
 * 
 * Safely upserts the 7 new equipment templates (files 15 to 21) into PostgreSQL
 * without deleting existing equipment templates or certificates.
 */
require('dotenv').config({ override: true });
const sql = require('./db');

const newTemplates = [
  {
    name: "Tearing Tester",
    name_vi: "Thiết bị thử độ bền xé rách",
    name_en: "Tearing Strength Tester",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "EQ-000016",
    manufacturer_id: "EQ-000016",
    model: "Titan 5",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "LAB-M-01:2023\nLINEAR-05:2026",
    ref_standard: "ISO 13937\nASTM D1424",
    spec_range: "Khối lượng tải trọng/ Load: (150~3000) g\nKích thước/ Dimension: (2~35) mm",
    spec_resolution: "--------\n--------",
    standards_used: "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\"]",
    points: [
      { parameter: "Khoảng cách giữ hai ngàm kẹp (C) / Jaw seperation / (mm)", value: "", asFound: "2,58", ref: "2,50 ~ 2,75", unc: "0,02", tol: "--", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Chiều dài cắt mẫu ban đầu (C) / Precut Length / (mm)", value: "", asFound: "20.15", ref: "20", unc: "0.1", tol: "± 0.5", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)", value: "Ngàm tĩnh(Static Clamps) - Width", asFound: "35.76", ref: "37.5", unc: "0.05", tol: "± 2.5", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)", value: "Ngàm tĩnh(Static Clamps) - Height", asFound: "15.85", ref: "17.5", unc: "0.05", tol: "± 2.5", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)", value: "Ngàm động(Moving Clamps) - Width", asFound: "35.80", ref: "37.5", unc: "0.05", tol: "± 2.5", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)", value: "Ngàm động(Moving Clamps) - Height", asFound: "15.89", ref: "17.5", unc: "0.05", tol: "± 2.5", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)", value: "A", asFound: "250,3", ref: "--", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)", value: "B", asFound: "500,4", ref: "--", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)", value: "C", asFound: "750,4", ref: "--", unc: "0,43", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)", value: "D", asFound: "1500,6", ref: "--", unc: "1,0", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)", value: "E", asFound: "3000,7", ref: "--", unc: "1,0", tol: "--", conf: "D", std: "LAB-BALANCE.01" },
      { parameter: "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)", value: "A", asFound: "4,0", ref: "4", unc: "--", tol: "± 0,2", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)", value: "B", asFound: "8,0", ref: "8", unc: "--", tol: "± 0,3", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)", value: "C", asFound: "16,0", ref: "16", unc: "--", tol: "± 0,5", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)", value: "D", asFound: "32,0", ref: "32", unc: "--", tol: "± 1,0", conf: "A", std: "LAB-BALANCE.01" },
      { parameter: "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)", value: "E", asFound: "64,0", ref: "64", unc: "--", tol: "± 1,5", conf: "A", std: "LAB-BALANCE.01" }
    ]
  },
  {
    name: "Pneumatic Bursting Strength Tester",
    name_vi: "Máy thử độ bền đánh thủng – Dạng khí nén",
    name_en: "Pneumatic Bursting Strength Tester",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "EQ-000017",
    manufacturer_id: "EQ-000017",
    model: "Titan 5",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "PRESSURE-01:2026\nLINEAR-09:2026\nTIME-02:2026\nLINEAR-05:2026",
    ref_standard: "ISO 13938-2",
    spec_range: "Áp suất/Pressure: (0~1000) kPa\nĐộ cao phồng: Distension: (0~70) mm\nThời gian/Time: 20 s\nKích thước/Dimension: (30~113) mm",
    spec_resolution: "0,1 kPa\n0,1 mm\n0,1 s\n--------",
    standards_used: "[\"LAB-CALIPER.01\", \"LAB-DIS.01\", \"LAB-PRESSURE.01\", \"LAB-TIMER.02\"]",
    points: [
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "100", asFound: "101.1", ref: "100", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "200", asFound: "202.0", ref: "200", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "300", asFound: "302.8", ref: "300", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "400", asFound: "403.0", ref: "400", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "500", asFound: "503.3", ref: "500", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "600", asFound: "603.9", ref: "600", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "700", asFound: "704.1", ref: "700", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "800", asFound: "805.0", ref: "800", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Thời gian / Time (C) (s)", value: "20", asFound: "20.724", ref: "20", unc: "0.76", tol: "± 1", conf: "A", std: "LAB-TIMER.02" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "10", asFound: "10,02", ref: "10", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "20", asFound: "20,02", ref: "20", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "30", asFound: "30,03", ref: "30", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "40", asFound: "40,03", ref: "40", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "50", asFound: "50,03", ref: "50", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "60", asFound: "60,03", ref: "60", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "70", asFound: "70,03", ref: "70", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 7,3 cm2", asFound: "30,48", ref: "30,5", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 10 cm2", asFound: "35,78", ref: "35,7", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 50 cm2", asFound: "79,78", ref: "79,8", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 100 cm2", asFound: "113,78", ref: "113", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 7,3 cm2", asFound: "30,48", ref: "30,5", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 10 cm2", asFound: "35,78", ref: "35,7", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 50 cm2", asFound: "79,78", ref: "79,8", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 100 cm2", asFound: "113,78", ref: "113", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" }
    ]
  },
  {
    name: "Hydraulic Bursting Strength Tester",
    name_vi: "Máy thử độ bền đánh thủng – Dạng thuỷ lực",
    name_en: "Hydraulic Bursting Strength Tester",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "EQ-000018",
    manufacturer_id: "EQ-000018",
    model: "Titan 5",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "PRESSURE-01:2026\nLINEAR-09:2026\nTIME-02:2026\nLINEAR-05:2026",
    ref_standard: "ISO 13938-1",
    spec_range: "Áp suất/Pressure: (0~2000) kPa\nĐộ cao phồng: Distension: (0~70) mm\nThời gian/Time: 20 s\nKích thước/Dimension: (30~113) mm",
    spec_resolution: "0,1 kPa\n0,1 mm\n0,1 s\n--------",
    standards_used: "[\"LAB-CALIPER.01\", \"LAB-DIS.01\", \"LAB-PRESSURE.01\", \"LAB-TIMER.02\"]",
    points: [
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "200", asFound: "101.1", ref: "200", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "400", asFound: "402.0", ref: "400", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "600", asFound: "602.8", ref: "600", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "800", asFound: "803.0", ref: "800", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "1000", asFound: "1003.3", ref: "1000", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "1200", asFound: "1203.9", ref: "1200", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "1400", asFound: "1404.1", ref: "1400", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "1600", asFound: "1605.0", ref: "1600", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "1800", asFound: "1805.0", ref: "1800", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (kPa)", value: "2000", asFound: "2005.0", ref: "2000", unc: "4,2", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Thời gian / Time (C) (s)", value: "20", asFound: "20.724", ref: "20", unc: "0.76", tol: "± 1", conf: "A", std: "LAB-TIMER.02" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "10", asFound: "10,02", ref: "10", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "20", asFound: "20,02", ref: "20", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "30", asFound: "30,03", ref: "30", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "40", asFound: "40,03", ref: "40", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "50", asFound: "50,03", ref: "50", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "60", asFound: "60,03", ref: "60", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Chiều cao phồng/ Distension (C) (mm)", value: "70", asFound: "70,03", ref: "70", unc: "0,1", tol: "± 1", conf: "A", std: "LAB-DIS.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 7,3 cm2", asFound: "30,48", ref: "30,5", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 10 cm2", asFound: "35,78", ref: "35,7", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 50 cm2", asFound: "79,78", ref: "79,8", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên - 100 cm2", asFound: "113,78", ref: "113", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 7,3 cm2", asFound: "30,48", ref: "30,5", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 10 cm2", asFound: "35,78", ref: "35,7", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 50 cm2", asFound: "79,78", ref: "79,8", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới - 100 cm2", asFound: "113,78", ref: "113", unc: "0,02", tol: "± 0,2", conf: "A", std: "LAB-CALIPER.01" }
    ]
  },
  {
    name: "Mullen C Bursting Strength Tester",
    name_vi: "Máy thử độ bền đánh thủng – Mullen C",
    name_en: "Mullen C Bursting Strength Tester",
    manufacturer: "Mullen",
    next_due: "2027-06-25",
    equipment_id: "EQ-000019",
    manufacturer_id: "EQ-000019",
    model: "C",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "PRESSURE-01:2026",
    ref_standard: "ASTM D3786",
    spec_range: "Áp suất/Pressure: (0~200) Psi\nÁp suất/Pressure: (0~60) Psi",
    spec_resolution: "1 Psi\n0,5 Psi",
    standards_used: "[\"LAB-PRESSURE.01\"]",
    points: [
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "20", asFound: "21.1", ref: "20", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "40", asFound: "42.0", ref: "40", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "60", asFound: "62.8", ref: "60", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "80", asFound: "83.0", ref: "80", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "100", asFound: "103.3", ref: "100", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "120", asFound: "123.3", ref: "120", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "140", asFound: "143.9", ref: "140", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "160", asFound: "144.1", ref: "160", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)", value: "180", asFound: "185.0", ref: "180", unc: "1", tol: "± 2", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)", value: "10", asFound: "10.5", ref: "10", unc: "1", tol: "± 1", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)", value: "20", asFound: "20.6", ref: "20", unc: "1", tol: "± 1", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)", value: "30", asFound: "30.7", ref: "30", unc: "1", tol: "± 1", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)", value: "40", asFound: "40.7", ref: "40", unc: "1", tol: "± 1", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)", value: "50", asFound: "50.9", ref: "50", unc: "1", tol: "± 1", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Kiểm tra màn nhôm/ Alluminum foil check (*) (Psi)", value: "84,7", asFound: "86", ref: "84,7", unc: "--", tol: "± 3", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Kiểm tra màn nhôm/ Alluminum foil check (*) (Psi)", value: "106,4", asFound: "108.5", ref: "106,4", unc: "--", tol: "± 3,5", conf: "A", std: "LAB-PRESSURE.01" }
    ]
  },
  {
    name: "Hydrostatic Test Head",
    name_vi: "Máy thử nghiệm độ chống thấm nước của vải",
    name_en: "Hydrostatic Head Tester",
    manufacturer: "James Heal",
    next_due: "2027-06-25",
    equipment_id: "EQ-000020",
    manufacturer_id: "EQ-000020",
    model: "Titan 5",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "PRESSURE-01:2026\nPRESSURE-02:2026\nTIME-02:2026\nLINEAR-05:2026",
    ref_standard: "ISO 811\nAATCC 127",
    spec_range: "Áp suất/Pressure: (0~5000) cmH2O\nTốc độ tăng áp: Pressure Gradient: 10; 60 cmH2O\nThời gian/Time: (0~1800) s\nKích thước/ Dimension: 128 mm",
    spec_resolution: "0,1 cmH2O\n0,1 cmH2O\n1 s\n--------",
    standards_used: "[\"LAB-CALIPER.01\", \"LAB-PRESSURE.01\", \"LAB-TIMER.02\"]",
    points: [
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "100", asFound: "101,1", ref: "100", unc: "42", tol: "± 0,5", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "200", asFound: "202,0", ref: "200", unc: "42", tol: "± 1", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "300", asFound: "302,8", ref: "300", unc: "42", tol: "± 1,5", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "400", asFound: "403,0", ref: "400", unc: "42", tol: "± 2,0", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "500", asFound: "503,3", ref: "500", unc: "42", tol: "± 2,5", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "1000", asFound: "1003,9", ref: "1000", unc: "42", tol: "± 5", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "2000", asFound: "2004,1", ref: "2000", unc: "42", tol: "± 10", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "3000", asFound: "3005,0", ref: "3000", unc: "42", tol: "± 15", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "4000", asFound: "4005,0", ref: "4000", unc: "42", tol: "± 20", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Áp suất/ Pressure (M) (cmH2O)", value: "5000", asFound: "5005,0", ref: "5000", unc: "42", tol: "± 25", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Tốc độ tăng áp/ Pressure Gradient (*) (cmH2O/min)", value: "10", asFound: "10,1", ref: "10", unc: "0,1", tol: "± 0,5", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Tốc độ tăng áp/ Pressure Gradient (*) (cmH2O/min)", value: "60", asFound: "60,2", ref: "60", unc: "0,1", tol: "± 3", conf: "A", std: "LAB-PRESSURE.01" },
      { parameter: "Thời gian / Time (C) (s)", value: "600", asFound: "600", ref: "600,02", unc: "0,6", tol: "± 30", conf: "A", std: "LAB-TIMER.02" },
      { parameter: "Thời gian / Time (C) (s)", value: "1800", asFound: "1800", ref: "1800,04", unc: "0,6", tol: "± 30", conf: "A", std: "LAB-TIMER.02" },
      { parameter: "Thời gian / Time (C) (s)", value: "3600", asFound: "3600", ref: "3600,05", unc: "0,6", tol: "± 30", conf: "A", std: "LAB-TIMER.02" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòm kẹp mẫu trên/ Dome - 100 cm2", asFound: "113,78", ref: "114", unc: "0,02", tol: "± 1,3", conf: "A", std: "LAB-CALIPER.01" },
      { parameter: "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)", value: "Vòng kẹp mẫu dưới/ Clamping Ring - 100 cm2", asFound: "113,78", ref: "114", unc: "0,02", tol: "± 1,3", conf: "A", std: "LAB-CALIPER.01" }
    ]
  },
  {
    name: "Wascator",
    name_vi: "Máy giặt tiêu chuân ISO 6330 - Wascator",
    name_en: "Wascator",
    manufacturer: "Electrolux",
    next_due: "2027-06-25",
    equipment_id: "EQ-000021",
    manufacturer_id: "EQ-000021",
    model: "FOM 71CLS",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "LAB-T-02:2023\nLAB-F-01:2023\nTIME-02:2026\nV-03:2026",
    ref_standard: "ISO 6330:2021",
    spec_range: "Nhiệt độ/Temperature: (40~90) °C\nTốc độ/Speed: 52; (500 ~1100) rpm\nThời gian/Time: 3600 s\nMực nước Water Level: 35 L (225 mm)",
    spec_resolution: "0,1 °C\n1 rpm\n2 s\n--------",
    standards_used: "[\"LAB-TACHO.01\", \"LAB-THERMO.01\", \"LAB-TIME.01\", \"LAB-WATERFLOW.01\"]",
    points: [
      { parameter: "Nhiệt độ (C) / Temperature / (⁰C)", value: "40", asFound: "40,3", ref: "40", unc: "1,0", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Nhiệt độ (C) / Temperature / (⁰C)", value: "60", asFound: "59,5", ref: "60", unc: "1,0", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Nhiệt độ (C) / Temperature / (⁰C)", value: "80", asFound: "79,3", ref: "80", unc: "1,0", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Nhiệt độ (C) / Temperature / (⁰C)", value: "90", asFound: "89,3", ref: "90", unc: "1,0", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Tốc độ giặt (C) / Washing Speed / (rpm)", value: "52", asFound: "52,3", ref: "52", unc: "0,6", tol: "± 2", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Thời gian (C) / Time / (second)", value: "3600", asFound: "3600,0", ref: "3600", unc: "0,6", tol: "--", conf: "--", std: "LAB-TIME.01" },
      { parameter: "Mực nước (*) / Level Check / (mm)", value: "100", asFound: "100", ref: "100", unc: "0,5", tol: "± 5", conf: "A", std: "LAB-WATERFLOW.01" },
      { parameter: "Mực nước (*) / Level Check / (mm)", value: "130", asFound: "130", ref: "130", unc: "0,5", tol: "± 5", conf: "A", std: "LAB-WATERFLOW.01" },
      { parameter: "Mực nước (*) / Level Check / (mm)", value: "160", asFound: "161", ref: "160", unc: "0,5", tol: "± 5", conf: "A", std: "LAB-WATERFLOW.01" },
      { parameter: "Mực nước (*) / Level Check / (mm)", value: "200", asFound: "200", ref: "200", unc: "0,5", tol: "± 5", conf: "A", std: "LAB-WATERFLOW.01" },
      { parameter: "Tốc độ vắt (C) / Spin Speed / (rpm)", value: "500", asFound: "503,9", ref: "500", unc: "1,4", tol: "± 50", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ vắt (C) / Spin Speed / (rpm)", value: "775", asFound: "779,3", ref: "775", unc: "1,4", tol: "± 50", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ vắt (C) / Spin Speed / (rpm)", value: "950", asFound: "958,1", ref: "950", unc: "1,4", tol: "± 50", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ vắt (C) / Spin Speed / (rpm)", value: "1100", asFound: "1105", ref: "1100", unc: "1,4", tol: "± 50", conf: "A", std: "LAB-TACHO.01" }
    ]
  },
  {
    name: "AATCC Washing Machine",
    name_vi: "Máy giặt tiêu chuẩn AATCC",
    name_en: "AATCC Washing Machine",
    manufacturer: "Labtex",
    next_due: "2027-06-25",
    equipment_id: "EQ-000022",
    manufacturer_id: "EQ-000022",
    model: "LBT M6",
    serial_number: "TM092026",
    model_serial: "TM092026",
    procedure: "LAB-T-02:2023\nLAB-F-01:2023\nTIME-02:2026\nV-03:2026",
    ref_standard: "AATCC LP1\nAATCC TM 135",
    spec_range: "Nhiệt độ/Temperature: (40~90) °C\nTốc độ/Speed: (500~660) rpm\nThời gian/Time: 3600 s\nMực nước/ Water Level: (40~72) L",
    spec_resolution: "0,1 °C\n--------\n1 s\n--------",
    standards_used: "[\"LAB-TACHO.01\", \"LAB-THERMO.01\", \"LAB-TIME.01\", \"LAB-WATERFLOW.01\"]",
    points: [
      { parameter: "Nhiệt độ giặt / Washing Temperature (⁰C)", value: "27", asFound: "30.5", ref: "27", unc: "1,5", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Nhiệt độ giặt / Washing Temperature (⁰C)", value: "41", asFound: "41.1", ref: "41", unc: "1,5", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Nhiệt độ giặt / Washing Temperature (⁰C)", value: "49", asFound: "49.4", ref: "49", unc: "1,5", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Nhiệt độ giặt / Washing Temperature (⁰C)", value: "60", asFound: "59.4", ref: "60", unc: "1,5", tol: "± 3", conf: "A", std: "LAB-THERMO.01" },
      { parameter: "Mực nước / Water Level (L)", value: "44", asFound: "14.9", ref: "44", unc: "1", tol: "± 4", conf: "A", std: "LAB-WATERFLOW.01" },
      { parameter: "Mực nước / Water Level (L)", value: "72", asFound: "19.2", ref: "72", unc: "1", tol: "± 4", conf: "A", std: "LAB-WATERFLOW.01" },
      { parameter: "Tốc độ giặt / Agitation Speed (spm)", value: "Normal", asFound: "86", ref: "86", unc: "0.3", tol: "± 2", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ giặt / Agitation Speed (spm)", value: "Permanent Press", asFound: "86", ref: "86", unc: "0.3", tol: "± 2", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ giặt / Agitation Speed (spm)", value: "Delicates", asFound: "27", ref: "27", unc: "0.3", tol: "± 2", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Thời gian / Time (min)", value: "Normal - Main wash", asFound: "16.0", ref: "16", unc: "5", tol: "± 1", conf: "A", std: "LAB-TIME.01" },
      { parameter: "Thời gian / Time (min)", value: "Normal - Spin time", asFound: "5.0", ref: "7.5", unc: "5", tol: "± 1", conf: "A", std: "LAB-TIME.01" },
      { parameter: "Thời gian / Time (min)", value: "Permanent Press - Main wash", asFound: "12.0", ref: "12", unc: "5", tol: "± 1", conf: "A", std: "LAB-TIME.01" },
      { parameter: "Thời gian / Time (min)", value: "Permanent Press - Spin time", asFound: "5.0", ref: "7.5", unc: "5", tol: "± 1", conf: "A", std: "LAB-TIME.01" },
      { parameter: "Thời gian / Time (min)", value: "Delicates - Main wash", asFound: "8.5", ref: "8.5", unc: "5", tol: "± 1", conf: "A", std: "LAB-TIME.01" },
      { parameter: "Thời gian / Time (min)", value: "Delicates - Spin time", asFound: "5.0", ref: "7.5", unc: "5", tol: "± 1", conf: "A", std: "LAB-TIME.01" },
      { parameter: "Tốc độ vắt / Final Spin Speed (rpm)", value: "Normal", asFound: "651.2", ref: "660", unc: "2", tol: "± 15", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ vắt / Final Spin Speed (rpm)", value: "Permanent Press", asFound: "490.7", ref: "500", unc: "2", tol: "± 15", conf: "A", std: "LAB-TACHO.01" },
      { parameter: "Tốc độ vắt / Final Spin Speed (rpm)", value: "Delicates", asFound: "490.7", ref: "500", unc: "2", tol: "± 15", conf: "A", std: "LAB-TACHO.01" }
    ]
  }
];

async function main() {
  try {
    console.log("🚀 Starting upsert for 7 new equipment templates...");

    await sql.begin(async (tx) => {
      for (const t of newTemplates) {
        console.log(`📥 Upserting template: "${t.name}" ("${t.name_vi}")...`);
        
        await tx`
          INSERT INTO EQUIPMENT_TEMPLATES (
            NAME, MANUFACTURER, NEXT_DUE, EQUIPMENT_ID, PROCEDURE, REF_STANDARD, 
            MODEL, SERIAL_NUMBER, MODEL_SERIAL, MANUFACTURER_ID, SPEC_RANGE, 
            SPEC_RESOLUTION, STANDARDS_USED, NAME_VI, NAME_EN
          )
          VALUES (
            ${t.name}, ${t.manufacturer}, ${t.next_due}, ${t.equipment_id}, ${t.procedure}, ${t.ref_standard}, 
            ${t.model}, ${t.serial_number}, ${t.model_serial}, ${t.manufacturer_id}, ${t.spec_range}, 
            ${t.spec_resolution}, ${t.standards_used}, ${t.name_vi}, ${t.name_en}
          )
          ON CONFLICT (NAME) DO UPDATE SET
            MANUFACTURER = EXCLUDED.MANUFACTURER,
            NEXT_DUE = EXCLUDED.NEXT_DUE,
            EQUIPMENT_ID = EXCLUDED.EQUIPMENT_ID,
            PROCEDURE = EXCLUDED.PROCEDURE,
            REF_STANDARD = EXCLUDED.REF_STANDARD,
            MODEL = EXCLUDED.MODEL,
            SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER,
            MODEL_SERIAL = EXCLUDED.MODEL_SERIAL,
            MANUFACTURER_ID = EXCLUDED.MANUFACTURER_ID,
            SPEC_RANGE = EXCLUDED.SPEC_RANGE,
            SPEC_RESOLUTION = EXCLUDED.SPEC_RESOLUTION,
            STANDARDS_USED = EXCLUDED.STANDARDS_USED,
            NAME_VI = EXCLUDED.NAME_VI,
            NAME_EN = EXCLUDED.NAME_EN
        `;

        // Clear existing points for this specific template and insert fresh ones
        await tx`DELETE FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ${t.name}`;

        for (const p of t.points) {
          await tx`
            INSERT INTO TEMPLATE_POINTS (TEMPLATE_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, REFERENCE_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, STANDARD_EQUIPMENT)
            VALUES (${t.name}, ${p.parameter}, ${p.value}, ${p.asFound}, ${p.ref}, ${p.unc}, ${p.tol}, ${p.conf}, ${p.std})
          `;
        }
        console.log(`   ✅ Inserted ${t.points.length} points for "${t.name}"`);
      }
    });

    console.log("🎉 All 7 equipment templates upserted successfully!");
  } catch (err) {
    console.error("❌ Upsert failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
