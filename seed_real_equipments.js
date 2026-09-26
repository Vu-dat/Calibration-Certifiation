/**
 * seed_real_equipments.js
 * 
 * Master equipment templates (21 templates) seeded into Supabase PostgreSQL,
 * including all metadata columns and calibration template points.
 * 
 * Run with: node seed_real_equipments.js
 */
require('dotenv').config({ override: true });
const sql = require('./db');

const templates = [
  {
    "name": "Crocking meter",
    "name_vi": "Máy thử bền màu ma sát",
    "name_en": "Crocking meter",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000002",
    "procedure": "FORCE-02:2026\nLINEAR-08:2026\nLINEAR-05:2026",
    "ref_standard": "AATCC TM 8, 165\nISO 105:X12, D02",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000002",
    "spec_range": "Lực tỳ/Downward force: 9 N\nHành trình/Stroke: 104 mm\nĐường kính đầu ma sát / Finger Diameter: 16 mm",
    "spec_resolution": "--------\n--------\n--------",
    "standards_used": "[]",
    "points": []
  },
  {
    "name": "Auto Crocking Meter",
    "name_vi": "Máy thử bền màu ma sát",
    "name_en": "Crocking meter",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000003",
    "procedure": "FORCE-02:2026\nLINEAR-08:2026\nLINEAR-05:2026\nLAB-F01:2023",
    "ref_standard": "AATCC TM 8, 165\nISO 105:X12, D02",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000003",
    "spec_range": "Lực tỳ/Downward force: 9 N\nHành trình/Stroke: 104 mm\nĐường kính đầu ma sát / Finger Diameter: 16 mm\nTốc độ/Speed: 60 rpm",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[]",
    "points": [
      {
        "parameter": "Lực tỳ lên mẫu (M) Downward Force (N)",
        "value": "BEGIN",
        "asFound": "8,92",
        "ref": "9",
        "unc": "0,05",
        "tol": "± 0,2",
        "conf": "A",
        "std": ""
      },
      {
        "parameter": "Lực tỳ lên mẫu (M) Downward Force (N)",
        "value": "MIDDLE",
        "asFound": "8,93",
        "ref": "9",
        "unc": "0,05",
        "tol": "± 0,2",
        "conf": "A",
        "std": ""
      },
      {
        "parameter": "Lực tỳ lên mẫu (M) Downward Force (N)",
        "value": "END",
        "asFound": "8,94",
        "ref": "9",
        "unc": "0,05",
        "tol": "± 0,2",
        "conf": "A",
        "std": ""
      },
      {
        "parameter": "Hành trình ma sát (M) Stroke length (mm)",
        "value": "",
        "asFound": "102,8",
        "ref": "104",
        "unc": "0,08",
        "tol": "± 3",
        "conf": "A",
        "std": ""
      },
      {
        "parameter": "Đường kính đầu ma sát (M) Finger diameter (mm)",
        "value": "",
        "asFound": "16,02",
        "ref": "16",
        "unc": "0,02",
        "tol": "± 0,1",
        "conf": "A",
        "std": ""
      },
      {
        "parameter": "Tốc độ (C) Speed (rpm)",
        "value": "",
        "asFound": "60,5",
        "ref": "60",
        "unc": "0,5",
        "tol": "± 1",
        "conf": "A",
        "std": ""
      },
      {
        "parameter": "Bộ đếm (*) Counter",
        "value": "",
        "asFound": "10",
        "ref": "10",
        "unc": "--",
        "tol": "--",
        "conf": "--",
        "std": ""
      }
    ]
  },
  {
    "name": "Veslic Rubbing Tester",
    "name_vi": "Máy đo độ bền chà xát Veslic",
    "name_en": "Veslic Rub Fastness Tester",
    "manufacturer": "Gester",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000004",
    "procedure": "LAB-M-01:2023\nLINEAR-08:2026\nLAB-F01:2023",
    "ref_standard": "ISO 11640\nSATRA PM 173",
    "model": "GT-KC01-1",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000004",
    "spec_range": "Tải trọng/Downward force: 1000 g\nHành trình/Stroke: 40 mm\nTốc độ/Speed: 40 cpm",
    "spec_resolution": "--------\n--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\", \"LAB-F01:2023\", \"LAB-M-01:2023\", \"LAB-TACHO.01\"]",
    "points": [
      {
        "parameter": "Tải trọng (C) Downward Force (g)",
        "value": "Quả tải Weight",
        "asFound": "502.4",
        "ref": "500",
        "unc": "0.43",
        "tol": "±10",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng (C) Downward Force (g)",
        "value": "Thanh gắng mẫu Rubbing finger",
        "asFound": "498.9",
        "ref": "500",
        "unc": "0.43",
        "tol": "±10",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng (C) Downward Force (g)",
        "value": "Tổng cộng Total",
        "asFound": "1001.3",
        "ref": "1000",
        "unc": "0.43",
        "tol": "±20",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Hành trình ma sát (M) Stroke length (mm)",
        "value": "",
        "asFound": "36.65",
        "ref": "35 - 40",
        "unc": "0.2",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Tốc độ (C) Speed (rpm)",
        "value": "",
        "asFound": "39.3",
        "ref": "40",
        "unc": "0.6",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Bộ đếm (*) Counter",
        "value": "",
        "asFound": "10",
        "ref": "10",
        "unc": "--",
        "tol": "--",
        "conf": "--",
        "std": "LAB-BALANCE.01"
      }
    ]
  },
  {
    "name": "JIS Rubbing Tester",
    "name_vi": "Máy thử bền màu ma sát",
    "name_en": "Crocking meter",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000005",
    "procedure": "LAB-M-01:2023\nLINEAR-08:2026\nLINEAR-05:2026\nLAB-F-01:2023",
    "ref_standard": "JIS L0849 Type II\nJIS L0823",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000005",
    "spec_range": "Tải trọng/weight: 500 g\nHành trình/Stroke: 120 mm\nKích thước đầu ma sát Finger Dimension: 20 mm\nTốc độ/Speed: 30 cpm",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\", \"LAB-F-01:2023\", \"LAB-M-01:2023\", \"LAB-TACHO.01\"]",
    "points": [
      {
        "parameter": "Tốc độ (C) Speed (rpm)",
        "value": "",
        "asFound": "60,5",
        "ref": "30",
        "unc": "0,5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Hành trình ma sát (M) Stroke length (mm)",
        "value": "",
        "asFound": "102,8",
        "ref": "120",
        "unc": "0,02",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Bán kính bàn giữ mẫu(*) Specimen stage surface Radius (mm)",
        "value": "",
        "asFound": "200",
        "ref": "200",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng của búa chà sát(C) Friction hammer load (g)",
        "value": "1",
        "asFound": "",
        "ref": "200",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng của búa chà sát(C) Friction hammer load (g)",
        "value": "2",
        "asFound": "",
        "ref": "200",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng của búa chà sát(C) Friction hammer load (g)",
        "value": "3",
        "asFound": "",
        "ref": "200",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng của búa chà sát(C) Friction hammer load (g)",
        "value": "4",
        "asFound": "",
        "ref": "200",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng của búa chà sát(C) Friction hammer load (g)",
        "value": "5",
        "asFound": "",
        "ref": "200",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng của búa chà sát(C) Friction hammer load (g)",
        "value": "6",
        "asFound": "",
        "ref": "200",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng phụ(C) Auxiliary load (g)",
        "value": "1",
        "asFound": "",
        "ref": "300",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng phụ(C) Auxiliary load (g)",
        "value": "2",
        "asFound": "",
        "ref": "300",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng phụ(C) Auxiliary load (g)",
        "value": "3",
        "asFound": "",
        "ref": "300",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng phụ(C) Auxiliary load (g)",
        "value": "4",
        "asFound": "",
        "ref": "300",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng phụ(C) Auxiliary load (g)",
        "value": "5",
        "asFound": "",
        "ref": "300",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng phụ(C) Auxiliary load (g)",
        "value": "6",
        "asFound": "",
        "ref": "300",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      }
    ]
  },
  {
    "name": "ICI Pilling and Snagging Tester",
    "name_vi": "Thiết bị thử nghiệm xù lồng và xước móc",
    "name_en": "ICI Pilling and Snagging Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000006",
    "procedure": "LAB-F01:2023",
    "ref_standard": "ISO 12945-1",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000006",
    "spec_range": "Tốc độ/Speed: 60 rpm",
    "spec_resolution": "--------",
    "standards_used": "[\"LAB-F01:2023\", \"LAB-TACHO.01\"]",
    "points": [
      {
        "parameter": "Tốc độ (C) Speed (rpm)",
        "value": "",
        "asFound": "30.1",
        "ref": "30",
        "unc": "0.8",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ (C) Speed (rpm)",
        "value": "",
        "asFound": "60.8",
        "ref": "60",
        "unc": "0.8",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Bộ đếm (*) Counter",
        "value": "",
        "asFound": "100",
        "ref": "100",
        "unc": "--",
        "tol": "--",
        "conf": "--",
        "std": "LAB-F01:2023"
      }
    ]
  },
  {
    "name": "Rotary Crocking Meter",
    "name_vi": "Máy thử bền màu ma sát xoay tròn",
    "name_en": "Rotary crocking meter",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000007",
    "procedure": "FORCE-02:2026\nLINEAR-05:2026",
    "ref_standard": "AATCC 116\nISO 105:X16",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000007",
    "spec_range": "Lực tỳ/Downward force: 11.1 N\nĐường kính đầu ma sát / Finger Diameter: 16 mm",
    "spec_resolution": "--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\"]",
    "points": [
      {
        "parameter": "Lực tỳ lên mẫu (M) Downward Force (N)",
        "value": "",
        "asFound": "11,12",
        "ref": "11,1",
        "unc": "0,05",
        "tol": "± 1,11",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Đường kính đầu ma sát (M) Finger diameter (mm)",
        "value": "",
        "asFound": "16,02",
        "ref": "16",
        "unc": "s0,02",
        "tol": "± 0,1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Random Tumble Pilling Tester - 2",
    "name_vi": "Thiết bị thử nghiệm xù lông ASTM D3512",
    "name_en": "Random Tumble Pilling Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000008",
    "procedure": "LAB-F01:2023\nLINEAR-05:2026\nPRESSURE-01:2026\nTIME-02:2026",
    "ref_standard": "ASTM D3512",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000008",
    "spec_range": "Tốc độ/Speed: 1200 rpm\nChiều dài buồng/Chamber length: 151 mm\nÁp suất khí/Air pressure: 3 Psi\nBộ cài thời gian/Timer: 30 min",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[\"LAB-CALIPER.01\", \"LAB-F01:2023\", \"LAB-PRESSURE.01\", \"LAB-TACHO.01\", \"LAB-TIME-01\"]",
    "points": [
      {
        "parameter": "Tốc độ quay Spin speed of roller (rpm)",
        "value": "Chamber 1",
        "asFound": "1201",
        "ref": "1200",
        "unc": "1,5",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ quay Spin speed of roller (rpm)",
        "value": "Chamber 2",
        "asFound": "1201",
        "ref": "1200",
        "unc": "1,5",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Đường kính buồng thử nghiệm Diameter of Test room (mm)",
        "value": "Chamber 1",
        "asFound": "145,51",
        "ref": "145",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính buồng thử nghiệm Diameter of Test room (mm)",
        "value": "Chamber 2",
        "asFound": "145,96",
        "ref": "145",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Độ sâu buồng thử nghiệm Depth of Test room (mm)",
        "value": "Chamber 1",
        "asFound": "152,14",
        "ref": "152",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Độ sâu buồng thử nghiệm Depth of Test room (mm)",
        "value": "Chamber 2",
        "asFound": "151,64",
        "ref": "152",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Bộ đếm thời gian Timer (min)",
        "value": "",
        "asFound": "30,0",
        "ref": "30",
        "unc": "0,01",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-TIME-01"
      },
      {
        "parameter": "Áp suất khí nén Air pressure  (Psi)",
        "value": "",
        "asFound": "2",
        "ref": "2,00",
        "unc": "1,0",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất khí nén Air pressure  (Psi)",
        "value": "",
        "asFound": "3",
        "ref": "3,00",
        "unc": "1,0",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      }
    ]
  },
  {
    "name": "Snagging box",
    "name_vi": "Hộp thử nghiệm xù lông",
    "name_en": "ICI Pilling Box",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000009",
    "procedure": "LINEAR-05:2026",
    "ref_standard": "ISO 12945-1",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000009",
    "spec_range": "Kích thước hộp/Box size: 235 mm",
    "spec_resolution": "--------",
    "standards_used": "[\"LAB-CALIPER.01\"]",
    "points": [
      {
        "parameter": "Kích thước hộp (M) Box size  (mm)",
        "value": "Rộng (W)",
        "asFound": "235.2",
        "ref": "235",
        "unc": "0.02",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Kích thước hộp (M) Box size  (mm)",
        "value": "Sâu (D)",
        "asFound": "235.3",
        "ref": "235",
        "unc": "0.02",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Kích thước hộp (M) Box size  (mm)",
        "value": "Cao (H)",
        "asFound": "235.3",
        "ref": "235",
        "unc": "0.02",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao đinh (*) Snagging pin height (mm)",
        "value": "1",
        "asFound": "",
        "ref": "10",
        "unc": "0.02",
        "tol": "± 0.2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao đinh (*) Snagging pin height (mm)",
        "value": "2",
        "asFound": "",
        "ref": "10",
        "unc": "0.02",
        "tol": "± 0.2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao đinh (*) Snagging pin height (mm)",
        "value": "3",
        "asFound": "",
        "ref": "10",
        "unc": "0.02",
        "tol": "± 0.2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao đinh (*) Snagging pin height (mm)",
        "value": "4",
        "asFound": "",
        "ref": "10",
        "unc": "0.02",
        "tol": "± 0.2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao đinh (*) Snagging pin height (mm)",
        "value": "5",
        "asFound": "",
        "ref": "10",
        "unc": "0.02",
        "tol": "± 0.2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao đinh (*) Snagging pin height (mm)",
        "value": "6",
        "asFound": "",
        "ref": "10",
        "unc": "0.02",
        "tol": "± 0.2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Random Tumble Pilling Tester - 4",
    "name_vi": "Thiết bị thử nghiệm xù lông ASTM D3512",
    "name_en": "Random Tumble Pilling Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000010",
    "procedure": "LAB-F01:2023\nLINEAR-05:2026\nPRESSURE-01:2026\nTIME-02:2026",
    "ref_standard": "ASTM D3512",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000010",
    "spec_range": "Tốc độ/Speed: 1200 rpm\nChiều dài buồng/Chamber length: 151 mm\nÁp suất khí/Air pressure: 3 Psi\nBộ cài thời gian/Timer: 30 min",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[\"LAB-CALIPER.01\", \"LAB-F01:2023\", \"LAB-PRESSURE.01\", \"LAB-TACHO.01\", \"LAB-TIME-01\"]",
    "points": [
      {
        "parameter": "Tốc độ quay Spin speed of roller (rpm)",
        "value": "Chamber 1",
        "asFound": "1201",
        "ref": "1200",
        "unc": "1,5",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ quay Spin speed of roller (rpm)",
        "value": "Chamber 2",
        "asFound": "1201",
        "ref": "1200",
        "unc": "1,5",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ quay Spin speed of roller (rpm)",
        "value": "Chamber 3",
        "asFound": "1201",
        "ref": "1200",
        "unc": "1,5",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ quay Spin speed of roller (rpm)",
        "value": "Chamber 4",
        "asFound": "1201",
        "ref": "1200",
        "unc": "1,5",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Đường kính buồng thử nghiệm Diameter of Test room (mm)",
        "value": "Chamber 1",
        "asFound": "145,51",
        "ref": "145",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính buồng thử nghiệm Diameter of Test room (mm)",
        "value": "Chamber 2",
        "asFound": "145,96",
        "ref": "145",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính buồng thử nghiệm Diameter of Test room (mm)",
        "value": "Chamber 3",
        "asFound": "145,74",
        "ref": "145",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính buồng thử nghiệm Diameter of Test room (mm)",
        "value": "Chamber 4",
        "asFound": "145,94",
        "ref": "145",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Độ sâu buồng thử nghiệm Depth of Test room (mm)",
        "value": "Chamber 1",
        "asFound": "152,14",
        "ref": "152",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Độ sâu buồng thử nghiệm Depth of Test room (mm)",
        "value": "Chamber 2",
        "asFound": "151,64",
        "ref": "152",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Độ sâu buồng thử nghiệm Depth of Test room (mm)",
        "value": "Chamber 3",
        "asFound": "151,75",
        "ref": "152",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Độ sâu buồng thử nghiệm Depth of Test room (mm)",
        "value": "Chamber 4",
        "asFound": "151,88",
        "ref": "152",
        "unc": "0,02",
        "tol": "--",
        "conf": "D",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Bộ đếm thời gian Timer (min)",
        "value": "",
        "asFound": "30,0",
        "ref": "30",
        "unc": "0,01",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-TIME-01"
      },
      {
        "parameter": "Áp suất khí nén Air pressure  (Psi)",
        "value": "",
        "asFound": "2",
        "ref": "2,00",
        "unc": "1,0",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất khí nén Air pressure  (Psi)",
        "value": "",
        "asFound": "3",
        "ref": "3,00",
        "unc": "1,0",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      }
    ]
  },
  {
    "name": "Tensile Strength Tester",
    "name_vi": "Thiết bị thử độ bền kéo đứt",
    "name_en": "Tensile Strength Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000011",
    "procedure": "FORCE-01:2026\nLINEAR-07:2026\nSPEED-01:2026",
    "ref_standard": "ISO 7500-1",
    "model": "Titan 5",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000011",
    "spec_range": "Lực kéo/Force: 5000 N\nHành trình/Stroke: 500 mm\nTốc độ kéo/Tensile Speed: 500 mm/s",
    "spec_resolution": "0,01 N\n0,01 mm\n0,1 mm/s",
    "standards_used": "[\"LAB-FORCE.01\", \"LAB-LINEAR.01\", \"LAB-TIMER.01\"]",
    "points": [
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "100.3",
        "ref": "100",
        "unc": "0.4 %",
        "tol": "± 1 %",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "200.4",
        "ref": "200",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "300.8",
        "ref": "300",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "401.4",
        "ref": "400",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "502.1",
        "ref": "500",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "602.6",
        "ref": "600",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "704.3",
        "ref": "700",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "804.8",
        "ref": "800",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Kiểm tra lực kéo Pull force (N) Loadcell: (thông số này người làm nhập vào) S/N: (thông số này người làm nhập vào)",
        "value": "",
        "asFound": "905.2",
        "ref": "900",
        "unc": "0.4 %",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Tốc độ hành trình Crosshead speed (mm/min)",
        "value": "",
        "asFound": "50.1",
        "ref": "50",
        "unc": "0,8",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Tốc độ hành trình Crosshead speed (mm/min)",
        "value": "",
        "asFound": "300.2",
        "ref": "300",
        "unc": "0,8",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Tốc độ hành trình Crosshead speed (mm/min)",
        "value": "",
        "asFound": "500.2",
        "ref": "500",
        "unc": "0,8",
        "tol": "± 1%",
        "conf": "A",
        "std": "LAB-FORCE.01"
      },
      {
        "parameter": "Hành trình di chuyển Crosshead  Displacement  (mm)",
        "value": "",
        "asFound": "50.053",
        "ref": "50",
        "unc": "0.1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-LINEAR.01"
      },
      {
        "parameter": "Hành trình di chuyển Crosshead  Displacement  (mm)",
        "value": "",
        "asFound": "100.065",
        "ref": "100",
        "unc": "0.1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-LINEAR.01"
      },
      {
        "parameter": "Hành trình di chuyển Crosshead  Displacement  (mm)",
        "value": "",
        "asFound": "200.078",
        "ref": "200",
        "unc": "0.1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-LINEAR.01"
      },
      {
        "parameter": "Hành trình di chuyển Crosshead  Displacement  (mm)",
        "value": "",
        "asFound": "300.122",
        "ref": "300",
        "unc": "0.1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-LINEAR.01"
      },
      {
        "parameter": "Hành trình di chuyển Crosshead  Displacement  (mm)",
        "value": "",
        "asFound": "500.257",
        "ref": "500",
        "unc": "0.1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-LINEAR.01"
      }
    ]
  },
  {
    "name": "Martindale - 3",
    "name_vi": "Martindale",
    "name_en": "Martindale",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000012",
    "procedure": "FORCE-02:2026\nLINEAR-05:2026\nLINEAR-05:2026\nLAB-F01:2023",
    "ref_standard": "ISO 12947-1\nISO 12945-2",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000012",
    "spec_range": "Tải trọng/Weight: (150~2500) g\nHành trình ma sát/Stroke: (24~121) mm\nĐường kính đĩa ma sát/Friction diameter: 127 mm\nTốc độ/Speed: 47.5 rpm",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\", \"LAB-TACHO.01\"]",
    "points": [
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Left",
        "asFound": "46.5",
        "ref": "47.5",
        "unc": "0.3",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Middle",
        "asFound": "44.2",
        "ref": "44.5",
        "unc": "0.3",
        "tol": "± 2.4",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Right",
        "asFound": "46.7",
        "ref": "47.5",
        "unc": "0.3",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "60.51 x 60.53",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "60.53 x 60.63",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "60.61 x 60.60",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "24.01 x 24.02",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "24.04 x 24.05",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "24.05 x 24.04",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Khối lượng/ Mass (g)",
        "value": "",
        "asFound": "2502.7",
        "ref": "2500",
        "unc": "0.3",
        "tol": "± 500",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Đường kính/ Diameter (mm)",
        "value": "",
        "asFound": "119.96",
        "ref": "120",
        "unc": "0.05",
        "tol": "± 10",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "795.5",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "794.3",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "794.7",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "596.0",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "592.9",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "596.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "155.4",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "155.6",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "259.6",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "259.8",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "121.03",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "127.37",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "127.25",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "127.32",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "1.03",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "1.04",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "1.04",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Martindale - 6",
    "name_vi": "Martindale",
    "name_en": "Martindale",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000013",
    "procedure": "FORCE-02:2026\nLINEAR-05:2026\nLINEAR-05:2026\nLAB-F01:2023",
    "ref_standard": "ISO 12947-1\nISO 12945-2",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000013",
    "spec_range": "Tải trọng/Weight: (150~2500) g\nHành trình ma sát/Stroke: (24~121) mm\nĐường kính đĩa ma sát/Friction diameter: 127 mm\nTốc độ/Speed: 47.5 rpm",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\", \"LAB-TACHO.01\"]",
    "points": [
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Left",
        "asFound": "46.5",
        "ref": "47.5",
        "unc": "0.3",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Middle",
        "asFound": "44.2",
        "ref": "44.5",
        "unc": "0.3",
        "tol": "± 2.4",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Right",
        "asFound": "46.7",
        "ref": "47.5",
        "unc": "0.3",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "60.51 x 60.53",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "60.53 x 60.63",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "60.61 x 60.60",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "60.62 x 60.65",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "60.51 x 60.53",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "60.53 x 60.63",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "24.01 x 24.02",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "24.04 x 24.05",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "24.05 x 24.04",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "24.08 x 24.06",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "24.01 x 24.02",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "24.04 x 24.05",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Khối lượng/ Mass (g)",
        "value": "",
        "asFound": "2502.7",
        "ref": "2500",
        "unc": "0.3",
        "tol": "± 500",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Đường kính/ Diameter (mm)",
        "value": "",
        "asFound": "119.96",
        "ref": "120",
        "unc": "0.05",
        "tol": "± 10",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "795.5",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "794.3",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "794.7",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "795.0",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "795.5",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "794.3",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "596.0",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "592.9",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "596.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "595.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "596.0",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "592.9",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "155.4",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "155.6",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "155.4",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "259.6",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "259.8",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "259.6",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "259.8",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "121.03",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "127.37",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "127.25",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "127.32",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "127.15",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "127.37",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "127.25",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "1.03",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "1.04",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "1.04",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "1.03",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "1.02",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "1.05",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Martindale - 9",
    "name_vi": "Martindale",
    "name_en": "Martindale",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000014",
    "procedure": "FORCE-02:2026\nLINEAR-05:2026\nLINEAR-05:2026\nLAB-F01:2023",
    "ref_standard": "ISO 12947-1\nISO 12945-2",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000014",
    "spec_range": "Tải trọng/Weight: (150~2500) g\nHành trình ma sát/Stroke: (24~121) mm\nĐường kính đĩa ma sát/Friction diameter: 127 mm\nTốc độ/Speed: 47.5 rpm",
    "spec_resolution": "--------\n--------\n--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\", \"LAB-TACHO.01\"]",
    "points": [
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Left",
        "asFound": "46.5",
        "ref": "47.5",
        "unc": "0.3",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Middle",
        "asFound": "44.2",
        "ref": "44.5",
        "unc": "0.3",
        "tol": "± 2.4",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vòng quay / Rotation Speed (rpm)",
        "value": "Right",
        "asFound": "46.7",
        "ref": "47.5",
        "unc": "0.3",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "60.51 x 60.53",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "60.53 x 60.63",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "60.61 x 60.60",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "60.62 x 60.65",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "60.51 x 60.53",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "60.53 x 60.63",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "60.61 x 60.60",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "60.62 x 60.65",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "60.62 x 60.65",
        "ref": "60.5 x 60.5",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "24.01 x 24.02",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "24.04 x 24.05",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "24.05 x 24.04",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "24.08 x 24.06",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "24.01 x 24.02",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "24.04 x 24.05",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "24.05 x 24.04",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "24.08 x 24.06",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "24.08 x 24.06",
        "ref": "24 x 24",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Khối lượng/ Mass (g)",
        "value": "",
        "asFound": "2502.7",
        "ref": "2500",
        "unc": "0.3",
        "tol": "± 500",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Đường kính/ Diameter (mm)",
        "value": "",
        "asFound": "119.96",
        "ref": "120",
        "unc": "0.05",
        "tol": "± 10",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "795.5",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "794.3",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "794.7",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "795.0",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "795.5",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "794.3",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "7",
        "asFound": "794.7",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "8",
        "asFound": "795.0",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "9",
        "asFound": "795.0",
        "ref": "795",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "596.0",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "592.9",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "596.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "595.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "596.0",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "592.9",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "7",
        "asFound": "596.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "8",
        "asFound": "595.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "9",
        "asFound": "595.5",
        "ref": "595",
        "unc": "0.3",
        "tol": "± 7",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "155.4",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "155.6",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "155.4",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "7",
        "asFound": "155.6",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "8",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "9",
        "asFound": "155.2",
        "ref": "155",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "1",
        "asFound": "259.6",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "2",
        "asFound": "259.8",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "3",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "4",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "5",
        "asFound": "259.6",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "6",
        "asFound": "259.8",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "7",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "8",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng / Load (g)",
        "value": "9",
        "asFound": "260.1",
        "ref": "260",
        "unc": "0.3",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "121.03",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "121.03",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "121.10",
        "ref": "121",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "127.37",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "127.25",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "127.32",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "127.15",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "127.37",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "127.25",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "127.32",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "127.15",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "127.15",
        "ref": "127",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "1.03",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "1.04",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "1.04",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "1.03",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "1.02",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "1.05",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "1.06",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "1.06",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "1.03",
        "ref": "1.05",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "1",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "2",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "3",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "4",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "5",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "6",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "7",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "8",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Hành trình ma sát (Lissajous) / Stroke length (mm)",
        "value": "9",
        "asFound": "0,04",
        "ref": "≤ 0,05",
        "unc": "0.05",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "BS 8479 Snagging Test Box",
    "name_vi": "Hộp thử nghiệm xước móc BS 8479",
    "name_en": "BS 8479 Snagging Test Box",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000015",
    "procedure": "LINEAR-05:2026\nANGLE-01:2026",
    "ref_standard": "BS 8479",
    "model": "CROCKMASTER HD",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000015",
    "spec_range": "Kích thước hộp/Box size: 228 mm\nGóc nghiêng/Tilt angle: 60 °",
    "spec_resolution": "--------\n--------",
    "standards_used": "[\"LAB-ANGLE.01\", \"LAB-CALIPER.01\"]",
    "points": [
      {
        "parameter": "Khoảng cách hai mặt song song (M) Diameter between opposite parallel faces  (mm)",
        "value": "1-4",
        "asFound": "",
        "ref": "224.5",
        "unc": "0.02",
        "tol": "± 0.3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Khoảng cách hai mặt song song (M) Diameter between opposite parallel faces  (mm)",
        "value": "2-5",
        "asFound": "",
        "ref": "224.5",
        "unc": "0.02",
        "tol": "± 0.3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Khoảng cách hai mặt song song (M) Diameter between opposite parallel faces  (mm)",
        "value": "3-6",
        "asFound": "",
        "ref": "224.5",
        "unc": "0.02",
        "tol": "± 0.3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều sâu của hộp (M) Depth of snagging box (mm)",
        "value": "",
        "asFound": "",
        "ref": "228",
        "unc": "0.02",
        "tol": "± 0.3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Góc nghiêng của đinh (M) Inclined Angle of pins (⁰)",
        "value": "Pin bar 1",
        "asFound": "60.2",
        "ref": "60",
        "unc": "0.2",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Góc nghiêng của đinh (M) Inclined Angle of pins (⁰)",
        "value": "Pin bar 2",
        "asFound": "60.2",
        "ref": "60",
        "unc": "0.2",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Góc nghiêng của đinh (M) Inclined Angle of pins (⁰)",
        "value": "Pin bar 3",
        "asFound": "60.2",
        "ref": "60",
        "unc": "0.2",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Góc nghiêng của đinh (M) Inclined Angle of pins (⁰)",
        "value": "Pin bar 4",
        "asFound": "60.2",
        "ref": "60",
        "unc": "0.2",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Góc nghiêng của đinh (M) Inclined Angle of pins (⁰)",
        "value": "Pin bar 5",
        "asFound": "60.2",
        "ref": "60",
        "unc": "0.2",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Góc nghiêng của đinh (M) Inclined Angle of pins (⁰)",
        "value": "Pin bar 6",
        "asFound": "60.2",
        "ref": "60",
        "unc": "0.2",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Chiều cao của đầu đinh (M) Point end of pins (mm)",
        "value": "Pin bar 1",
        "asFound": "1.51",
        "ref": "1.5",
        "unc": "0.02",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao của đầu đinh (M) Point end of pins (mm)",
        "value": "Pin bar 2",
        "asFound": "1.51",
        "ref": "1.5",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao của đầu đinh (M) Point end of pins (mm)",
        "value": "Pin bar 3",
        "asFound": "1.51",
        "ref": "1.5",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao của đầu đinh (M) Point end of pins (mm)",
        "value": "Pin bar 4",
        "asFound": "1.51",
        "ref": "1.5",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao của đầu đinh (M) Point end of pins (mm)",
        "value": "Pin bar 5",
        "asFound": "1.51",
        "ref": "1.5",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều cao của đầu đinh (M) Point end of pins (mm)",
        "value": "Pin bar 6",
        "asFound": "1.51",
        "ref": "1.5",
        "unc": "0.05",
        "tol": "± 0.1",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Khoảng cách giữa các đinh (M) Space between pins (mm)",
        "value": "Pin bar 1",
        "asFound": "10.02",
        "ref": "10",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Khoảng cách giữa các đinh (M) Space between pins (mm)",
        "value": "Pin bar 2",
        "asFound": "10.02",
        "ref": "10",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Khoảng cách giữa các đinh (M) Space between pins (mm)",
        "value": "Pin bar 3",
        "asFound": "10.02",
        "ref": "10",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Khoảng cách giữa các đinh (M) Space between pins (mm)",
        "value": "Pin bar 4",
        "asFound": "10.02",
        "ref": "10",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Khoảng cách giữa các đinh (M) Space between pins (mm)",
        "value": "Pin bar 5",
        "asFound": "10.02",
        "ref": "10",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Khoảng cách giữa các đinh (M) Space between pins (mm)",
        "value": "Pin bar 6",
        "asFound": "10.02",
        "ref": "10",
        "unc": "0.05",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Số đinh trên mỗi thanh Number of pins on pin bar",
        "value": "Pin bar 1",
        "asFound": "20",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 1.0",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Số đinh trên mỗi thanh Number of pins on pin bar",
        "value": "Pin bar 2",
        "asFound": "20",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 1.0",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Số đinh trên mỗi thanh Number of pins on pin bar",
        "value": "Pin bar 3",
        "asFound": "20",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 1.0",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Số đinh trên mỗi thanh Number of pins on pin bar",
        "value": "Pin bar 4",
        "asFound": "20",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 1.0",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Số đinh trên mỗi thanh Number of pins on pin bar",
        "value": "Pin bar 5",
        "asFound": "20",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 1.0",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      },
      {
        "parameter": "Số đinh trên mỗi thanh Number of pins on pin bar",
        "value": "Pin bar 6",
        "asFound": "20",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 1.0",
        "conf": "A",
        "std": "LAB-ANGLE.01"
      }
    ]
  },
  {
    "name": "Tearing Tester",
    "name_vi": "Thiết bị thử độ bền xé rách",
    "name_en": "Tearing Strength Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000016",
    "procedure": "LAB-M-01:2023\nLINEAR-05:2026",
    "ref_standard": "ISO 13937\nASTM D1424",
    "model": "Titan 5",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000016",
    "spec_range": "Khối lượng tải trọng/ Load: (150~3000) g\nKích thước/ Dimension: (2~35) mm",
    "spec_resolution": "--------\n--------",
    "standards_used": "[\"LAB-BALANCE.01\", \"LAB-CALIPER.01\"]",
    "points": [
      {
        "parameter": "Khoảng cách giữ hai ngàm kẹp (C) / Jaw seperation / (mm)",
        "value": "",
        "asFound": "2,58",
        "ref": "2,50 ~ 2,75",
        "unc": "0,02",
        "tol": "--",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Chiều dài cắt mẫu ban đầu (C) / Precut Length / (mm)",
        "value": "",
        "asFound": "20.15",
        "ref": "20",
        "unc": "0.1",
        "tol": "± 0.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)",
        "value": "Ngàm tĩnh(Static Clamps) - Width",
        "asFound": "35.76",
        "ref": "37.5",
        "unc": "0.05",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)",
        "value": "Ngàm tĩnh(Static Clamps) - Height",
        "asFound": "15.85",
        "ref": "17.5",
        "unc": "0.05",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)",
        "value": "Ngàm động(Moving Clamps) - Width",
        "asFound": "35.80",
        "ref": "37.5",
        "unc": "0.05",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Kích thước ngàm kẹp (C)/ Jaw face dimension (mm)",
        "value": "Ngàm động(Moving Clamps) - Height",
        "asFound": "15.89",
        "ref": "17.5",
        "unc": "0.05",
        "tol": "± 2.5",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)",
        "value": "A",
        "asFound": "250,3",
        "ref": "--",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)",
        "value": "B",
        "asFound": "500,4",
        "ref": "--",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)",
        "value": "C",
        "asFound": "750,4",
        "ref": "--",
        "unc": "0,43",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)",
        "value": "D",
        "asFound": "1500,6",
        "ref": "--",
        "unc": "1,0",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Tải trọng hiệu chuẩn (C)/ Re-check Weight (g)",
        "value": "E",
        "asFound": "3000,7",
        "ref": "--",
        "unc": "1,0",
        "tol": "--",
        "conf": "D",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)",
        "value": "A",
        "asFound": "4,0",
        "ref": "4",
        "unc": "--",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)",
        "value": "B",
        "asFound": "8,0",
        "ref": "8",
        "unc": "--",
        "tol": "± 0,3",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)",
        "value": "C",
        "asFound": "16,0",
        "ref": "16",
        "unc": "--",
        "tol": "± 0,5",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)",
        "value": "D",
        "asFound": "32,0",
        "ref": "32",
        "unc": "--",
        "tol": "± 1,0",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      },
      {
        "parameter": "Kết quả hiệu chuẩn lực xé (*)/ Tearing force calibration (N)",
        "value": "E",
        "asFound": "64,0",
        "ref": "64",
        "unc": "--",
        "tol": "± 1,5",
        "conf": "A",
        "std": "LAB-BALANCE.01"
      }
    ]
  },
  {
    "name": "Pneumatic Bursting Strength Tester",
    "name_vi": "Máy thử độ bền đánh thủng – Dạng khí nén",
    "name_en": "Pneumatic Bursting Strength Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000017",
    "procedure": "PRESSURE-01:2026\nLINEAR-09:2026\nTIME-02:2026\nLINEAR-05:2026",
    "ref_standard": "ISO 13938-2",
    "model": "Titan 5",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000017",
    "spec_range": "Áp suất/Pressure: (0~1000) kPa\nĐộ cao phồng: Distension: (0~70) mm\nThời gian/Time: 20 s\nKích thước/Dimension: (30~113) mm",
    "spec_resolution": "0,1 kPa\n0,1 mm\n0,1 s\n--------",
    "standards_used": "[\"LAB-CALIPER.01\", \"LAB-DIS.01\", \"LAB-PRESSURE.01\", \"LAB-TIMER.02\"]",
    "points": [
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "100",
        "asFound": "101.1",
        "ref": "100",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "200",
        "asFound": "202.0",
        "ref": "200",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "300",
        "asFound": "302.8",
        "ref": "300",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "400",
        "asFound": "403.0",
        "ref": "400",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "500",
        "asFound": "503.3",
        "ref": "500",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "600",
        "asFound": "603.9",
        "ref": "600",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "700",
        "asFound": "704.1",
        "ref": "700",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "800",
        "asFound": "805.0",
        "ref": "800",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Thời gian / Time (C) (s)",
        "value": "20",
        "asFound": "20.724",
        "ref": "20",
        "unc": "0.76",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIMER.02"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "10",
        "asFound": "10,02",
        "ref": "10",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "20",
        "asFound": "20,02",
        "ref": "20",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "30",
        "asFound": "30,03",
        "ref": "30",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "40",
        "asFound": "40,03",
        "ref": "40",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "50",
        "asFound": "50,03",
        "ref": "50",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "60",
        "asFound": "60,03",
        "ref": "60",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "70",
        "asFound": "70,03",
        "ref": "70",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 7,3 cm2",
        "asFound": "30,48",
        "ref": "30,5",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 10 cm2",
        "asFound": "35,78",
        "ref": "35,7",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 50 cm2",
        "asFound": "79,78",
        "ref": "79,8",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 100 cm2",
        "asFound": "113,78",
        "ref": "113",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 7,3 cm2",
        "asFound": "30,48",
        "ref": "30,5",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 10 cm2",
        "asFound": "35,78",
        "ref": "35,7",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 50 cm2",
        "asFound": "79,78",
        "ref": "79,8",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 100 cm2",
        "asFound": "113,78",
        "ref": "113",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Hydraulic Bursting Strength Tester",
    "name_vi": "Máy thử độ bền đánh thủng – Dạng thuỷ lực",
    "name_en": "Hydraulic Bursting Strength Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000018",
    "procedure": "PRESSURE-01:2026\nLINEAR-09:2026\nTIME-02:2026\nLINEAR-05:2026",
    "ref_standard": "ISO 13938-1",
    "model": "Titan 5",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000018",
    "spec_range": "Áp suất/Pressure: (0~2000) kPa\nĐộ cao phồng: Distension: (0~70) mm\nThời gian/Time: 20 s\nKích thước/Dimension: (30~113) mm",
    "spec_resolution": "0,1 kPa\n0,1 mm\n0,1 s\n--------",
    "standards_used": "[\"LAB-CALIPER.01\", \"LAB-DIS.01\", \"LAB-PRESSURE.01\", \"LAB-TIMER.02\"]",
    "points": [
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "200",
        "asFound": "101.1",
        "ref": "200",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "400",
        "asFound": "402.0",
        "ref": "400",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "600",
        "asFound": "602.8",
        "ref": "600",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "800",
        "asFound": "803.0",
        "ref": "800",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "1000",
        "asFound": "1003.3",
        "ref": "1000",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "1200",
        "asFound": "1203.9",
        "ref": "1200",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "1400",
        "asFound": "1404.1",
        "ref": "1400",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "1600",
        "asFound": "1605.0",
        "ref": "1600",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "1800",
        "asFound": "1805.0",
        "ref": "1800",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (kPa)",
        "value": "2000",
        "asFound": "2005.0",
        "ref": "2000",
        "unc": "4,2",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Thời gian / Time (C) (s)",
        "value": "20",
        "asFound": "20.724",
        "ref": "20",
        "unc": "0.76",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIMER.02"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "10",
        "asFound": "10,02",
        "ref": "10",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "20",
        "asFound": "20,02",
        "ref": "20",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "30",
        "asFound": "30,03",
        "ref": "30",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "40",
        "asFound": "40,03",
        "ref": "40",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "50",
        "asFound": "50,03",
        "ref": "50",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "60",
        "asFound": "60,03",
        "ref": "60",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Chiều cao phồng/ Distension (C) (mm)",
        "value": "70",
        "asFound": "70,03",
        "ref": "70",
        "unc": "0,1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-DIS.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 7,3 cm2",
        "asFound": "30,48",
        "ref": "30,5",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 10 cm2",
        "asFound": "35,78",
        "ref": "35,7",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 50 cm2",
        "asFound": "79,78",
        "ref": "79,8",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên - 100 cm2",
        "asFound": "113,78",
        "ref": "113",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 7,3 cm2",
        "asFound": "30,48",
        "ref": "30,5",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 10 cm2",
        "asFound": "35,78",
        "ref": "35,7",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 50 cm2",
        "asFound": "79,78",
        "ref": "79,8",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới - 100 cm2",
        "asFound": "113,78",
        "ref": "113",
        "unc": "0,02",
        "tol": "± 0,2",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Mullen C Bursting Strength Tester",
    "name_vi": "Máy thử độ bền đánh thủng – Mullen C",
    "name_en": "Mullen C Bursting Strength Tester",
    "manufacturer": "Mullen",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000019",
    "procedure": "PRESSURE-01:2026",
    "ref_standard": "ASTM D3786",
    "model": "C",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000019",
    "spec_range": "Áp suất/Pressure: (0~200) Psi\nÁp suất/Pressure: (0~60) Psi",
    "spec_resolution": "1 Psi\n0,5 Psi",
    "standards_used": "[\"LAB-PRESSURE.01\"]",
    "points": [
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "20",
        "asFound": "21.1",
        "ref": "20",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "40",
        "asFound": "42.0",
        "ref": "40",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "60",
        "asFound": "62.8",
        "ref": "60",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "80",
        "asFound": "83.0",
        "ref": "80",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "100",
        "asFound": "103.3",
        "ref": "100",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "120",
        "asFound": "123.3",
        "ref": "120",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "140",
        "asFound": "143.9",
        "ref": "140",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "160",
        "asFound": "144.1",
        "ref": "160",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 200 Psi (S/N:....) (Psi)",
        "value": "180",
        "asFound": "185.0",
        "ref": "180",
        "unc": "1",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)",
        "value": "10",
        "asFound": "10.5",
        "ref": "10",
        "unc": "1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)",
        "value": "20",
        "asFound": "20.6",
        "ref": "20",
        "unc": "1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)",
        "value": "30",
        "asFound": "30.7",
        "ref": "30",
        "unc": "1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)",
        "value": "40",
        "asFound": "40.7",
        "ref": "40",
        "unc": "1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất (M) / Pressure Gauge 60 Psi (S/N:....) (Psi)",
        "value": "50",
        "asFound": "50.9",
        "ref": "50",
        "unc": "1",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Kiểm tra màn nhôm/ Alluminum foil check (*) (Psi)",
        "value": "84,7",
        "asFound": "86",
        "ref": "84,7",
        "unc": "--",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Kiểm tra màn nhôm/ Alluminum foil check (*) (Psi)",
        "value": "106,4",
        "asFound": "108.5",
        "ref": "106,4",
        "unc": "--",
        "tol": "± 3,5",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      }
    ]
  },
  {
    "name": "Hydrostatic Test Head",
    "name_vi": "Máy thử nghiệm độ chống thấm nước của vải",
    "name_en": "Hydrostatic Head Tester",
    "manufacturer": "James Heal",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000020",
    "procedure": "PRESSURE-01:2026\nPRESSURE-02:2026\nTIME-02:2026\nLINEAR-05:2026",
    "ref_standard": "ISO 811\nAATCC 127",
    "model": "Titan 5",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000020",
    "spec_range": "Áp suất/Pressure: (0~5000) cmH2O\nTốc độ tăng áp: Pressure Gradient: 10; 60 cmH2O\nThời gian/Time: (0~1800) s\nKích thước/ Dimension: 128 mm",
    "spec_resolution": "0,1 cmH2O\n0,1 cmH2O\n1 s\n--------",
    "standards_used": "[\"LAB-CALIPER.01\", \"LAB-PRESSURE.01\", \"LAB-TIMER.02\"]",
    "points": [
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "100",
        "asFound": "101,1",
        "ref": "100",
        "unc": "42",
        "tol": "± 0,5",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "200",
        "asFound": "202,0",
        "ref": "200",
        "unc": "42",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "300",
        "asFound": "302,8",
        "ref": "300",
        "unc": "42",
        "tol": "± 1,5",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "400",
        "asFound": "403,0",
        "ref": "400",
        "unc": "42",
        "tol": "± 2,0",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "500",
        "asFound": "503,3",
        "ref": "500",
        "unc": "42",
        "tol": "± 2,5",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "1000",
        "asFound": "1003,9",
        "ref": "1000",
        "unc": "42",
        "tol": "± 5",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "2000",
        "asFound": "2004,1",
        "ref": "2000",
        "unc": "42",
        "tol": "± 10",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "3000",
        "asFound": "3005,0",
        "ref": "3000",
        "unc": "42",
        "tol": "± 15",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "4000",
        "asFound": "4005,0",
        "ref": "4000",
        "unc": "42",
        "tol": "± 20",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Áp suất/ Pressure (M) (cmH2O)",
        "value": "5000",
        "asFound": "5005,0",
        "ref": "5000",
        "unc": "42",
        "tol": "± 25",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Tốc độ tăng áp/ Pressure Gradient (*) (cmH2O/min)",
        "value": "10",
        "asFound": "10,1",
        "ref": "10",
        "unc": "0,1",
        "tol": "± 0,5",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Tốc độ tăng áp/ Pressure Gradient (*) (cmH2O/min)",
        "value": "60",
        "asFound": "60,2",
        "ref": "60",
        "unc": "0,1",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-PRESSURE.01"
      },
      {
        "parameter": "Thời gian / Time (C) (s)",
        "value": "600",
        "asFound": "600",
        "ref": "600,02",
        "unc": "0,6",
        "tol": "± 30",
        "conf": "A",
        "std": "LAB-TIMER.02"
      },
      {
        "parameter": "Thời gian / Time (C) (s)",
        "value": "1800",
        "asFound": "1800",
        "ref": "1800,04",
        "unc": "0,6",
        "tol": "± 30",
        "conf": "A",
        "std": "LAB-TIMER.02"
      },
      {
        "parameter": "Thời gian / Time (C) (s)",
        "value": "3600",
        "asFound": "3600",
        "ref": "3600,05",
        "unc": "0,6",
        "tol": "± 30",
        "conf": "A",
        "std": "LAB-TIMER.02"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòm kẹp mẫu trên/ Dome - 100 cm2",
        "asFound": "113,78",
        "ref": "114",
        "unc": "0,02",
        "tol": "± 1,3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      },
      {
        "parameter": "Đường kính vòng kẹp mẫu/ Dome and clamping ring diameter (M) (mm)",
        "value": "Vòng kẹp mẫu dưới/ Clamping Ring - 100 cm2",
        "asFound": "113,78",
        "ref": "114",
        "unc": "0,02",
        "tol": "± 1,3",
        "conf": "A",
        "std": "LAB-CALIPER.01"
      }
    ]
  },
  {
    "name": "Wascator",
    "name_vi": "Máy giặt tiêu chuân ISO 6330 - Wascator",
    "name_en": "Wascator",
    "manufacturer": "Electrolux",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000021",
    "procedure": "LAB-T-02:2023\nLAB-F-01:2023\nTIME-02:2026\nV-03:2026",
    "ref_standard": "ISO 6330:2021",
    "model": "FOM 71CLS",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000021",
    "spec_range": "Nhiệt độ/Temperature: (40~90) °C\nTốc độ/Speed: 52; (500 ~1100) rpm\nThời gian/Time: 3600 s\nMực nước Water Level: 35 L (225 mm)",
    "spec_resolution": "0,1 °C\n1 rpm\n2 s\n--------",
    "standards_used": "[\"LAB-TACHO.01\", \"LAB-THERMO.01\", \"LAB-TIME.01\", \"LAB-WATERFLOW.01\"]",
    "points": [
      {
        "parameter": "Nhiệt độ (C) / Temperature / (⁰C)",
        "value": "40",
        "asFound": "40,3",
        "ref": "40",
        "unc": "1,0",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Nhiệt độ (C) / Temperature / (⁰C)",
        "value": "60",
        "asFound": "59,5",
        "ref": "60",
        "unc": "1,0",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Nhiệt độ (C) / Temperature / (⁰C)",
        "value": "80",
        "asFound": "79,3",
        "ref": "80",
        "unc": "1,0",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Nhiệt độ (C) / Temperature / (⁰C)",
        "value": "90",
        "asFound": "89,3",
        "ref": "90",
        "unc": "1,0",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Tốc độ giặt (C) / Washing Speed / (rpm)",
        "value": "52",
        "asFound": "52,3",
        "ref": "52",
        "unc": "0,6",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Thời gian (C) / Time / (second)",
        "value": "3600",
        "asFound": "3600,0",
        "ref": "3600",
        "unc": "0,6",
        "tol": "--",
        "conf": "--",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Mực nước (*) / Level Check / (mm)",
        "value": "100",
        "asFound": "100",
        "ref": "100",
        "unc": "0,5",
        "tol": "± 5",
        "conf": "A",
        "std": "LAB-WATERFLOW.01"
      },
      {
        "parameter": "Mực nước (*) / Level Check / (mm)",
        "value": "130",
        "asFound": "130",
        "ref": "130",
        "unc": "0,5",
        "tol": "± 5",
        "conf": "A",
        "std": "LAB-WATERFLOW.01"
      },
      {
        "parameter": "Mực nước (*) / Level Check / (mm)",
        "value": "160",
        "asFound": "161",
        "ref": "160",
        "unc": "0,5",
        "tol": "± 5",
        "conf": "A",
        "std": "LAB-WATERFLOW.01"
      },
      {
        "parameter": "Mực nước (*) / Level Check / (mm)",
        "value": "200",
        "asFound": "200",
        "ref": "200",
        "unc": "0,5",
        "tol": "± 5",
        "conf": "A",
        "std": "LAB-WATERFLOW.01"
      },
      {
        "parameter": "Tốc độ vắt (C) / Spin Speed / (rpm)",
        "value": "500",
        "asFound": "503,9",
        "ref": "500",
        "unc": "1,4",
        "tol": "± 50",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vắt (C) / Spin Speed / (rpm)",
        "value": "775",
        "asFound": "779,3",
        "ref": "775",
        "unc": "1,4",
        "tol": "± 50",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vắt (C) / Spin Speed / (rpm)",
        "value": "950",
        "asFound": "958,1",
        "ref": "950",
        "unc": "1,4",
        "tol": "± 50",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vắt (C) / Spin Speed / (rpm)",
        "value": "1100",
        "asFound": "1105",
        "ref": "1100",
        "unc": "1,4",
        "tol": "± 50",
        "conf": "A",
        "std": "LAB-TACHO.01"
      }
    ]
  },
  {
    "name": "AATCC Washing Machine",
    "name_vi": "Máy giặt tiêu chuẩn AATCC",
    "name_en": "AATCC Washing Machine",
    "manufacturer": "Labtex",
    "next_due": "2027-06-25",
    "equipment_id": "EQ-000022",
    "procedure": "LAB-T-02:2023\nLAB-F-01:2023\nTIME-02:2026\nV-03:2026",
    "ref_standard": "AATCC LP1\nAATCC TM 135",
    "model": "LBT M6",
    "serial_number": "TM092026",
    "model_serial": "TM092026",
    "manufacturer_id": "EQ-000022",
    "spec_range": "Nhiệt độ/Temperature: (40~90) °C\nTốc độ/Speed: (500~660) rpm\nThời gian/Time: 3600 s\nMực nước/ Water Level: (40~72) L",
    "spec_resolution": "0,1 °C\n--------\n1 s\n--------",
    "standards_used": "[\"LAB-TACHO.01\", \"LAB-THERMO.01\", \"LAB-TIME.01\", \"LAB-WATERFLOW.01\"]",
    "points": [
      {
        "parameter": "Nhiệt độ giặt / Washing Temperature (⁰C)",
        "value": "27",
        "asFound": "30.5",
        "ref": "27",
        "unc": "1,5",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Nhiệt độ giặt / Washing Temperature (⁰C)",
        "value": "41",
        "asFound": "41.1",
        "ref": "41",
        "unc": "1,5",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Nhiệt độ giặt / Washing Temperature (⁰C)",
        "value": "49",
        "asFound": "49.4",
        "ref": "49",
        "unc": "1,5",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Nhiệt độ giặt / Washing Temperature (⁰C)",
        "value": "60",
        "asFound": "59.4",
        "ref": "60",
        "unc": "1,5",
        "tol": "± 3",
        "conf": "A",
        "std": "LAB-THERMO.01"
      },
      {
        "parameter": "Mực nước / Water Level (L)",
        "value": "44",
        "asFound": "14.9",
        "ref": "44",
        "unc": "1",
        "tol": "± 4",
        "conf": "A",
        "std": "LAB-WATERFLOW.01"
      },
      {
        "parameter": "Mực nước / Water Level (L)",
        "value": "72",
        "asFound": "19.2",
        "ref": "72",
        "unc": "1",
        "tol": "± 4",
        "conf": "A",
        "std": "LAB-WATERFLOW.01"
      },
      {
        "parameter": "Tốc độ giặt / Agitation Speed (spm)",
        "value": "Normal",
        "asFound": "86",
        "ref": "86",
        "unc": "0.3",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ giặt / Agitation Speed (spm)",
        "value": "Permanent Press",
        "asFound": "86",
        "ref": "86",
        "unc": "0.3",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ giặt / Agitation Speed (spm)",
        "value": "Delicates",
        "asFound": "27",
        "ref": "27",
        "unc": "0.3",
        "tol": "± 2",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Thời gian / Time (min)",
        "value": "Normal - Main wash",
        "asFound": "16.0",
        "ref": "16",
        "unc": "5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Thời gian / Time (min)",
        "value": "Normal - Spin time",
        "asFound": "5.0",
        "ref": "7.5",
        "unc": "5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Thời gian / Time (min)",
        "value": "Permanent Press - Main wash",
        "asFound": "12.0",
        "ref": "12",
        "unc": "5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Thời gian / Time (min)",
        "value": "Permanent Press - Spin time",
        "asFound": "5.0",
        "ref": "7.5",
        "unc": "5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Thời gian / Time (min)",
        "value": "Delicates - Main wash",
        "asFound": "8.5",
        "ref": "8.5",
        "unc": "5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Thời gian / Time (min)",
        "value": "Delicates - Spin time",
        "asFound": "5.0",
        "ref": "7.5",
        "unc": "5",
        "tol": "± 1",
        "conf": "A",
        "std": "LAB-TIME.01"
      },
      {
        "parameter": "Tốc độ vắt / Final Spin Speed (rpm)",
        "value": "Normal",
        "asFound": "651.2",
        "ref": "660",
        "unc": "2",
        "tol": "± 15",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vắt / Final Spin Speed (rpm)",
        "value": "Permanent Press",
        "asFound": "490.7",
        "ref": "500",
        "unc": "2",
        "tol": "± 15",
        "conf": "A",
        "std": "LAB-TACHO.01"
      },
      {
        "parameter": "Tốc độ vắt / Final Spin Speed (rpm)",
        "value": "Delicates",
        "asFound": "490.7",
        "ref": "500",
        "unc": "2",
        "tol": "± 15",
        "conf": "A",
        "std": "LAB-TACHO.01"
      }
    ]
  }
