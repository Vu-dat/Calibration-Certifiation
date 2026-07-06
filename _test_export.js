// Test script to debug PDF export
const app = require('./server');
const { generatePDF } = require('./generate_pdf');
const sql = require('./db');

async function test() {
  try {
    // Step 1: Try saving data directly using saveCalibrationDataToDBHelper
    // We need to import the function from server.js
    console.log('Testing database connection...');
    const result = await sql`SELECT 1 as ok`;
    console.log('DB OK:', JSON.stringify(result));

    // Step 2: Try calling saveCalibrationDataToDBHelper-like code
    const cert_no = 'TEST001';
    const data = {
      instrumentName: 'Test Instrument',
      manufacturer: 'Test Mfr',
      model: 'Test Model',
      equipmentId: 'EQ-001',
      serialNumber: 'SN-001',
      customerName: 'Test Customer',
      customerAddress: '123 Test St',
      calDate: '2026-07-06',
      reCalDate: '2027-07-06',
      procedure: 'PROC-01',
      refStandard: 'ISO 1234',
      tempEnv: '25 C',
      humiEnv: '65%',
      headOfLab: 'Head',
      director: 'Director'
    };

    console.log('Attempting INSERT...');
    await sql`
      INSERT INTO CERTIFICATES 
      (CERT_NO, INSTRUMENT_NAME, MANUFACTURER, MODEL, EQUIPMENT_ID, SERIAL_NUMBER, CUSTOMER_NAME, CUSTOMER_ADDRESS, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR)
      VALUES (${cert_no}, ${data.instrumentName || ''}, ${data.manufacturer || ''}, ${data.model || ''}, ${data.equipmentId || ''}, ${data.serialNumber || ''}, ${data.customerName || ''}, ${data.customerAddress || ''}, ${data.calDate || ''}, ${data.reCalDate || ''}, ${data.procedure || ''}, ${data.refStandard || ''}, ${data.tempEnv || ''}, ${data.humiEnv || ''}, ${data.headOfLab || ''}, ${data.director || ''})
      ON CONFLICT (CERT_NO) DO UPDATE SET INSTRUMENT_NAME = EXCLUDED.INSTRUMENT_NAME
    `;
    console.log('INSERT OK');

    // Step 3: Try generatePDF directly
    console.log('Generating PDF...');
    await generatePDF({
      certNo: cert_no,
      downloadUrl: 'http://localhost:18080/static/GCN_TEST001.pdf',
      equipmentName: ''
    });
    console.log('PDF GENERATED OK');

    // Check file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'static', 'GCN_TEST001.pdf');
    if (fs.existsSync(filePath)) {
      console.log('FILE FOUND:', filePath, 'size:', fs.statSync(filePath).size);
    }

    process.exit(0);
  } catch (e) {
    console.error('TEST FAILED:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
}

setTimeout(test, 3000);
