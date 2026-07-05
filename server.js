const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
// exec removed — generator functions are called directly (not via child_process)
const { generatePDF } = require('./generate_pdf');
const { generateExcel } = require('./generate_excel');
const { generateDocx } = require('./generate_docx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 18080;

// Database connection (centralized) - Gọi file db.js mới của bạn
const sql = require('./db');

// Dò tìm IP LAN (ưu tiên không phải 127.0.0.1)
function getLANIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

// Lấy base URL
function getBaseUrl() {
    if (process.env.PUBLIC_URL) {
        return process.env.PUBLIC_URL.replace(/\/+$/, '');
    }
    const LAN_IP = getLANIP();
    return LAN_IP ? `http://${LAN_IP}:${port}` : `http://localhost:${port}`;
}

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Hàm khởi tạo và di chuyển cấu trúc bảng (Migration dữ liệu ban đầu)
async function initDatabaseSchema() {
    try {
        // 1. Tạo các bảng nền móng nếu chưa tồn tại (Dùng SERIAL thay cho AUTOINCREMENT của SQLite)
        await sql`CREATE TABLE IF NOT EXISTS CLOCK (
            ID TEXT PRIMARY KEY,
            KEY_FIELD TEXT,
            NAME TEXT NOT NULL,
            MANUFACTURER TEXT,
            MODEL TEXT,
            SERIAL_NUMBER TEXT,
            GCN TEXT,
            LINK TEXT,
            CAL_DATE TEXT,
            VALIDITY TEXT,
            TYPE TEXT DEFAULT 'standard',
            NOTES TEXT,
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS PROJECTS (
            ID TEXT PRIMARY KEY, 
            TITLE TEXT, 
            TECH TEXT, 
            STATUS TEXT, 
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS CUSTOMERS (
            ID TEXT PRIMARY KEY, NAME TEXT, COMPANY TEXT, PHONE TEXT, TAX TEXT, EMAIL TEXT, ADDRESS TEXT, BILLING_ADDRESS TEXT, CONTACT TEXT, NOTE TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS CERTIFICATES (
            CERT_NO TEXT PRIMARY KEY, INSTRUMENT_NAME TEXT, MANUFACTURER TEXT, MODEL TEXT, 
            EQUIPMENT_ID TEXT, SERIAL_NUMBER TEXT, CUSTOMER_NAME TEXT, CUSTOMER_ADDRESS TEXT, CAL_DATE TEXT, 
            RE_CAL_DATE TEXT, PROCEDURE TEXT, REF_STANDARD TEXT, TEMP_ENV TEXT, HUMI_ENV TEXT,
            HEAD_OF_LAB TEXT, DIRECTOR TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS CALIBRATION_POINTS (
            ID SERIAL PRIMARY KEY,
            CERT_NO TEXT,
            EQUIPMENT_NAME TEXT,
            PARAMETER_NAME TEXT,
            CAL_POINT TEXT,
            AS_FOUND_VALUE TEXT,
            REFERENCE_VALUE TEXT,
            UNCERTAINTY TEXT,
            TOLERANCE TEXT,
            CONFORMITY TEXT,
            REF_EQUIPMENT TEXT,
            STANDARD_EQUIPMENT TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS CERTIFICATE_STANDARDS (
            ID SERIAL PRIMARY KEY,
            CERT_NO TEXT,
            EQ_CODE TEXT,
            EQ_NAME TEXT,
            LINK TEXT,
            VALIDITY TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS ACTIVITY_LOGS (
            ID SERIAL PRIMARY KEY,
            USER_NAME TEXT DEFAULT 'Hệ thống / KTV',
            ACTION_TYPE TEXT,
            TARGET_TABLE TEXT,
            TARGET_ID TEXT,
            DESCRIPTION TEXT,
            TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS USERS (
            ID SERIAL PRIMARY KEY,
            USERNAME TEXT UNIQUE,
            PASSWORD TEXT,
            FULL_NAME TEXT,
            ROLE TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS EQUIPMENT_TEMPLATES (
            NAME TEXT PRIMARY KEY,
            MANUFACTURER TEXT,
            NEXT_DUE TEXT,
            EQUIPMENT_ID TEXT,
            PROCEDURE TEXT,
            REF_STANDARD TEXT
        )`;

        await sql`CREATE TABLE IF NOT EXISTS TEMPLATE_POINTS (
            ID SERIAL PRIMARY KEY,
            TEMPLATE_NAME TEXT,
            PARAMETER_NAME TEXT,
            CAL_POINT TEXT,
            AS_FOUND_VALUE TEXT,
            REFERENCE_VALUE TEXT,
            UNCERTAINTY TEXT,
            TOLERANCE TEXT,
            CONFORMITY TEXT,
            STANDARD_EQUIPMENT TEXT
        )`;

        console.log("✅ Hệ thống bảng Supabase khởi tạo/đồng bộ cấu trúc thành công.");
        
        // Thực hiện nạp dữ liệu mặc định ban đầu
        await seedDefaultClockData();
        await migrateOrphanCalibrationPoints();

    } catch (err) {
        console.error("❌ Lỗi nghiêm trọng khi khởi tạo cơ sở dữ liệu:", err.message);
    }
}

// Hàm tự động nạp dữ liệu từ seed_clock_data.json vào Supabase
async function seedDefaultClockData() {
    const jsonPath = path.join(__dirname, 'seed_clock_data.json');
    if (!fs.existsSync(jsonPath)) {
        console.warn("⚠️ Không tìm thấy seed_clock_data.json để seed dữ liệu CLOCK.");
        return;
    }

    try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const items = JSON.parse(raw);
        
        // Đọc danh sách hiện tại để tránh xung đột khoá chính (Upsert/Ignore)
        for (const item of items) {
            await sql`
                INSERT INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
                VALUES (
                    ${item.id}, ${item.key || ''}, ${item.name || `Thiết bị chuẩn ${item.id}`}, 
                    ${item.nsx || ''}, ${item.model || ''}, ${item.serial || ''}, 
                    ${item.gcn || ''}, ${item.lienKet || ''}, ${item.calDate || '1900-12-31'}, 
                    ${item.validity || '1900-12-31'}, 'standard'
                )
                ON CONFLICT (ID) DO NOTHING
            `;
        }
        console.log("✅ Đã kiểm tra và seed dữ liệu CLOCK lên Supabase thành công.");
    } catch (err) {
        console.error("❌ Lỗi đọc và seed dữ liệu CLOCK:", err.message);
    }
}