,
  {
      "name": "Color Fastness to wash tester",
      "name_vi": "Thiết bị thử nghiệm độ bền màu giặt",
      "name_en": "Color fastness to wash tester",
      "manufacturer": "SDL Atlas",
      "next_due": "2027-09-09",
      "equipment_id": "EQ-000023",
      "manufacturer_id": "EQ-000023",
      "model": "M228C",
      "serial_number": "628R0027",
      "model_serial": "628R0027",
      "procedure": "LAB-T-02:2023\nLAB-F-01:2023\nTIME-02:2026\nRATE-01:2026",
      "ref_standard": "AATCC 61\nISO 105-C Series",
      "spec_range": "Nhiệt độ/Temperature: (40~90) °C\nTốc độ/Speed: 40 rpm\nThời gian/Time: 240 min\nTốc độ gia nhiệt:Heating rate: 1,5 °C/min",
      "spec_resolution": "0,1 °C\n--\n1 s\n--",
      "standards_used": "[\"LAB-TACHO.03\", \"LAB-THERMO.03\", \"LAB-TIME.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 30",
              "asFound": "30,2",
              "ref": "30,0",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 40",
              "asFound": "40,3",
              "ref": "40,0",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 50",
              "asFound": "50,1",
              "ref": "50,1",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 60",
              "asFound": "60,0",
              "ref": "60,1",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 70",
              "asFound": "69,7",
              "ref": "70,1",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 80",
              "asFound": "79,8",
              "ref": "80,1",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 90",
              "asFound": "94,6",
              "ref": "95,2",
              "unc": "0,8",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Tốc độ gia nhiệt (M) / Heating Rate (°C/min)",
              "value": "Set: 1,5",
              "asFound": "1,85",
              "ref": "1,5",
              "unc": "0,02",
              "tol": "--",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Tốc độ vòng quay (C) / Speed (rpm)",
              "value": "40",
              "asFound": "40,5",
              "ref": "40",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TACHO.03"
          },
          {
              "parameter": "Thời gian (C) / Time (min)",
              "value": "Set: 30",
              "asFound": "30,00",
              "ref": "30",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian (C) / Time (min)",
              "value": "Set: 45",
              "asFound": "45,01",
              "ref": "45",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 1",
              "asFound": "520,7",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 2",
              "asFound": "525,7",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 3",
              "asFound": "525,5",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 4",
              "asFound": "525,5",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 5",
              "asFound": "530,6",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 6",
              "asFound": "530,4",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 7",
              "asFound": "530,6",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 8",
              "asFound": "529,8",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 9",
              "asFound": "530,5",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 10",
              "asFound": "530,3",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 11",
              "asFound": "530,4",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          },
          {
              "parameter": "Dung tích cốc (*) / Vessel Capacity 550 (ml)",
              "value": "No 12",
              "asFound": "529,5",
              "ref": "550",
              "unc": "0,5",
              "tol": "± 50",
              "conf": "A",
              "std": ""
          }
      ]
  },
  {
      "name": "Miele Washing Machine PWM 906",
      "name_vi": "Máy giặt lồng ngang Miele PWM 906",
      "name_en": "Front-load washing machine Miele PWM 906",
      "manufacturer": "Miele",
      "next_due": "2027-09-09",
      "equipment_id": "EQ-000024",
      "manufacturer_id": "EQ-000024",
      "model": "PW 906 LW Texlab",
      "serial_number": "54/202255261",
      "model_serial": "54/202255261",
      "procedure": "LAB-T-02:2023\nLAB-F-01:2023\nTIME-02:2026\nV-03:2026",
      "ref_standard": "DS0034 V4\nPuma - F-01",
      "spec_range": "Nhiệt độ/Temperature: (40~90) °C\nTốc độ/Speed: (600~1000) rpm\nThời gian/Time: 7200 s\nMực nước/ Water Level: (40~72) L",
      "spec_resolution": "0,1 °C\n--\n1 s\n--",
      "standards_used": "[\"LAB-TACHO.03\", \"LAB-THERMO.03\", \"LAB-TIME.01\", \"LAB-WATERFLOW.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 30",
              "asFound": "31,5",
              "ref": "30",
              "unc": "1,0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 40",
              "asFound": "40,6",
              "ref": "40",
              "unc": "1,0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "Set: 60",
              "asFound": "60,9",
              "ref": "60",
              "unc": "1,0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.03"
          },
          {
              "parameter": "Thời gian giặt (C) / Washing Time (s)",
              "value": "Coloured Items",
              "asFound": "59,7",
              "ref": "59",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian giặt (C) / Washing Time (s)",
              "value": "Minimum iron",
              "asFound": "43,1",
              "ref": "43",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian giặt (C) / Washing Time (s)",
              "value": "Delicates",
              "asFound": "30,5",
              "ref": "30",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (s)",
              "value": "Coloured Items",
              "asFound": "3540,71",
              "ref": "3540",
              "unc": "0,6",
              "tol": "± 60",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (s)",
              "value": "Minimum iron",
              "asFound": "2700,72",
              "ref": "2700",
              "unc": "0,6",
              "tol": "± 60",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (s)",
              "value": "Delicates",
              "asFound": "2100,55",
              "ref": "2100",
              "unc": "0,6",
              "tol": "± 60",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian vắt (C) / Spin time (s)",
              "value": "Coloured Items",
              "asFound": "5,41",
              "ref": "5",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian vắt (C) / Spin time (s)",
              "value": "Minimum iron",
              "asFound": "5,32",
              "ref": "5",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian vắt (C) / Spin time (s)",
              "value": "Delicates",
              "asFound": "5,32",
              "ref": "5",
              "unc": "0,6",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tốc độ vắt (C) / Spin Speed (rpm)",
              "value": "600",
              "asFound": "600,9",
              "ref": "600",
              "unc": "1,4",
              "tol": "± 20",
              "conf": "A",
              "std": "LAB-TACHO.03"
          },
          {
              "parameter": "Tốc độ vắt (C) / Spin Speed (rpm)",
              "value": "800",
              "asFound": "801,5",
              "ref": "800",
              "unc": "1,4",
              "tol": "± 20",
              "conf": "A",
              "std": "LAB-TACHO.03"
          },
          {
              "parameter": "Tốc độ vắt (C) / Spin Speed (rpm)",
              "value": "1000",
              "asFound": "971,3",
              "ref": "1000",
              "unc": "1,4",
              "tol": "± 20",
              "conf": "A",
              "std": "LAB-TACHO.03"
          },
          {
              "parameter": "Tốc độ vắt (C) / Spin Speed (rpm)",
              "value": "1200",
              "asFound": "1212",
              "ref": "1200",
              "unc": "1,4",
              "tol": "± 20",
              "conf": "A",
              "std": "LAB-TACHO.03"
          },
          {
              "parameter": "Mực nước (M) / Water level (L)",
              "value": "Coloured Items",
              "asFound": "12,1",
              "ref": "12,5",
              "unc": "0,7",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-WATERFLOW.01"
          },
          {
              "parameter": "Mực nước (M) / Water level (L)",
              "value": "Minimum iron",
              "asFound": "12,1",
              "ref": "12,5",
              "unc": "0,7",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-WATERFLOW.01"
          },
          {
              "parameter": "Mực nước (M) / Water level (L)",
              "value": "Delicates",
              "asFound": "12,1",
              "ref": "12,5",
              "unc": "0,7",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-WATERFLOW.01"
          }
      ]
  },
  {
      "name": "ISO 6330 Tumble Dryer",
      "name_vi": "Máy sấy thử nghiệm tiêu chuẩn ISO 6330",
      "name_en": "ISO 6330 Precision Tumble Dryer",
      "manufacturer": "Miele",
      "next_due": "2027-09-09",
      "equipment_id": "EQ-000025",
      "manufacturer_id": "EQ-000025",
      "model": "PDR908(*) EL LW",
      "serial_number": "41/178576226",
      "model_serial": "41/178576226",
      "procedure": "LAB-T-02:2023\nTIME-02:2026",
      "ref_standard": "ISO 6330",
      "spec_range": "Nhiệt độ/Temperature: (40~80) °C\nThời gian/Time: 90 min",
      "spec_resolution": "0,1 °C\n1 s",
      "standards_used": "[\"LAB-THERMO.01\", \"LAB-TIME.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ khí xả (C) / Exhaust Temperature (°C)",
              "value": "Set: 40",
              "asFound": "39,9",
              "ref": "40",
              "unc": "2,8",
              "tol": "± 3",
              "conf": "C",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ khí xả (C) / Exhaust Temperature (°C)",
              "value": "Set: 50",
              "asFound": "49,7",
              "ref": "50",
              "unc": "2,8",
              "tol": "± 3",
              "conf": "C",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ khí xả (C) / Exhaust Temperature (°C)",
              "value": "Set: 55",
              "asFound": "55,8",
              "ref": "55",
              "unc": "2,8",
              "tol": "± 3",
              "conf": "C",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ khí xả (C) / Exhaust Temperature (°C)",
              "value": "Set: 60",
              "asFound": "61,2",
              "ref": "60",
              "unc": "2,8",
              "tol": "± 3",
              "conf": "C",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ khí xả (C) / Exhaust Temperature (°C)",
              "value": "Set: 70",
              "asFound": "70,1",
              "ref": "70",
              "unc": "2,8",
              "tol": "± 3",
              "conf": "C",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ khí xả (C) / Exhaust Temperature (°C)",
              "value": "Set: 80",
              "asFound": "80,3",
              "ref": "80",
              "unc": "2,8",
              "tol": "± 3",
              "conf": "C",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (sec)",
              "value": "Set: 1800",
              "asFound": "1800,31",
              "ref": "1800",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (sec)",
              "value": "Set: 3600",
              "asFound": "3600,45",
              "ref": "3600",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (sec)",
              "value": "Set: 5400",
              "asFound": "5400,56",
              "ref": "5400",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian làm mát (C) / Cool down period (sec)",
              "value": "Set: 300",
              "asFound": "300,25",
              "ref": "300",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          }
      ]
  },
  {
      "name": "AATCC Tumble Dryer",
      "name_vi": "Máy sấy thử nghiệm tiêu chuẩn AATCC",
      "name_en": "AATCC Tumble Dryer",
      "manufacturer": "Miele",
      "next_due": "2027-09-09",
      "equipment_id": "EQ-000026",
      "manufacturer_id": "EQ-000026",
      "model": "PDR908(*) EL LW",
      "serial_number": "41/178576226",
      "model_serial": "41/178576226",
      "procedure": "LAB-T-02:2023\nTIME-02:2026",
      "ref_standard": "AATCC LP1",
      "spec_range": "Nhiệt độ/Temperature: (40~80) °C\nThời gian/Time: 90 min",
      "spec_resolution": "0,1 °C\n1 s",
      "standards_used": "[\"LAB-THERMO.01\", \"LAB-TIME.01\", \"LAB-TACHO.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ cao nhất của khí xả (C) / Max. exhaust Temperature (°C)",
              "value": "Set: Low",
              "asFound": "39,9",
              "ref": "60",
              "unc": "2,8",
              "tol": "± 6",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ cao nhất của khí xả (C) / Max. exhaust Temperature (°C)",
              "value": "Set: Medium",
              "asFound": "61,2",
              "ref": "66",
              "unc": "2,8",
              "tol": "± 6",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ cao nhất của khí xả (C) / Max. exhaust Temperature (°C)",
              "value": "Set: High",
              "asFound": "80,3",
              "ref": "66",
              "unc": "2,8",
              "tol": "± 6",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (sec)",
              "value": "Set: 1800",
              "asFound": "1800,31",
              "ref": "1800",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (sec)",
              "value": "Set: 3600",
              "asFound": "3600,45",
              "ref": "3600",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Tổng thời gian (C) / Total time (sec)",
              "value": "Set: 5400",
              "asFound": "5400,56",
              "ref": "5400",
              "unc": "0,6",
              "tol": "± 30",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian làm mát (C) / Cool down period (sec)",
              "value": "≤ 600",
              "asFound": "593,25",
              "ref": "≤ 600",
              "unc": "0,6",
              "tol": "--",
              "conf": "A",
              "std": "LAB-TIME.01"
          }
      ]
  },
  {
      "name": "Oven",
      "name_vi": "Tủ sấy",
      "name_en": "Oven",
      "manufacturer": "Memmert",
      "next_due": "2027-09-09",
      "equipment_id": "EQ-000027",
      "manufacturer_id": "EQ-000027",
      "model": "UN55",
      "serial_number": "41/178576226",
      "model_serial": "41/178576226",
      "procedure": "LAB-T-02:2023\nTIME-02:2026",
      "ref_standard": "--",
      "spec_range": "Nhiệt độ/Temperature: (37~250) °C",
      "spec_resolution": "0,1 °C",
      "standards_used": "[\"LAB-THERMO.07\"]",
      "points": [
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 1",
              "asFound": "30.0",
              "ref": "31.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 2",
              "asFound": "30.0",
              "ref": "31.5",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 3",
              "asFound": "30.0",
              "ref": "31.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 4",
              "asFound": "30.0",
              "ref": "31.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 5",
              "asFound": "30.0",
              "ref": "31.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 6",
              "asFound": "30.0",
              "ref": "30.8",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 7",
              "asFound": "30.0",
              "ref": "30.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 8",
              "asFound": "30.0",
              "ref": "30.5",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (30.0 °C) / Oven Temperature",
              "value": "Vị trí 9",
              "asFound": "30.0",
              "ref": "31.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 1",
              "asFound": "50.0",
              "ref": "50.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 2",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 3",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 4",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 5",
              "asFound": "50.0",
              "ref": "49.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 6",
              "asFound": "50.0",
              "ref": "50.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 7",
              "asFound": "50.0",
              "ref": "50.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 8",
              "asFound": "50.0",
              "ref": "50.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (50.0 °C) / Oven Temperature",
              "value": "Vị trí 9",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 1",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 2",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 3",
              "asFound": "70.0",
              "ref": "69.7",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 4",
              "asFound": "70.0",
              "ref": "69.8",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 5",
              "asFound": "70.0",
              "ref": "69.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 6",
              "asFound": "70.0",
              "ref": "69.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 7",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 8",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (70.0 °C) / Oven Temperature",
              "value": "Vị trí 9",
              "asFound": "70.0",
              "ref": "69.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 1",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 2",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 3",
              "asFound": "90.0",
              "ref": "89.7",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 4",
              "asFound": "90.0",
              "ref": "89.8",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 5",
              "asFound": "90.0",
              "ref": "89.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 6",
              "asFound": "90.0",
              "ref": "89.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 7",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 8",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng sấy (90.0 °C) / Oven Temperature",
              "value": "Vị trí 9",
              "asFound": "90.0",
              "ref": "89.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          }
      ]
  },
  {
      "name": "Temp_hump chamber",
      "name_vi": "Tủ kiểm soát nhiệt - độ độ ẩm",
      "name_en": "Temperature and humidity chamber",
      "manufacturer": "Memmert",
      "next_due": "2027-09-09",
      "equipment_id": "EQ-000028",
      "manufacturer_id": "EQ-000028",
      "model": "PDR908(*) EL LW",
      "serial_number": "41/178576226",
      "model_serial": "41/178576226",
      "procedure": "LAB-TH-01:2023",
      "ref_standard": "--",
      "spec_range": "Nhiệt độ/Temperature: (37~250) °C\nĐộ ẩm/Humidity: (37~95) %RH",
      "spec_resolution": "0,1 °C\n0,1 %RH",
      "standards_used": "[\"LAB-THERMO.07\", \"LAB-9HSENSORS.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 1",
              "asFound": "30.0",
              "ref": "31.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 2",
              "asFound": "30.0",
              "ref": "31.5",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 3",
              "asFound": "30.0",
              "ref": "31.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 4",
              "asFound": "30.0",
              "ref": "31.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 5",
              "asFound": "30.0",
              "ref": "31.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 6",
              "asFound": "30.0",
              "ref": "30.8",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 7",
              "asFound": "30.0",
              "ref": "30.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 8",
              "asFound": "30.0",
              "ref": "30.5",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (30.0 °C) / Chamber Temperature",
              "value": "Vị trí 9",
              "asFound": "30.0",
              "ref": "31.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 1",
              "asFound": "50.0",
              "ref": "50.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 2",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 3",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 4",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 5",
              "asFound": "50.0",
              "ref": "49.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 6",
              "asFound": "50.0",
              "ref": "50.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 7",
              "asFound": "50.0",
              "ref": "50.0",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 8",
              "asFound": "50.0",
              "ref": "50.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (50.0 °C) / Chamber Temperature",
              "value": "Vị trí 9",
              "asFound": "50.0",
              "ref": "50.1",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 1",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 2",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 3",
              "asFound": "70.0",
              "ref": "69.7",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 4",
              "asFound": "70.0",
              "ref": "69.8",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 5",
              "asFound": "70.0",
              "ref": "69.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 6",
              "asFound": "70.0",
              "ref": "69.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 7",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 8",
              "asFound": "70.0",
              "ref": "69.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (70.0 °C) / Chamber Temperature",
              "value": "Vị trí 9",
              "asFound": "70.0",
              "ref": "69.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 1",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 2",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 3",
              "asFound": "90.0",
              "ref": "89.7",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 4",
              "asFound": "90.0",
              "ref": "89.8",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 5",
              "asFound": "90.0",
              "ref": "89.2",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 6",
              "asFound": "90.0",
              "ref": "89.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 7",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 8",
              "asFound": "90.0",
              "ref": "89.6",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          },
          {
              "parameter": "Nhiệt độ buồng tạo ẩm (90.0 °C) / Chamber Temperature",
              "value": "Vị trí 9",
              "asFound": "90.0",
              "ref": "89.9",
              "unc": "1.0",
              "tol": "± 3",
              "conf": "A",
              "std": "LAB-THERMO.07"
          }
      ]
  },
  {
      "name": "Perspirometer with weight",
      "name_vi": "Thiết bị thử nghiệm bền màu mồ hôi (kèm quả cân)",
      "name_en": "Perspirometer with weight",
      "manufacturer": "James Heal",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000029",
      "manufacturer_id": "EQ-000029",
      "model": "CROCKMASTER HD",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "LAB-M-01:2023",
      "ref_standard": "AATCC 15\nISO 105-E04",
      "spec_range": "Khối lượng/Mass: (400~5000) g",
      "spec_resolution": "--------",
      "standards_used": "[\"LAB-BALANCE.01\"]",
      "points": [
          {
              "parameter": "Khối lượng bộ giữ mẫu / Weight of Top plate (g)",
              "value": "917 (2 lbs)",
              "asFound": "913.0",
              "ref": "917",
              "unc": "0,43",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          },
          {
              "parameter": "Khối lượng tải trọng AATCC / Weight of AATCC load (g)",
              "value": "3628 (8 lbs)",
              "asFound": "3629,6",
              "ref": "3628",
              "unc": "1,0",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          },
          {
              "parameter": "Khối lượng tải trọng phụ ISO / Weight of ISO adding load (g)",
              "value": "453 (1 lbs)",
              "asFound": "453,4",
              "ref": "453",
              "unc": "0,43",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          },
          {
              "parameter": "Khối lượng tổng tải trọng AATCC / Weight of Total Load (g)",
              "value": "4540 (10 lbs)",
              "asFound": "4511",
              "ref": "4540",
              "unc": "1,0",
              "tol": "± 100",
              "conf": "A",
              "std": "LAB-BALANCE.01"
          },
          {
              "parameter": "Khối lượng tổng tải trọng ISO / Weight of Total Load (g)",
              "value": "5000",
              "asFound": "5071.9",
              "ref": "5000",
              "unc": "1,0",
              "tol": "± 100",
              "conf": "A",
              "std": "LAB-BALANCE.01"
          }
      ]
  },
  {
      "name": "Perspirometer - without weight",
      "name_vi": "Thiết bị thử nghiệm bền màu mồ hôi (không kèm quả cân)",
      "name_en": "Perspirometer without weight",
      "manufacturer": "James Heal",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000030",
      "manufacturer_id": "EQ-000030",
      "model": "CROCKMASTER HD",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "LAB-M-01:2023",
      "ref_standard": "AATCC 15\nISO 105-E04",
      "spec_range": "Khối lượng/Mass: (400~5000) g",
      "spec_resolution": "--------",
      "standards_used": "[\"LAB-BALANCE.01\"]",
      "points": [
          {
              "parameter": "Khối lượng bộ giữ mẫu / Weight of Top plate (g)",
              "value": "917 (2 lbs)",
              "asFound": "913.0",
              "ref": "917",
              "unc": "0,43",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          }
      ]
  },
  {
      "name": "Weight for Perspirometer",
      "name_vi": "Tải trọng cho thiết bị thử nghiệm bền màu mồ hôi",
      "name_en": "Weight for perspirometer",
      "manufacturer": "James Heal",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000031",
      "manufacturer_id": "EQ-000031",
      "model": "CROCKMASTER HD",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "LAB-M-01:2023",
      "ref_standard": "AATCC 15\nISO 105-E04",
      "spec_range": "Khối lượng/Mass: (400~5000) g",
      "spec_resolution": "--------",
      "standards_used": "[\"LAB-BALANCE.01\"]",
      "points": [
          {
              "parameter": "Khối lượng tải trọng AATCC / Weight of AATCC load (g)",
              "value": "3628 (8 lbs)",
              "asFound": "3629,6",
              "ref": "3628",
              "unc": "1,0",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          },
          {
              "parameter": "Khối lượng tải trọng phụ ISO / Weight of ISO adding load (g)",
              "value": "453 (1 lbs)",
              "asFound": "453,4",
              "ref": "453",
              "unc": "0,43",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          }
      ]
  },
  {
      "name": "Loading weight",
      "name_vi": "Tải trọng",
      "name_en": "Loading weight",
      "manufacturer": "James Heal",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000032",
      "manufacturer_id": "EQ-000032",
      "model": "CROCKMASTER HD",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "LAB-M-01:2023",
      "ref_standard": "--",
      "spec_range": "Khối lượng/Mass: (100~5000) g",
      "spec_resolution": "--------",
      "standards_used": "[\"LAB-BALANCE.01\"]",
      "points": [
          {
              "parameter": "Khối lượng danh nghĩa / Conventional mass (g)",
              "value": "3628",
              "asFound": "3629,6",
              "ref": "3628",
              "unc": "1,0",
              "tol": "--",
              "conf": "--",
              "std": "LAB-BALANCE.01"
          }
      ]
  },
  {
      "name": "pH meter",
      "name_vi": "Máy đo pH",
      "name_en": "pH meter",
      "manufacturer": "James Heal",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000033",
      "manufacturer_id": "EQ-000033",
      "model": "CROCKMASTER HD",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "PH-01:2026",
      "ref_standard": "--",
      "spec_range": "pH: 2~14",
      "spec_resolution": "pH: 0,01",
      "standards_used": "[\"LAB-PH.01\"]",
      "points": [
          {
              "parameter": "Độ chính xác đo pH / pH Measurement Accuracy",
              "value": "pH 4.01",
              "asFound": "3.99",
              "ref": "4.01",
              "unc": "0.05",
              "tol": "± 0.05",
              "conf": "A",
              "std": "LAB-PH.01"
          },
          {
              "parameter": "Độ chính xác đo pH / pH Measurement Accuracy",
              "value": "pH 7.01",
              "asFound": "6.99",
              "ref": "7.01",
              "unc": "0.05",
              "tol": "± 0.05",
              "conf": "A",
              "std": "LAB-PH.01"
          },
          {
              "parameter": "Độ chính xác đo pH / pH Measurement Accuracy",
              "value": "pH 9.21",
              "asFound": "9.19",
              "ref": "9.21",
              "unc": "0.05",
              "tol": "± 0.05",
              "conf": "A",
              "std": "LAB-PH.01"
          },
          {
              "parameter": "Độ dốc điện cực / Electrode Slope (%) (*)",
              "value": "Slope",
              "asFound": "98",
              "ref": "--",
              "unc": "0.5",
              "tol": "≥ 95%",
              "conf": "A",
              "std": "LAB-PH.01"
          }
      ]
  },
  {
      "name": "Scorch and Submilation Tester",
      "name_vi": "Thiết bị thử nghiệm bền màu cháy xém và thăng hoa",
      "name_en": "Scorch and Sublimation Tester",
      "manufacturer": "Labtex",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000034",
      "manufacturer_id": "EQ-000034",
      "model": "LBT M6",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "TEMP-03:2023\nTIME-02:2026",
      "ref_standard": "AATCC 92, 117, 133\nISO 105-P01, X11",
      "spec_range": "Nhiệt độ/Temperature: (110~210) °C\nThời gian/Time: 30 s",
      "spec_resolution": "0,1 °C\n1 s",
      "standards_used": "[\"LAB-THERMO.01\", \"LAB-TIME.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ tấm gia nhiệt trên (C) / Top plate temperature (°C)",
              "value": "110",
              "asFound": "110,3",
              "ref": "110",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt trên (C) / Top plate temperature (°C)",
              "value": "150",
              "asFound": "150,9",
              "ref": "150",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt trên (C) / Top plate temperature (°C)",
              "value": "180",
              "asFound": "180,9",
              "ref": "180",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt trên (C) / Top plate temperature (°C)",
              "value": "200",
              "asFound": "200,2",
              "ref": "200",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt trên (C) / Top plate temperature (°C)",
              "value": "210",
              "asFound": "210,2",
              "ref": "210",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt dưới (C) / Bottom plate temperature (°C)",
              "value": "110",
              "asFound": "110,3",
              "ref": "110",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt dưới (C) / Bottom plate temperature (°C)",
              "value": "130",
              "asFound": "129,9",
              "ref": "130",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt dưới (C) / Bottom plate temperature (°C)",
              "value": "150",
              "asFound": "150,2",
              "ref": "150",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt dưới (C) / Bottom plate temperature (°C)",
              "value": "200",
              "asFound": "200,2",
              "ref": "200",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt dưới (C) / Bottom plate temperature (°C)",
              "value": "210",
              "asFound": "210,2",
              "ref": "210",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Thời gian (C) / Timer (sec)",
              "value": "15",
              "asFound": "2,01",
              "ref": "15",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian (C) / Timer (sec)",
              "value": "30",
              "asFound": "5,01",
              "ref": "30",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TIME.01"
          }
      ]
  },
  {
      "name": "Heat press",
      "name_vi": "Máy ép nhiệt",
      "name_en": "Heat press machine",
      "manufacturer": "Labtex",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000035",
      "manufacturer_id": "EQ-000035",
      "model": "LBT M6",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "TEMP-03:2023\nTIME-02:2026",
      "ref_standard": "--",
      "spec_range": "Nhiệt độ/Temperature: (110~200) °C\nThời gian/Time: 30 s",
      "spec_resolution": "0,1 °C\n1 s",
      "standards_used": "[\"LAB-THERMO.01\", \"LAB-TIME.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ tấm gia nhiệt (C) / Top plate temperature (°C)",
              "value": "110",
              "asFound": "110,3",
              "ref": "110",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt (C) / Top plate temperature (°C)",
              "value": "150",
              "asFound": "150,9",
              "ref": "150",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt (C) / Top plate temperature (°C)",
              "value": "180",
              "asFound": "180,9",
              "ref": "180",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt (C) / Top plate temperature (°C)",
              "value": "200",
              "asFound": "200,2",
              "ref": "200",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ tấm gia nhiệt (C) / Top plate temperature (°C)",
              "value": "210",
              "asFound": "210,2",
              "ref": "210",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Thời gian (C) / Timer (sec)",
              "value": "15",
              "asFound": "2,01",
              "ref": "15",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TIME.01"
          },
          {
              "parameter": "Thời gian (C) / Timer (sec)",
              "value": "30",
              "asFound": "5,01",
              "ref": "30",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TIME.01"
          }
      ]
  },
  {
      "name": "Fusion machine",
      "name_vi": "Máy ép keo",
      "name_en": "Fusion machine",
      "manufacturer": "Labtex",
      "next_due": "2027-06-25",
      "equipment_id": "EQ-000036",
      "manufacturer_id": "EQ-000036",
      "model": "LBT M6",
      "serial_number": "TM092026",
      "model_serial": "TM092026",
      "procedure": "TEMP-03:2023\nLAB-F01:2023",
      "ref_standard": "--",
      "spec_range": "Nhiệt độ/Temperature: (110~200) °C\nTốc độ/Speed: 40 m/min",
      "spec_resolution": "0,1 °C\n--",
      "standards_used": "[\"LAB-THERMO.01\", \"LAB-TACHO.01\"]",
      "points": [
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "110",
              "asFound": "110,3",
              "ref": "110",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "150",
              "asFound": "150,9",
              "ref": "150",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "180",
              "asFound": "180,9",
              "ref": "180",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "200",
              "asFound": "200,2",
              "ref": "200",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Nhiệt độ (C) / Temperature (°C)",
              "value": "210",
              "asFound": "210,2",
              "ref": "210",
              "unc": "2,0",
              "tol": "± 2",
              "conf": "A",
              "std": "LAB-THERMO.01"
          },
          {
              "parameter": "Tốc độ (C) / Speed (m/min)",
              "value": "15",
              "asFound": "2,01",
              "ref": "15",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TACHO.01"
          },
          {
              "parameter": "Tốc độ (C) / Speed (m/min)",
              "value": "30",
              "asFound": "5,01",
              "ref": "30",
              "unc": "0,6",
              "tol": "± 1",
              "conf": "A",
              "std": "LAB-TACHO.01"
          }
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
          INSERT INTO EQUIPMENT_TEMPLATES (NAME, MANUFACTURER, NEXT_DUE, EQUIPMENT_ID, PROCEDURE, REF_STANDARD, MODEL, SERIAL_NUMBER, MODEL_SERIAL, MANUFACTURER_ID, SPEC_RANGE, SPEC_RESOLUTION, STANDARDS_USED, NAME_VI, NAME_EN)
          VALUES (${t.name}, ${t.manufacturer}, ${t.next_due}, ${t.equipment_id}, ${t.procedure}, ${t.ref_standard}, ${t.model}, ${t.serial_number}, ${t.model_serial}, ${t.manufacturer_id}, ${t.spec_range}, ${t.spec_resolution}, ${t.standards_used}, ${t.name_vi}, ${t.name_en})
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
