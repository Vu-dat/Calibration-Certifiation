/**
 * upsert_14_new_equipments.js
 * 
 * Safely upserts the 14 new equipment templates (files 21 to 43) into PostgreSQL
 * without deleting existing equipment templates or certificates.
 */
require('dotenv').config({ override: true });
const sql = require('./db');

const newTemplates = [
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
    console.log("🚀 Starting upsert for 14 new equipment templates (files 21 to 43)...");

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

    console.log("🎉 All 14 equipment templates upserted successfully!");
  } catch (err) {
    console.error("❌ Upsert failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