// Xử lý dọn dữ liệu mồ côi (Migration logic cũ từ dự án của bạn)
async function migrateOrphanCalibrationPoints() {
    try {
        const orphanCerts = await sql`
            SELECT DISTINCT cp.CERT_NO, c.INSTRUMENT_NAME
            FROM CALIBRATION_POINTS cp
            LEFT JOIN CERTIFICATES c ON cp.CERT_NO = c.CERT_NO
            WHERE cp.EQUIPMENT_NAME IS NULL OR cp.EQUIPMENT_NAME = ''
        `;

        if (!orphanCerts || orphanCerts.length === 0) {
            console.log('✅ Không có dòng CALIBRATION_POINTS cũ cần dọn dẹp.');
            return;
        }

        console.log(`⚠️ Phát hiện ${orphanCerts.length} chứng nhận mồ côi. Đang xử lý...`);
        for (const row of orphanCerts) {
            const certNo = row.cert_no;
            const instrName = row.instrument_name || '';

            if (instrName) {
                await sql`
                    UPDATE CALIBRATION_POINTS 
                    SET EQUIPMENT_NAME = ${instrName} 
                    WHERE CERT_NO = ${certNo} AND (EQUIPMENT_NAME IS NULL OR EQUIPMENT_NAME = '')
                `;
            } else {
                await sql`
                    DELETE FROM CALIBRATION_POINTS 
                    WHERE CERT_NO = ${certNo} AND (EQUIPMENT_NAME IS NULL OR EQUIPMENT_NAME = '')
                `;
            }
        }
        console.log('✅ Hoàn tất đồng bộ dữ liệu mồ côi trên Cloud.');
    } catch (err) {
        console.error('❌ Lỗi xử lý dọn dẹp dữ liệu cũ:', err.message);
    }
}

// Hàm tiện ích ghi log hoạt động ngầm độc lập
async function logActivity(userName, actionType, targetTable, targetId, description) {
    try {
        await sql`
            INSERT INTO ACTIVITY_LOGS (USER_NAME, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
            VALUES (${userName}, ${actionType}, ${targetTable}, ${targetId}, ${description})
        `;
    } catch (err) {
        console.error("❌ Lỗi ghi log hệ thống:", err.message);
    }
}

// Gọi tiến trình đồng bộ cấu trúc database lúc khởi động
initDatabaseSchema();

// ================= API CRUD CHO BẢNG CLOCK =================

app.get('/api/clock', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM CLOCK ORDER BY ID ASC`;
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/clock/search', async (req, res) => {
    const q = (req.query.q || '').toString().trim();
    try {
        if (!q) {
            const rows = await sql`SELECT * FROM CLOCK ORDER BY NAME ASC LIMIT 10`;
            return res.json(rows);
        }

        const queryStr = `%${q}%`;
        const rows = await sql`
            SELECT *,
                CASE
                    WHEN UPPER(ID) = UPPER(${q}) OR UPPER(NAME) = UPPER(${q}) THEN 0
                    WHEN UPPER(ID) LIKE UPPER(${queryStr}) OR UPPER(NAME) LIKE UPPER(${queryStr}) THEN 1
                    ELSE 2
                END AS RELEVANCE
            FROM CLOCK
            WHERE UPPER(ID) LIKE UPPER(${queryStr})
               OR UPPER(NAME) LIKE UPPER(${queryStr})
               OR UPPER(MANUFACTURER) LIKE UPPER(${queryStr})
               OR UPPER(MODEL) LIKE UPPER(${queryStr})
               OR UPPER(SERIAL_NUMBER) LIKE UPPER(${queryStr})
               OR UPPER(KEY_FIELD) LIKE UPPER(${queryStr})
            ORDER BY RELEVANCE ASC, NAME ASC
            LIMIT 15
        `;
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/clock/add', async (req, res) => {
    const b = req.body || {};
    const id = (b.EQUIPMENT_ID || b.id || b.ID || '').toString().trim();
    const name = (b.NAME || b.name || '').toString().trim();

    if (!id || !name) {
        return res.status(400).json({ success: false, message: "Thiếu Mã thiết bị (ID) hoặc Tên thiết bị chuẩn!" });
    }

    try {
        await sql`
            INSERT INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
            VALUES (
                ${id}, ${b.KEY_FIELD || b.key_field || ''}, ${name}, ${b.MANUFACTURER || b.manufacturer || ''},
                ${b.MODEL || b.model || ''}, ${b.SERIAL_NUMBER || b.serial_number || ''}, ${b.GCN || b.gcn || ''},
                ${b.LINK || b.link || ''}, ${b.CAL_DATE || b.cal_date || ''}, ${b.VALIDITY || b.validity || '1900-12-31'},
                ${b.TYPE || b.type || 'standard'}
            )
            ON CONFLICT (ID) DO UPDATE SET
                KEY_FIELD = EXCLUDED.KEY_FIELD, NAME = EXCLUDED.NAME, MANUFACTURER = EXCLUDED.MANUFACTURER,
                MODEL = EXCLUDED.MODEL, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, GCN = EXCLUDED.GCN,
                LINK = EXCLUDED.LINK, CAL_DATE = EXCLUDED.CAL_DATE, VALIDITY = EXCLUDED.VALIDITY, TYPE = EXCLUDED.TYPE
        `;
        logActivity("Hệ thống / KTV", "CREATE", "CLOCK", id, `Thêm mới thiết bị chuẩn: ${name}`);
        res.json({ success: true, message: "Thêm mới thiết bị chuẩn thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/clock', async (req, res) => {
    const b = req.body || {};
    const id = b.id || b.ID || b.EQUIPMENT_ID;
    const name = b.name || b.NAME;

    if (!id || !name) {
        return res.status(400).json({ success: false, message: "Thiếu mã định danh (ID) hoặc tên thiết bị!" });
    }

    try {
        await sql`
            INSERT INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
            VALUES (
                ${id}, ${b.key_field || b.KEY_FIELD || ''}, ${name}, ${b.manufacturer || b.MANUFACTURER || ''},
                ${b.model || b.MODEL || ''}, ${b.serial_number || b.SERIAL_NUMBER || ''}, ${b.gcn || b.GCN || ''},
                ${b.link || b.LINK || ''}, ${b.cal_date || b.CAL_DATE || ''}, ${b.validity || b.VALIDITY || ''},
                ${b.type || b.TYPE || 'standard'}
            )
            ON CONFLICT (ID) DO UPDATE SET
                KEY_FIELD = EXCLUDED.KEY_FIELD, NAME = EXCLUDED.NAME, MANUFACTURER = EXCLUDED.MANUFACTURER,
                MODEL = EXCLUDED.MODEL, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, GCN = EXCLUDED.GCN,
                LINK = EXCLUDED.LINK, CAL_DATE = EXCLUDED.CAL_DATE, VALIDITY = EXCLUDED.VALIDITY, TYPE = EXCLUDED.TYPE
        `;
        logActivity("Hệ thống / KTV", "UPDATE", "CLOCK", id, `Cập nhật thiết bị chuẩn trong bảng CLOCK: ${name}`);
        res.json({ success: true, message: "Lưu thông tin thiết bị chuẩn thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/clock/bulk', async (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: "Dữ liệu gửi lên không phải là mảng!" });
    }

    try {
        for (const item of items) {
            const finalId = item.code || `EQ-${item.stt}`;
            const nameLower = (item.name || '').toLowerCase();
            const type = (nameLower.includes('nhiệt') || nameLower.includes('temp')) ? 'temperature' : 'standard';
            
            await sql`
                INSERT INTO CLOCK (ID, KEY_FIELD, NAME, MANUFACTURER, MODEL, SERIAL_NUMBER, GCN, LINK, CAL_DATE, VALIDITY, TYPE)
                VALUES (${finalId}, ${item.key || ''}, ${item.name || ''}, ${item.nsx || ''}, ${item.model || ''}, ${item.serial || ''}, ${item.gcn || ''}, ${item.lienKet || ''}, ${item.calDate || ''}, ${item.nextDate || ''}, ${type})
                ON CONFLICT (ID) DO UPDATE SET
                    KEY_FIELD = EXCLUDED.KEY_FIELD, NAME = EXCLUDED.NAME, MANUFACTURER = EXCLUDED.MANUFACTURER, MODEL = EXCLUDED.MODEL, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, GCN = EXCLUDED.GCN, LINK = EXCLUDED.LINK, CAL_DATE = EXCLUDED.CAL_DATE, VALIDITY = EXCLUDED.VALIDITY, TYPE = EXCLUDED.TYPE
            `;
        }
        logActivity("Hệ thống", "IMPORT", "CLOCK", "ALL", `Đã import hàng loạt ${items.length} thiết bị vào bảng CLOCK`);
        res.json({ success: true, message: `Đã đồng bộ ${items.length} thiết bị vào Database thành công!` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/clock/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await sql`DELETE FROM CLOCK WHERE ID = ${id}`;
        logActivity("Quản trị viên", "DELETE", "CLOCK", id, `Đã xóa thiết bị chuẩn ID: ${id}`);
        res.json({ success: true, message: "Xóa thiết bị chuẩn thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API QUẢN LÝ DỰ ÁN =================

app.get('/api/projects', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM PROJECTS ORDER BY CREATED_AT DESC`;
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    let { id, title, tech, status } = req.body;

    try {
        let finalId = id;
        if (!finalId) {
            const lastRow = await sql`SELECT ID FROM PROJECTS WHERE ID LIKE 'PRJ-%' ORDER BY ID DESC LIMIT 1`;
            let nextNum = 1;
            if (lastRow.length > 0 && lastRow[0].id) {
                const parts = lastRow[0].id.split('-');
                const lastNum = parseInt(parts[1]);
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
            finalId = `PRJ-${String(nextNum).padStart(6, '0')}`;
        }

        const existing = await sql`SELECT ID FROM PROJECTS WHERE ID = ${finalId}`;
        const isNew = existing.length === 0;
        const action = isNew ? "CREATE" : "UPDATE";
        const desc = isNew ? `Tạo mới dự án: "${title}"` : `Cập nhật trạng thái dự án "${title}" thành [${status}]`;

        await sql`
            INSERT INTO PROJECTS (ID, TITLE, TECH, STATUS) 
            VALUES (${finalId}, ${title}, ${tech}, ${status})
            ON CONFLICT (ID) DO UPDATE SET TITLE = EXCLUDED.TITLE, TECH = EXCLUDED.TECH, STATUS = EXCLUDED.STATUS
        `;

        logActivity(tech || "Hệ thống / KTV", action, "PROJECTS", finalId, desc);
        res.json({ success: true, id: finalId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const row = await sql`SELECT TITLE FROM PROJECTS WHERE ID = ${id}`;
        const title = row.length > 0 ? row[0].title : "Không rõ tên";
        
        await sql`DELETE FROM PROJECTS WHERE ID = ${id}`;
        logActivity("Quản trị viên", "DELETE", "PROJECTS", id, `Đã xóa dự án: "${title}"`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API HIỆU CHUẨN & WORKSPACE =================

app.get('/api/calibration/:certNo', async (req, res) => {
    const certNo = req.params.certNo;
    const eqName = req.query.equipment_name || '';
    try {
        const certRows = await sql`SELECT * FROM CERTIFICATES WHERE CERT_NO = ${certNo}`;
        if (certRows.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy số GCN" });

        let points;
        if (eqName) {
            points = await sql`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ${certNo} AND EQUIPMENT_NAME = ${eqName}`;
        } else {
            points = await sql`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ${certNo}`;
        }

        const standards = await sql`SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ${certNo}`;
        res.json({ cert: certRows[0], points, standards });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/calibration/save', async (req, res) => {
    const data = req.body;
    const currentWorker = req.body.currentUser || "Hệ thống / KTV";

    try {
        logActivity(currentWorker, "UPDATE", "CERTIFICATES", data.certNo, `Cập nhật số liệu đo...`);

        await sql`
            INSERT INTO CERTIFICATES 
            (CERT_NO, INSTRUMENT_NAME, MANUFACTURER, MODEL, EQUIPMENT_ID, SERIAL_NUMBER, CUSTOMER_NAME, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR) 
            VALUES (${data.certNo}, ${data.instrumentName}, ${data.manufacturer}, ${data.model}, ${data.equipmentId}, ${data.serialNumber}, ${data.customerName}, ${data.calDate}, ${data.reCalDate}, ${data.procedure}, ${data.refStandard}, ${data.tempEnv}, ${data.humiEnv}, ${data.headOfLab}, ${data.director})
            ON CONFLICT (CERT_NO) DO UPDATE SET 
                INSTRUMENT_NAME = EXCLUDED.INSTRUMENT_NAME, MANUFACTURER = EXCLUDED.MANUFACTURER, MODEL = EXCLUDED.MODEL, EQUIPMENT_ID = EXCLUDED.EQUIPMENT_ID, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, CUSTOMER_NAME = EXCLUDED.CUSTOMER_NAME, CAL_DATE = EXCLUDED.CAL_DATE, RE_CAL_DATE = EXCLUDED.RE_CAL_DATE, PROCEDURE = EXCLUDED.PROCEDURE, REF_STANDARD = EXCLUDED.REF_STANDARD, TEMP_ENV = EXCLUDED.TEMP_ENV, HUMI_ENV = EXCLUDED.HUMI_ENV, HEAD_OF_LAB = EXCLUDED.HEAD_OF_LAB, DIRECTOR = EXCLUDED.DIRECTOR
        `;

        await sql`DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ${data.certNo}`;
        
        if (data.equipmentName) {
            await sql`DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ${data.certNo} AND EQUIPMENT_NAME = ${data.equipmentName}`;
        } else {
            await sql`DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ${data.certNo}`;
        }

        const eqName = data.equipmentName || '';
        if (data.points && data.points.length > 0) {
            for (const p of data.points) {
                const refEqValue = p.refEq || p.standardEquipment || p.refEquipment || '';
                const refValValue = p.referenceValue || p.refValue || p.reference_value || '';
                await sql`
                    INSERT INTO CALIBRATION_POINTS 
                    (CERT_NO, EQUIPMENT_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, REFERENCE_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, REF_EQUIPMENT, STANDARD_EQUIPMENT) 
                    VALUES (${data.certNo}, ${eqName}, ${p.parameterName}, ${p.calPoint}, ${p.asFoundValue}, ${refValValue}, ${p.uncertainty}, ${p.tolerance}, ${p.conformity}, ${refEqValue}, ${refEqValue})
                `;
            }
        }

        logActivity(currentWorker, "UPDATE", "CERTIFICATES", data.certNo, `Cập nhật số liệu kết quả đo cho thiết bị ${data.instrumentName} (Mã chuẩn: ${data.equipmentId})`);
        res.json({ success: true, message: "Dữ liệu hiệu chuẩn đã được ghi nhận vào SQL ổn định!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API MẪU THIẾT BỊ =================

async function getEquipmentTemplatesHelper(res) {
    try {
        const templates = await sql`SELECT * FROM EQUIPMENT_TEMPLATES`;
        if (templates.length === 0) return res.json([]);

        for (let template of templates) {
            // PostgreSQL trả về tên trường ở dạng viết thường, ánh xạ lại sang chữ IN HOA để giữ tương thích frontend của bạn
            const templateName = template.name || template.NAME;
            const points = await sql`SELECT * FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ${templateName} ORDER BY ID ASC`;
            
            // Map sang key IN HOA cho frontend cũ nhận diện đúng
            template.NAME = template.name;
            template.MANUFACTURER = template.manufacturer;
            template.NEXT_DUE = template.next_due;
            template.EQUIPMENT_ID = template.equipment_id;
            template.PROCEDURE = template.procedure;
            template.REF_STANDARD = template.ref_standard;
            template.formPoints = points;
        }
        res.json(templates);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

app.get('/api/equipment-templates', async (req, res) => {
    await getEquipmentTemplatesHelper(res);
});

app.get('/api/equipment', async (req, res) => {
    await getEquipmentTemplatesHelper(res);
});

app.post('/api/equipment', async (req, res) => {
    try {
        const { equipment_id, standard_name, manufacturer, due_date, procedure, ref_standard, points } = req.body;

        if (!equipment_id || !standard_name) {
            return res.status(400).json({ success: false, message: "Thiếu mã nhận diện hoặc tên thiết bị chuẩn!" });
        }

        await sql`
            INSERT INTO EQUIPMENT_TEMPLATES (NAME, MANUFACTURER, NEXT_DUE, EQUIPMENT_ID, PROCEDURE, REF_STANDARD)
            VALUES (${standard_name}, ${manufacturer || ''}, ${due_date || ''}, ${equipment_id}, ${procedure || ''}, ${ref_standard || ''})
            ON CONFLICT (NAME) DO UPDATE SET MANUFACTURER = EXCLUDED.MANUFACTURER, NEXT_DUE = EXCLUDED.NEXT_DUE, EQUIPMENT_ID = EXCLUDED.EQUIPMENT_ID, PROCEDURE = EXCLUDED.PROCEDURE, REF_STANDARD = EXCLUDED.REF_STANDARD
        `;

        await sql`DELETE FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ${standard_name}`;

        if (points && points.length > 0) {
            for (const p of points) {
                await sql`
                    INSERT INTO TEMPLATE_POINTS (TEMPLATE_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, REFERENCE_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, STANDARD_EQUIPMENT)
                    VALUES (${standard_name}, ${p.parameter || p.parameterName || ''}, ${p.value || p.calPoint || ''}, ${p.asFoundValue || ''}, ${p.referenceValue || p.refValue || ''}, ${p.uncertainty || ''}, ${p.tolerance || ''}, ${p.conformity || ''}, ${p.standardEquipment || ''})
                `;
            }
        }

        logActivity("Hệ thống / KTV", "UPDATE", "EQUIPMENT_TEMPLATES", equipment_id, `Lưu mẫu thiết bị: ${standard_name}`);
        return res.json({ success: true, message: `Thiết bị chuẩn "${standard_name}" đã được lưu thành công!` });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi xử lý API nội bộ.", error: err.message });
    }
});

app.delete('/api/equipment-templates/:name', async (req, res) => {
    const name = req.params.name;
    try {
        await sql`DELETE FROM TEMPLATE_POINTS WHERE TEMPLATE_NAME = ${name}`;
        await sql`DELETE FROM EQUIPMENT_TEMPLATES WHERE NAME = ${name}`;
        logActivity("Hệ thống", "DELETE", "EQUIPMENT_TEMPLATES", name, `Đã xóa mẫu thiết bị: ${name}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API QUẢN LÝ KHÁCH HÀNG =================

app.get('/api/customers', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM CUSTOMERS ORDER BY ID DESC`;
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    let { id, name, company, phone, tax, email, address, billing_address, contact, note } = req.body;

    if (!name || !company || !phone) {
        return res.status(400).json({ success: false, error: "Thiếu thông tin bắt buộc: Tên đại diện, Công ty, Số điện thoại" });
    }

    try {
        let finalId = id;
        if (!finalId) {
            const lastRow = await sql`SELECT ID FROM CUSTOMERS WHERE ID LIKE 'CUST-%' ORDER BY ID DESC LIMIT 1`;
            let nextNum = 1;
            if (lastRow.length > 0 && lastRow[0].id) {
                const match = lastRow[0].id.match(/CUST-(\d+)/);
                if (match) nextNum = parseInt(match[1]) + 1;
            }
            finalId = `CUST-${String(nextNum).padStart(6, '0')}`;
        }

        const isNew = (!id);
        const action = isNew ? "CREATE" : "UPDATE";
        const desc = isNew ? `Thêm mới đối tác: "${name.trim()}" (${company.trim()})` : `Cập nhật thông tin đối tác: "${name.trim()}" (${finalId})`;

        await sql`
            INSERT INTO CUSTOMERS (ID, NAME, COMPANY, PHONE, TAX, EMAIL, ADDRESS, BILLING_ADDRESS, CONTACT, NOTE)
            VALUES (${finalId}, ${name.trim()}, ${company.trim()}, ${phone.trim()}, ${(tax || '').trim()}, ${(email || '').trim()}, ${(address || '').trim()}, ${(billing_address || '').trim()}, ${(contact || '').trim()}, ${(note || '').trim()})
            ON CONFLICT (ID) DO UPDATE SET NAME = EXCLUDED.NAME, COMPANY = EXCLUDED.COMPANY, PHONE = EXCLUDED.PHONE, TAX = EXCLUDED.TAX, EMAIL = EXCLUDED.EMAIL, ADDRESS = EXCLUDED.ADDRESS, BILLING_ADDRESS = EXCLUDED.BILLING_ADDRESS, CONTACT = EXCLUDED.CONTACT, NOTE = EXCLUDED.NOTE
        `;

        logActivity("Hệ thống / KTV", action, "CUSTOMERS", finalId, desc);
        return res.json({ success: true, id: finalId, message: isNew ? "Thêm khách hàng thành công" : "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const row = await sql`SELECT NAME, COMPANY FROM CUSTOMERS WHERE ID = ${id}`;
        const info = row.length > 0 ? `${row[0].name || ''} - ${row[0].company || ''}` : id;

        const result = await sql`DELETE FROM CUSTOMERS WHERE ID = ${id} RETURNING *`;
        if (result.length === 0) return res.status(404).json({ success: false, error: "Không tìm thấy khách hàng" });

        logActivity("Quản trị viên", "DELETE", "CUSTOMERS", id, `Đã xóa hồ sơ: ${info}`);
        res.json({ success: true, message: `Đã xóa thành công khách hàng ${id}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= NHẬT KÝ & THỐNG KÊ =================

app.get('/api/audit-logs', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM ACTIVITY_LOGS ORDER BY TIMESTAMP DESC LIMIT 200`;
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/stats/summary', async (req, res) => {
    try {
        const row = await sql`SELECT COUNT(*) as cert_count FROM CERTIFICATES`;
        res.json({ certCount: parseInt(row[0].cert_count) || 0 });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Tạo thư mục static
const staticDir = path.join(__dirname, 'static');
if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true });

// Hàm helper xuất file đồng bộ cơ sở dữ liệu trước khi xử lý
async function saveCalibrationDataToDBHelper(data, cert_no) {
    await sql`
        INSERT INTO CERTIFICATES 
        (CERT_NO, INSTRUMENT_NAME, MANUFACTURER, MODEL, EQUIPMENT_ID, SERIAL_NUMBER, CUSTOMER_NAME, CUSTOMER_ADDRESS, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR)
        VALUES (${cert_no}, ${data.instrumentName || data.instrument_name || ''}, ${data.manufacturer || ''}, ${data.model || ''}, ${data.equipmentId || data.equipment_id || ''}, ${data.serialNumber || data.serial_number || ''}, ${data.customerName || data.customer_name || ''}, ${data.customerAddress || data.customer_address || ''}, ${data.calDate || data.cal_date || ''}, ${data.reCalDate || data.re_cal_date || ''}, ${data.procedure || ''}, ${data.refStandard || data.ref_standard || ''}, ${data.tempEnv || data.temp_env || ''}, ${data.humiEnv || data.humi_env || ''}, ${data.headOfLab || data.head_of_lab || ''}, ${data.director || ''})
        ON CONFLICT (CERT_NO) DO UPDATE SET INSTRUMENT_NAME = EXCLUDED.INSTRUMENT_NAME, MANUFACTURER = EXCLUDED.MANUFACTURER, MODEL = EXCLUDED.MODEL, EQUIPMENT_ID = EXCLUDED.EQUIPMENT_ID, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, CUSTOMER_NAME = EXCLUDED.CUSTOMER_NAME, CUSTOMER_ADDRESS = EXCLUDED.CUSTOMER_ADDRESS, CAL_DATE = EXCLUDED.CAL_DATE, RE_CAL_DATE = EXCLUDED.RE_CAL_DATE, PROCEDURE = EXCLUDED.PROCEDURE, REF_STANDARD = EXCLUDED.REF_STANDARD, TEMP_ENV = EXCLUDED.TEMP_ENV, HUMI_ENV = EXCLUDED.HUMI_ENV, HEAD_OF_LAB = EXCLUDED.HEAD_OF_LAB, DIRECTOR = EXCLUDED.DIRECTOR
    `;

    const eqName = data.equipmentName || data.equipment_name || '';
    if (eqName) {
        await sql`DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ${cert_no} AND EQUIPMENT_NAME = ${eqName}`;
    } else {
        await sql`DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = ${cert_no}`;
    }
    await sql`DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ${cert_no}`;

    const points = data.points || [];
    if (points.length > 0) {
        for (const p of points) {
            const standardVal = p.refEq || p.standardEquipment || p.standard_equipment || '';
            await sql`
                INSERT INTO CALIBRATION_POINTS (CERT_NO, EQUIPMENT_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, REFERENCE_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, REF_EQUIPMENT, STANDARD_EQUIPMENT)
                VALUES (${cert_no}, ${eqName}, ${p.parameterName || p.param || ''}, ${p.calPoint || p.point || ''}, ${p.asFoundValue || p.found || ''}, ${p.referenceValue || p.refValue || p.reference_value || ''}, ${p.uncertainty || p.unc || ''}, ${p.tolerance || p.tol || ''}, ${p.conformity || p.conf || ''}, ${standardVal}, ${standardVal})
            `;
        }
    }

    const stds = data.standards || [];
    if (stds.length > 0) {
        for (const s of stds) {
            await sql`
                INSERT INTO CERTIFICATE_STANDARDS (CERT_NO, EQ_CODE, EQ_NAME, LINK, VALIDITY)
                VALUES (${cert_no}, ${s.id || s.code || ''}, ${s.name || ''}, ${s.trace || s.link || ''}, ${s.due || s.validity || ''})
            `;
        }
    }
}

// ================= EXPORT CHỨNG NHẬN =================

app.post('/api/calibration/export-pdf', async (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });

    try {
        await saveCalibrationDataToDBHelper(data, cert_no);
        const downloadUrl = data.downloadUrl || `${getBaseUrl()}/static/GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        const eqName = data.equipmentName || data.equipment_name || '';

        await generatePDF({ certNo: cert_no, downloadUrl, equipmentName: eqName });
        const fileName = `GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        
        logActivity("Hệ thống / KTV", "EXPORT_PDF", "CERTIFICATES", cert_no, `Xuất PDF: ${fileName}`);
        res.json({ success: true, message: `Đã xuất thành công ${fileName}`, file_url: `${getBaseUrl()}/static/${fileName}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/calibration/export-excel', async (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });

    try {
        await saveCalibrationDataToDBHelper(data, cert_no);
        await generateExcel({ certNo: cert_no });
        const fileName = `GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
        logActivity("Hệ thống / KTV", "EXPORT_EXCEL", "CERTIFICATES", cert_no, `Xuất Excel: ${fileName}`);
        res.json({ success: true, message: `Đã xuất thành công ${fileName}`, file_url: `${getBaseUrl()}/static/${fileName}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/calibration/export-docx', async (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });

    try {
        await saveCalibrationDataToDBHelper(data, cert_no);
        const fileName = `GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
        const downloadUrl = `${getBaseUrl()}/static/${fileName}`;

        await generateDocx({ certNo: cert_no, downloadUrl });
        logActivity("Hệ thống / KTV", "EXPORT_DOCX", "CERTIFICATES", cert_no, `Xuất Word: ${fileName}`);
        res.json({ success: true, message: `Đã xuất thành công ${fileName}`, file_url: `${getBaseUrl()}/static/${fileName}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API THÔNG TIN SERVER & LOGIN =================

app.get('/api/server/info', (req, res) => {
    res.json({ baseUrl: getBaseUrl(), lanIp: getLANIP(), port: port, publicUrl: process.env.PUBLIC_URL || null });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const rows = await sql`SELECT * FROM USERS WHERE USERNAME = ${username} AND PASSWORD = ${password}`;
        if (rows.length === 0) return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
        
        const user = rows[0];
        res.json({ success: true, user: { username: user.username, fullName: user.full_name, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    const projectId = req.params.id;
    try {
        const rows = await sql`
            SELECT p.*, e.NAME as EQUIPMENT_NAME 
            FROM PROJECTS p
            LEFT JOIN EQUIPMENT_TEMPLATES e ON p.ID = e.EQUIPMENT_ID
            WHERE p.ID = ${projectId}
        `;
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy dự án!" });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Export app for Vercel serverless, or listen directly for local dev
if (require.main === module) {
    app.listen(port, () => {
        console.log(`[LabMaster Enterprise OS] Backend API Cloud đang chạy mượt mà tại cổng: http://localhost:${port}`);
    });
}

module.exports = app;