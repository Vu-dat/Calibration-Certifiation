const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const bcrypt = require('bcryptjs');
// exec removed — generator functions are called directly (not via child_process)
const { generatePDF } = require('./generate_pdf');
const { generateExcel } = require('./generate_excel');
const { generateDocx } = require('./generate_docx');
// Supabase Storage — graceful fallback nếu module không load được (VD: trên Vercel)
let uploadToSupabase, getPublicUrl, isConfigured, BUCKET_NAME;
try {
    const storage = require('./storage');
    uploadToSupabase = storage.uploadToSupabase;
    getPublicUrl = storage.getPublicUrl;
    isConfigured = storage.isConfigured;
    BUCKET_NAME = storage.BUCKET_NAME;
} catch (e) {
    console.warn('⚠️ Không thể load storage module (Supabase Storage không khả dụng):', e.message);
    uploadToSupabase = async () => ({ success: false, reason: 'module_error', error: e.message });
    getPublicUrl = () => null;
    isConfigured = () => false;
    BUCKET_NAME = 'certificates';
}
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 18080;

const SALT_ROUNDS = 10;

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

// Static file handler tùy chỉnh — serve từ cả public/ và static/ với Content-Disposition cho file export
app.use((req, res, next) => {
    const reqPath = req.path;
    
    // Chỉ xử lý GET/HEAD (Express tự xử lý body cho HEAD)
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    
    // Map request path → thư mục gốc
    let rootDir = null;
    if (reqPath === '/' || reqPath.startsWith('/api/')) {
        // API requests — không xử lý ở đây
        return next();
    }
    
    // Xác định root directory dựa trên path prefix
    // Lưu ý: /api/static/ được xử lý bởi route handler riêng (app.get('/api/static/:filename') bên dưới)
    if (reqPath.startsWith('/static/')) {
        rootDir = path.join(__dirname, 'static');
        safeFile = path.basename(reqPath);
        filePath = path.join(rootDir, safeFile);
        if (!fs.existsSync(filePath)) filePath = null;
    } else {
        // public/: files có thể trong thư mục con (css/, js/, fonts/...)
        // → dùng full path, kiểm tra an toàn
        rootDir = path.join(__dirname, 'public');
        const resolved = path.resolve(rootDir, '.' + reqPath);
        const rootResolved = path.resolve(rootDir);
        if (!resolved.startsWith(rootResolved + path.sep) && resolved !== rootResolved) {
            return next(); // directory traversal attempt
        }
        safeFile = path.basename(reqPath);
        filePath = resolved;
        if (!fs.existsSync(filePath)) filePath = null;
    }
    
    if (!filePath) return next();
    const ext = path.extname(safeFile).toLowerCase();
    const buf = fs.readFileSync(filePath);
    const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.pdf': 'application/pdf',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.json': 'application/json',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    
    // Thêm Content-Disposition: attachment cho file export
    const headers = {
        'Content-Type': contentType,
        'Content-Length': buf.length,
        'Access-Control-Allow-Origin': '*'
    };
    if (ext === '.docx' || ext === '.pdf' || ext === '.xlsx') {
        headers['Content-Disposition'] = 'attachment; filename="' + safeFile + '"';
    }
    
    res.writeHead(200, headers);
    res.end(buf);
});

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
            CERT_NO TEXT PRIMARY KEY, INSTRUMENT_NAME TEXT, INSTRUMENT_NAME_EN TEXT, MANUFACTURER TEXT, MANUFACTURER_ID TEXT, MODEL TEXT, MODEL_SERIAL TEXT,
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
            STD_CERT_NO TEXT,
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
            REF_STANDARD TEXT,
            MODEL TEXT,
            SERIAL_NUMBER TEXT,
            MODEL_SERIAL TEXT,
            MANUFACTURER_ID TEXT,
            SPEC_RANGE TEXT,
            SPEC_RESOLUTION TEXT,
            STANDARDS_USED TEXT,
            NAME_VI TEXT
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

        // Thêm cột STD_CERT_NO nếu chưa có (dành cho DB cũ)
        try {
            await sql`ALTER TABLE CERTIFICATE_STANDARDS ADD COLUMN IF NOT EXISTS STD_CERT_NO TEXT`;
            await sql`ALTER TABLE EQUIPMENT_TEMPLATES ADD COLUMN IF NOT EXISTS NAME_VI TEXT`;
        } catch(e) { /* ignore if column already exists */ }

        // Thực hiện nạp dữ liệu mặc định ban đầu
        await seedDefaultClockData();
        await migrateOrphanCalibrationPoints();

    } catch (err) {
        console.error("❌ Lỗi nghiêm trọng khi khởi tạo cơ sở dữ liệu:", err.message);
        throw err;
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

// Seed user admin mặc định nếu USERS trống
async function seedDefaultUsers() {
    try {
        // Always ensure admin account exists (re-hash if necessary)
        const adminExists = await sql`SELECT USERNAME FROM USERS WHERE USERNAME = 'admin'`;
        if (adminExists.length > 0) {
            // Re-hash admin password on every startup for migration from plaintext
            const hashedPw = await bcrypt.hash('admin', SALT_ROUNDS);
            await sql`UPDATE USERS SET PASSWORD = ${hashedPw}, FULL_NAME = 'Quản trị viên', ROLE = 'admin' WHERE USERNAME = 'admin'`;
            console.log('✅ Đã cập nhật mật khẩu admin');
        } else {
            const hashedPassword = await bcrypt.hash('admin', SALT_ROUNDS);
            await sql`
                INSERT INTO USERS (USERNAME, PASSWORD, FULL_NAME, ROLE)
                VALUES ('admin', ${hashedPassword}, 'Quản trị viên', 'admin')
                ON CONFLICT (USERNAME) DO NOTHING
            `;
            console.log("✅ Đã tạo tài khoản admin mặc định (admin/admin)");
        }
    } catch (err) {
        console.error("❌ Lỗi seed user mặc định:", err.message);
        throw err;
    }
}

// Migration cột mới: chạy mỗi lần khởi động để đảm bảo các cột tồn tại
async function runColumnMigrations() {
    try {
        await sql.unsafe(`
            ALTER TABLE CERTIFICATES ADD COLUMN IF NOT EXISTS INSTRUMENT_NAME_EN TEXT;
            ALTER TABLE CERTIFICATES ADD COLUMN IF NOT EXISTS MANUFACTURER_ID TEXT;
            ALTER TABLE CERTIFICATES ADD COLUMN IF NOT EXISTS MODEL_SERIAL TEXT;
            ALTER TABLE CERTIFICATES ADD COLUMN IF NOT EXISTS SPEC_RANGE TEXT;
            ALTER TABLE CERTIFICATES ADD COLUMN IF NOT EXISTS SPEC_RESOLUTION TEXT;
            
            CREATE TABLE IF NOT EXISTS CALIBRATE_METHOD (
                ID SERIAL PRIMARY KEY,
                STT INTEGER NOT NULL,
                TEN_VN TEXT NOT NULL,
                TEN_EN TEXT,
                MO_TA TEXT,
                PHAM_VI_DO TEXT,
                QUY_TRINH TEXT,
                CMC TEXT,
                SEARCH_TEXT TEXT,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_calibrate_method_search ON CALIBRATE_METHOD (SEARCH_TEXT);
            CREATE INDEX IF NOT EXISTS idx_calibration_points_cert_no ON CALIBRATION_POINTS (CERT_NO);
            CREATE INDEX IF NOT EXISTS idx_calibration_points_cert_no_eq_name ON CALIBRATION_POINTS (CERT_NO, EQUIPMENT_NAME);
            CREATE INDEX IF NOT EXISTS idx_certificate_standards_cert_no ON CERTIFICATE_STANDARDS (CERT_NO);
            CREATE INDEX IF NOT EXISTS idx_template_points_template_name ON TEMPLATE_POINTS (TEMPLATE_NAME);
            CREATE INDEX IF NOT EXISTS idx_projects_created_at ON PROJECTS (CREATED_AT DESC);
        `);
        console.log("✅ Khởi chạy migrations & tạo database indexes thành công trong 1 batch.");
    } catch (err) {
        console.error("❌ Migration thất bại:", err.message);
        throw err;
    }
}

let dbInitPromise = null;
async function ensureDbInitialized() {
    if (!dbInitPromise) {
        dbInitPromise = (async () => {
            try {
                // 1. Kiểm tra xem bảng USERS đã tồn tại chưa FIRST để tránh chạy phần init/seed mất thời gian
                const checkTable = await sql`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'users'
                    )
                `;
                
                const exists = checkTable[0] && checkTable[0].exists;
                if (exists) {
                    console.log("✅ Supabase đã được khởi tạo trước đó. Chạy migrations cột mới (nếu có) trong background...");
                    // Chạy migrations trong background để tránh block request đầu tiên/cold start
                    runColumnMigrations().catch(err => {
                        console.error("❌ Background migration thất bại:", err.message);
                    });
                    return;
                }

                // 2. Nếu chưa có bảng USERS, chạy đầy đủ quy trình init/migration đồng bộ
                console.log("🚀 Bảng users chưa tồn tại. Khởi tạo schema mới...");
                await runColumnMigrations();
                await initDatabaseSchema();
                await seedDefaultUsers();
            } catch (err) {
                dbInitPromise = null; // Reset để thử lại ở request tiếp theo nếu lỗi
                throw err;
            }
        })();
    }
    return dbInitPromise;
}

// Middleware để đảm bảo cơ sở dữ liệu luôn được khởi tạo trước khi xử lý bất kỳ API nào
// ensureDbInitialized() đã được chạy khi server start (local), middleware này đảm bảo init cả trên Vercel serverless
app.use('/api', async (req, res, next) => {
    try {
        await ensureDbInitialized();
        next();
    } catch (err) {
        console.error("❌ Lỗi khởi tạo cơ sở dữ liệu:", err);
        res.status(500).json({ success: false, error: "Lỗi khởi tạo cơ sở dữ liệu: " + err.message });
    }
});

// Endpoint để phục vụ file tĩnh cho Vercel Serverless
app.get('/api/static/:filename', (req, res) => {
    const filename = req.params.filename;
    const safeFilename = path.basename(filename);
    const tmpPath = path.join(require('os').tmpdir(), safeFilename);
    const localStaticPath = path.join(__dirname, 'static', safeFilename);
    
    let filePath = null;
    if (fs.existsSync(tmpPath)) {
        filePath = tmpPath;
    } else if (fs.existsSync(localStaticPath)) {
        filePath = localStaticPath;
    }
    
    if (!filePath) return res.status(404).send('File not found');
    
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeMap = {
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.pdf': 'application/pdf',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    
    if (ext === '.docx' || ext === '.pdf' || ext === '.xlsx') {
        res.writeHead(200, {
            'Content-Disposition': 'attachment; filename="' + safeFilename + '"',
            'Content-Type': contentType,
            'Content-Length': buf.length,
            'Access-Control-Allow-Origin': '*'
        });
    } else {
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': buf.length,
            'Access-Control-Allow-Origin': '*'
        });
    }
    res.end(buf);
});

// Debug endpoint (tạm thời) — kiểm tra kết nối DB trên Vercel
// Combined /api/init endpoint — trả về tất cả dữ liệu cần thiết cho frontend trong 1 request
app.get('/api/init', async (req, res) => {
    try {
        const [projectsResult, certCountResult, templatesResult, clockResult, allPointsResult] = await Promise.all([
            sql`SELECT COUNT(*) as total,
                       COUNT(*) FILTER (WHERE status = 'In Progress') as progress,
                       COUNT(*) FILTER (WHERE status = 'Finished') as finished
                FROM PROJECTS`,
            sql`SELECT COUNT(*) as cert_count FROM CERTIFICATES`,
            sql`SELECT * FROM EQUIPMENT_TEMPLATES ORDER BY equipment_id ASC`,
            sql`SELECT * FROM CLOCK ORDER BY ID ASC`,
            sql`SELECT * FROM TEMPLATE_POINTS ORDER BY ID ASC`
        ]);

        // Group points by TEMPLATE_NAME in-memory
        const pointsByTemplate = {};
        for (const p of allPointsResult) {
            const tName = p.template_name;
            if (!pointsByTemplate[tName]) {
                pointsByTemplate[tName] = [];
            }
            pointsByTemplate[tName].push({
                ID: p.id,
                TEMPLATE_NAME: p.template_name,
                PARAMETER_NAME: p.parameter_name,
                CAL_POINT: p.cal_point,
                AS_FOUND_VALUE: p.as_found_value,
                REFERENCE_VALUE: p.reference_value,
                UNCERTAINTY: p.uncertainty,
                TOLERANCE: p.tolerance,
                CONFORMITY: p.conformity,
                STANDARD_EQUIPMENT: p.standard_equipment
            });
        }

        // Map templates using the in-memory grouped points
        const templates = templatesResult.map((t) => {
            const formPoints = pointsByTemplate[t.name] || [];
            return {
                NAME: t.name,
                NAME_VI: t.name_vi,
                MANUFACTURER: t.manufacturer,
                NEXT_DUE: t.next_due,
                EQUIPMENT_ID: t.equipment_id,
                PROCEDURE: t.procedure,
                REF_STANDARD: t.ref_standard,
                MODEL: t.model,
                SERIAL_NUMBER: t.serial_number,
                MODEL_SERIAL: t.model_serial,
                MANUFACTURER_ID: t.manufacturer_id,
                SPEC_RANGE: t.spec_range,
                SPEC_RESOLUTION: t.spec_resolution,
                STANDARDS_USED: t.standards_used,
                formPoints: formPoints
            };
        });

        // Map clock rows to uppercase keys
        const clockData = clockResult.map(r => ({
            ID: r.id,
            KEY_FIELD: r.key_field,
            NAME: r.name,
            MANUFACTURER: r.manufacturer,
            MODEL: r.model,
            SERIAL_NUMBER: r.serial_number,
            GCN: r.gcn,
            LINK: r.link,
            CAL_DATE: r.cal_date,
            VALIDITY: r.validity,
            TYPE: r.type,
            NOTES: r.notes,
            CREATED_AT: r.created_at
        }));

        res.json({
            projects: {
                total: parseInt(projectsResult[0].total),
                progress: parseInt(projectsResult[0].progress),
                finished: parseInt(projectsResult[0].finished)
            },
            certCount: parseInt(certCountResult[0].cert_count) || 0,
            templates: templates,
            standards: clockData
        });
    } catch (err) {
        console.error('❌ /api/init error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/debug/health', async (req, res) => {
    const info = {
        env_check: {
            SUPABASE_HOST: process.env.SUPABASE_HOST ? '✅ set' : '❌ missing',
            SUPABASE_PORT: process.env.SUPABASE_PORT || '(default)',
            SUPABASE_DB: process.env.SUPABASE_DB || '(default)',
            SUPABASE_USER: process.env.SUPABASE_USER ? '✅ set' : '❌ missing',
            SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD ? '✅ set (' + process.env.SUPABASE_PASSWORD.length + ' chars)' : '❌ missing',
            SUPABASE_SSL: process.env.SUPABASE_SSL || '(default)',
        },
        db_test: null
    };
    try {
        const result = await sql`SELECT 1 as ok`;
        info.db_test = '✅ Connected successfully';
    } catch (err) {
        info.db_test = '❌ ' + err.message;
    }
    res.json(info);
});

// ================= API CRUD CHO BẢNG CLOCK =================

app.get('/api/clock', async (req, res) => {
    try {
        const rowsDb = await sql`SELECT * FROM CLOCK ORDER BY ID ASC`;
        const rows = rowsDb.map(r => ({
            ID: r.id,
            KEY_FIELD: r.key_field,
            NAME: r.name,
            MANUFACTURER: r.manufacturer,
            MODEL: r.model,
            SERIAL_NUMBER: r.serial_number,
            GCN: r.gcn,
            LINK: r.link,
            CAL_DATE: r.cal_date,
            VALIDITY: r.validity,
            TYPE: r.type,
            NOTES: r.notes,
            CREATED_AT: r.created_at
        }));
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/clock/search', async (req, res) => {
    const q = (req.query.q || '').toString().trim();
    try {
        if (!q) {
            const rowsDb = await sql`SELECT * FROM CLOCK ORDER BY NAME ASC LIMIT 10`;
            const rows = rowsDb.map(r => ({
                ID: r.id,
                KEY_FIELD: r.key_field,
                NAME: r.name,
                MANUFACTURER: r.manufacturer,
                MODEL: r.model,
                SERIAL_NUMBER: r.serial_number,
                GCN: r.gcn,
                LINK: r.link,
                CAL_DATE: r.cal_date,
                VALIDITY: r.validity,
                TYPE: r.type,
                NOTES: r.notes,
                CREATED_AT: r.created_at
            }));
            return res.json(rows);
        }

        const queryStr = `%${q}%`;
        const rowsDb = await sql`
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
        const rows = rowsDb.map(r => ({
            ID: r.id,
            KEY_FIELD: r.key_field,
            NAME: r.name,
            MANUFACTURER: r.manufacturer,
            MODEL: r.model,
            SERIAL_NUMBER: r.serial_number,
            GCN: r.gcn,
            LINK: r.link,
            CAL_DATE: r.cal_date,
            VALIDITY: r.validity,
            TYPE: r.type,
            NOTES: r.notes,
            CREATED_AT: r.created_at
        }));
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

// ================= API CHO BẢNG CALIBRATE_METHOD =================

// Hàm map hàng DB (key thường) → key IN HOA cho frontend
function mapCalibrateMethodRow(r) {
    return {
        ID: r.id,
        STT: r.stt,
        TEN_VN: r.ten_vn,
        TEN_EN: r.ten_en,
        MO_TA: r.mo_ta,
        PHAM_VI_DO: r.pham_vi_do,
        QUY_TRINH: r.quy_trinh,
        CMC: r.cmc,
        SEARCH_TEXT: r.search_text,
        CREATED_AT: r.created_at
    };
}

app.get('/api/calibrate-method', async (req, res) => {
    try {
        const rowsDb = await sql`SELECT * FROM CALIBRATE_METHOD ORDER BY STT ASC`;
        res.json(rowsDb.map(mapCalibrateMethodRow));
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Tìm kiếm thông minh phục vụ autocomplete khi user nhập tên thiết bị (giống /api/clock/search)
app.get('/api/calibrate-method/search', async (req, res) => {
    const q = (req.query.q || '').toString().trim();
    try {
        if (!q) {
            const rowsDb = await sql`SELECT * FROM CALIBRATE_METHOD ORDER BY STT ASC LIMIT 10`;
            return res.json(rowsDb.map(mapCalibrateMethodRow));
        }

        const queryStr = `%${q}%`;
        const rowsDb = await sql`
            SELECT *,
                CASE
                    WHEN LOWER(TEN_VN) = LOWER(${q}) OR LOWER(TEN_EN) = LOWER(${q}) THEN 0
                    WHEN LOWER(TEN_VN) LIKE LOWER(${queryStr}) OR LOWER(TEN_EN) LIKE LOWER(${queryStr}) THEN 1
                    ELSE 2
                END AS RELEVANCE
            FROM CALIBRATE_METHOD
            WHERE LOWER(TEN_VN) LIKE LOWER(${queryStr})
               OR LOWER(TEN_EN) LIKE LOWER(${queryStr})
               OR LOWER(SEARCH_TEXT) LIKE LOWER(${queryStr})
               OR LOWER(QUY_TRINH) LIKE LOWER(${queryStr})
            ORDER BY RELEVANCE ASC, STT ASC
            LIMIT 15
        `;
        res.json(rowsDb.map(mapCalibrateMethodRow));
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API QUẢN LÝ DỰ ÁN =================

app.get('/api/projects', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const rowsDb = await sql`SELECT * FROM PROJECTS ORDER BY CREATED_AT DESC LIMIT ${limit} OFFSET ${offset}`;
        
        const statsResult = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'In Progress') as progress,
                COUNT(*) FILTER (WHERE status = 'Finished') as finished
            FROM PROJECTS
        `;

        const rows = rowsDb.map(r => ({
            ID: r.id,
            TITLE: r.title,
            TECH: r.tech,
            STATUS: r.status,
            CREATED_AT: r.created_at
        }));
        res.json({ 
            data: rows, 
            total: parseInt(statsResult[0].total),
            progress: parseInt(statsResult[0].progress),
            finished: parseInt(statsResult[0].finished),
            page: page, 
            limit: limit 
        });
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
        res.json({ success: true, ID: finalId });
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
        const [certRows, pointsRows, standardsRows] = await Promise.all([
            sql`SELECT * FROM CERTIFICATES WHERE CERT_NO = ${certNo}`,
            eqName
                ? sql`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ${certNo} AND EQUIPMENT_NAME = ${eqName}`
                : sql`SELECT * FROM CALIBRATION_POINTS WHERE CERT_NO = ${certNo}`,
            sql`SELECT * FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ${certNo}`
        ]);

        if (certRows.length === 0) {
            return res.json({ success: true, dataExists: false, cert: null, points: [], standards: [] });
        }

        const toUpperKeys = (obj) => obj ? Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toUpperCase(), v])) : null;

        res.json({ 
            cert: toUpperKeys(certRows[0]), 
            points: pointsRows.map(toUpperKeys), 
            standards: standardsRows.map(toUpperKeys) 
        });
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
            (CERT_NO, INSTRUMENT_NAME, INSTRUMENT_NAME_EN, MANUFACTURER, MANUFACTURER_ID, MODEL, MODEL_SERIAL, EQUIPMENT_ID, SERIAL_NUMBER, CUSTOMER_NAME, CUSTOMER_ADDRESS, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR, SPEC_RANGE, SPEC_RESOLUTION) 
            VALUES (${data.certNo || ''}, ${data.instrumentName || ''}, ${data.instrumentNameEn || ''}, ${data.manufacturer || ''}, ${data.manufacturerId || ''}, ${data.model || ''}, ${data.modelSerial || ''}, ${data.equipmentId || ''}, ${data.serialNumber || ''}, ${data.customerName || ''}, ${data.customerAddress || ''}, ${data.calDate || ''}, ${data.reCalDate || ''}, ${data.procedure || ''}, ${data.refStandard || ''}, ${data.tempEnv || ''}, ${data.humiEnv || ''}, ${data.headOfLab || ''}, ${data.director || ''}, ${data.specRange || ''}, ${data.specResolution || ''})
            ON CONFLICT (CERT_NO) DO UPDATE SET 
                INSTRUMENT_NAME = EXCLUDED.INSTRUMENT_NAME, INSTRUMENT_NAME_EN = EXCLUDED.INSTRUMENT_NAME_EN, MANUFACTURER = EXCLUDED.MANUFACTURER, MANUFACTURER_ID = EXCLUDED.MANUFACTURER_ID, MODEL = EXCLUDED.MODEL, MODEL_SERIAL = EXCLUDED.MODEL_SERIAL, EQUIPMENT_ID = EXCLUDED.EQUIPMENT_ID, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, CUSTOMER_NAME = EXCLUDED.CUSTOMER_NAME, CUSTOMER_ADDRESS = EXCLUDED.CUSTOMER_ADDRESS, CAL_DATE = EXCLUDED.CAL_DATE, RE_CAL_DATE = EXCLUDED.RE_CAL_DATE, PROCEDURE = EXCLUDED.PROCEDURE, REF_STANDARD = EXCLUDED.REF_STANDARD, TEMP_ENV = EXCLUDED.TEMP_ENV, HUMI_ENV = EXCLUDED.HUMI_ENV, HEAD_OF_LAB = EXCLUDED.HEAD_OF_LAB, DIRECTOR = EXCLUDED.DIRECTOR, SPEC_RANGE = EXCLUDED.SPEC_RANGE, SPEC_RESOLUTION = EXCLUDED.SPEC_RESOLUTION
        `;

        await sql`DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = ${data.certNo}`;
        
        const stds = data.standards || [];
        if (stds.length > 0) {
            for (const s of stds) {
                await sql`
                    INSERT INTO CERTIFICATE_STANDARDS (CERT_NO, EQ_CODE, EQ_NAME, STD_CERT_NO, LINK, VALIDITY)
                    VALUES (${data.certNo}, ${s.id || s.code || ''}, ${s.name || ''}, ${s.certNo || ''}, ${s.trace || s.link || ''}, ${s.due || s.validity || ''})
                `;
            }
        }
        
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

async function getEquipmentTemplatesHelper(req, res) {
    try {
        const searchTerm = req.query.q ? `%${req.query.q.toLowerCase()}%` : null;

        const whereClause = searchTerm 
            ? sql`WHERE LOWER(name) LIKE ${searchTerm} OR LOWER(equipment_id) LIKE ${searchTerm} OR LOWER(manufacturer) LIKE ${searchTerm}`
            : sql``;

        const templates = await sql`SELECT * FROM EQUIPMENT_TEMPLATES ${whereClause} ORDER BY equipment_id ASC`;

        if (templates.length === 0) return res.json([]);

        // Optimize: Fetch all template points for these templates in a single query using = ANY()
        const templateNames = templates.map(t => t.name || t.NAME);
        const points = await sql`
            SELECT * FROM TEMPLATE_POINTS 
            WHERE TEMPLATE_NAME = ANY(${templateNames}) 
            ORDER BY ID ASC
        `;

        // Group points by TEMPLATE_NAME in-memory
        const pointsByTemplate = {};
        for (const p of points) {
            const tName = p.template_name;
            if (!pointsByTemplate[tName]) {
                pointsByTemplate[tName] = [];
            }
            pointsByTemplate[tName].push({
                ID: p.id,
                TEMPLATE_NAME: p.template_name,
                PARAMETER_NAME: p.parameter_name,
                CAL_POINT: p.cal_point,
                AS_FOUND_VALUE: p.as_found_value,
                REFERENCE_VALUE: p.reference_value,
                UNCERTAINTY: p.uncertainty,
                TOLERANCE: p.tolerance,
                CONFORMITY: p.conformity,
                STANDARD_EQUIPMENT: p.standard_equipment
            });
        }

        for (let template of templates) {
            const templateName = template.name || template.NAME;
            const formPoints = pointsByTemplate[templateName] || [];

            // Map sang key IN HOA cho frontend cũ nhận diện đúng
            template.NAME = template.name;
            template.NAME_VI = template.name_vi;
            template.MANUFACTURER = template.manufacturer;
            template.NEXT_DUE = template.next_due;
            template.EQUIPMENT_ID = template.equipment_id;
            template.PROCEDURE = template.procedure;
            template.REF_STANDARD = template.ref_standard;
            template.MODEL = template.model;
            template.SERIAL_NUMBER = template.serial_number;
            template.MODEL_SERIAL = template.model_serial;
            template.MANUFACTURER_ID = template.manufacturer_id;
            template.SPEC_RANGE = template.spec_range;
            template.SPEC_RESOLUTION = template.spec_resolution;
            template.STANDARDS_USED = template.standards_used;
            template.formPoints = formPoints;
        }
        res.json(templates);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

app.get('/api/equipment-templates', async (req, res) => {
    await getEquipmentTemplatesHelper(req, res);
});

app.get('/api/equipment', async (req, res) => {
    await getEquipmentTemplatesHelper(req, res);
});

app.post('/api/equipment', async (req, res) => {
    try {
        const { equipment_id, standard_name, manufacturer, due_date, procedure, ref_standard, points, model, serial_number, model_serial, manufacturer_id, spec_range, spec_resolution, standards_used, name_vi } = req.body;

        if (!equipment_id || !standard_name) {
            return res.status(400).json({ success: false, message: "Thiếu mã nhận diện hoặc tên thiết bị chuẩn!" });
        }

        await sql`
            INSERT INTO EQUIPMENT_TEMPLATES (NAME, MANUFACTURER, NEXT_DUE, EQUIPMENT_ID, PROCEDURE, REF_STANDARD, MODEL, SERIAL_NUMBER, MODEL_SERIAL, MANUFACTURER_ID, SPEC_RANGE, SPEC_RESOLUTION, STANDARDS_USED, NAME_VI)
            VALUES (${standard_name}, ${manufacturer || ''}, ${due_date || ''}, ${equipment_id}, ${procedure || ''}, ${ref_standard || ''}, ${model || ''}, ${serial_number || ''}, ${model_serial || ''}, ${manufacturer_id || ''}, ${spec_range || ''}, ${spec_resolution || ''}, ${standards_used || ''}, ${name_vi || ''})
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
                NAME_VI = EXCLUDED.NAME_VI
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const offset = (page - 1) * limit;

        const searchTerm = req.query.q ? `%${req.query.q.toLowerCase()}%` : null;

        const whereClause = searchTerm 
            ? sql`WHERE LOWER(name) LIKE ${searchTerm} OR LOWER(company) LIKE ${searchTerm} OR LOWER(phone) LIKE ${searchTerm} OR LOWER(id) LIKE ${searchTerm}`
            : sql``;

        const rowsDb = await sql`
            SELECT * FROM CUSTOMERS 
            ${whereClause}
            ORDER BY ID DESC 
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        const totalCountResult = await sql`SELECT COUNT(*) FROM CUSTOMERS ${whereClause}`;
        const total = parseInt(totalCountResult[0].count);

        const rows = rowsDb.map(r => ({
            ID: r.id,
            NAME: r.name,
            COMPANY: r.company,
            PHONE: r.phone,
            TAX: r.tax,
            EMAIL: r.email,
            ADDRESS: r.address,
            BILLING_ADDRESS: r.billing_address,
            CONTACT: r.contact,
            NOTE: r.note
        }));

        // Also get VIP count for stats, respecting search filter if present
        const vipCountResult = await sql`SELECT COUNT(*) FROM CUSTOMERS ${whereClause} ${searchTerm ? sql`AND` : sql`WHERE`} UPPER(NOTE) LIKE '%VIP%'`;
        const vipCount = parseInt(vipCountResult[0].count);

        res.json({ data: rows, total: total, vipCount: vipCount, page: page, limit: limit });
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
        return res.json({ success: true, ID: finalId, message: isNew ? "Thêm khách hàng thành công" : "Cập nhật thành công" });
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

app.get('/api/customers/search', async (req, res) => {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    if (!q) {
        // Return top 10 recently added customers if no query
        const rowsDb = await sql`SELECT * FROM CUSTOMERS ORDER BY ID DESC LIMIT 10`;
        const rows = rowsDb.map(r => ({
            ID: r.id, NAME: r.name, COMPANY: r.company, PHONE: r.phone, TAX: r.tax, EMAIL: r.email, ADDRESS: r.address, BILLING_ADDRESS: r.billing_address, CONTACT: r.contact, NOTE: r.note
        }));
        return res.json(rows);
    }

    try {
        const queryStr = `%${q}%`;
        const rowsDb = await sql`
            SELECT *,
                CASE
                    WHEN LOWER(ID) = ${q} OR LOWER(NAME) = ${q} THEN 0
                    WHEN LOWER(ID) LIKE ${queryStr} OR LOWER(NAME) LIKE ${queryStr} THEN 1
                    ELSE 2
                END AS RELEVANCE
            FROM CUSTOMERS
            WHERE LOWER(ID) LIKE ${queryStr}
               OR LOWER(NAME) LIKE ${queryStr}
               OR LOWER(COMPANY) LIKE ${queryStr}
               OR LOWER(PHONE) LIKE ${queryStr}
            ORDER BY RELEVANCE ASC, NAME ASC
            LIMIT 15
        `;
        const rows = rowsDb.map(r => ({ ID: r.id, NAME: r.name, COMPANY: r.company, PHONE: r.phone, TAX: r.tax, EMAIL: r.email, ADDRESS: r.address, BILLING_ADDRESS: r.billing_address, CONTACT: r.contact, NOTE: r.note }));
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= NHẬT KÝ & THỐNG KÊ =================

app.get('/api/audit-logs', async (req, res) => {
    try {
        const rowsDb = await sql`SELECT * FROM ACTIVITY_LOGS ORDER BY TIMESTAMP DESC LIMIT 200`;
        const rows = rowsDb.map(r => ({
            ID: r.id,
            USER_NAME: r.user_name,
            ACTION_TYPE: r.action_type,
            TARGET_TABLE: r.target_table,
            TARGET_ID: r.target_id,
            DESCRIPTION: r.description,
            TIMESTAMP: r.timestamp
        }));
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

// Tạo thư mục static (dùng try-catch cho Vercel serverless read-only filesystem)
const staticDir = path.join(__dirname, 'static');
try {
    if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true });
} catch (e) {
    console.warn('⚠️ Không thể tạo thư mục static (Vercel read-only?):', e.message);
}

// Hàm helper xuất file đồng bộ cơ sở dữ liệu trước khi xử lý
async function saveCalibrationDataToDBHelper(data, cert_no) {
    await sql`
        INSERT INTO CERTIFICATES 
        (CERT_NO, INSTRUMENT_NAME, INSTRUMENT_NAME_EN, MANUFACTURER, MANUFACTURER_ID, MODEL, MODEL_SERIAL, EQUIPMENT_ID, SERIAL_NUMBER, CUSTOMER_NAME, CUSTOMER_ADDRESS, CAL_DATE, RE_CAL_DATE, PROCEDURE, REF_STANDARD, TEMP_ENV, HUMI_ENV, HEAD_OF_LAB, DIRECTOR, SPEC_RANGE, SPEC_RESOLUTION)
        VALUES (${cert_no}, ${data.instrumentName || data.instrument_name || ''}, ${data.instrumentNameEn || data.instrument_name_en || ''}, ${data.manufacturer || ''}, ${data.manufacturerId || data.manufacturer_id || ''}, ${data.model || ''}, ${data.modelSerial || data.model_serial || ''}, ${data.equipmentId || data.equipment_id || ''}, ${data.serialNumber || data.serial_number || ''}, ${data.customerName || data.customer_name || ''}, ${data.customerAddress || data.customer_address || ''}, ${data.calDate || data.cal_date || ''}, ${data.reCalDate || data.re_cal_date || ''}, ${data.procedure || ''}, ${data.refStandard || data.ref_standard || ''}, ${data.tempEnv || data.temp_env || ''}, ${data.humiEnv || data.humi_env || ''}, ${data.headOfLab || data.head_of_lab || ''}, ${data.director || ''}, ${data.specRange || ''}, ${data.specResolution || ''})
        ON CONFLICT (CERT_NO) DO UPDATE SET INSTRUMENT_NAME = EXCLUDED.INSTRUMENT_NAME, INSTRUMENT_NAME_EN = EXCLUDED.INSTRUMENT_NAME_EN, MANUFACTURER = EXCLUDED.MANUFACTURER, MANUFACTURER_ID = EXCLUDED.MANUFACTURER_ID, MODEL = EXCLUDED.MODEL, MODEL_SERIAL = EXCLUDED.MODEL_SERIAL, EQUIPMENT_ID = EXCLUDED.EQUIPMENT_ID, SERIAL_NUMBER = EXCLUDED.SERIAL_NUMBER, CUSTOMER_NAME = EXCLUDED.CUSTOMER_NAME, CUSTOMER_ADDRESS = EXCLUDED.CUSTOMER_ADDRESS, CAL_DATE = EXCLUDED.CAL_DATE, RE_CAL_DATE = EXCLUDED.RE_CAL_DATE, PROCEDURE = EXCLUDED.PROCEDURE, REF_STANDARD = EXCLUDED.REF_STANDARD, TEMP_ENV = EXCLUDED.TEMP_ENV, HUMI_ENV = EXCLUDED.HUMI_ENV, HEAD_OF_LAB = EXCLUDED.HEAD_OF_LAB, DIRECTOR = EXCLUDED.DIRECTOR, SPEC_RANGE = EXCLUDED.SPEC_RANGE, SPEC_RESOLUTION = EXCLUDED.SPEC_RESOLUTION
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
        const pointInsertPromises = points.map(p => {
            const standardVal = p.refEq || p.standardEquipment || p.standard_equipment || '';
            return sql`
                INSERT INTO CALIBRATION_POINTS (CERT_NO, EQUIPMENT_NAME, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, REFERENCE_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY, REF_EQUIPMENT, STANDARD_EQUIPMENT)
                VALUES (${cert_no}, ${eqName}, ${p.parameterName || p.param || ''}, ${p.calPoint || p.point || ''}, ${p.asFoundValue || p.found || ''}, ${p.referenceValue || p.refValue || p.reference_value || ''}, ${p.uncertainty || p.unc || ''}, ${p.tolerance || p.tol || ''}, ${p.conformity || p.conf || ''}, ${standardVal}, ${standardVal})
            `;
        });
        await Promise.all(pointInsertPromises);
    }

    const stds = data.standards || [];
    if (stds.length > 0) {
        const stdInsertPromises = stds.map(s => {
            return sql`
                INSERT INTO CERTIFICATE_STANDARDS (CERT_NO, EQ_CODE, EQ_NAME, STD_CERT_NO, LINK, VALIDITY)
                VALUES (${cert_no}, ${s.id || s.code || ''}, ${s.name || ''}, ${s.certNo || ''}, ${s.trace || s.link || ''}, ${s.due || s.validity || ''})
            `;
        });
        await Promise.all(stdInsertPromises);
    }
}

// ================= EXPORT CHỨNG NHẬN =================

app.post('/api/calibration/export-pdf', async (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });

    try {
        await saveCalibrationDataToDBHelper(data, cert_no);
        const fileName = `GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        
        // Ưu tiên Supabase Storage URL cho QR code (nếu đã cấu hình)
        // Vì QR in trên giấy, khách hàng quét từ bất kỳ đâu (khác mạng, ngoài LAN)
        // Supabase Storage URL có dạng: https://jvlkfunovqujjwfpmnau.supabase.co/storage/v1/object/public/certificates/GCN_xxx.pdf?download=1
        const supabaseUrl = getPublicUrl(fileName);
        const publicBaseUrl = getBaseUrl();
        const localUrl = `${publicBaseUrl}${process.env.VERCEL ? '/api/static/' : '/static/'}${fileName}`;
        const downloadUrl = supabaseUrl || localUrl;
        const eqName = data.equipmentName || data.equipment_name || '';

        const pdfBuffer = await generatePDF({ certNo: cert_no, downloadUrl, equipmentName: eqName, accreditedMethods: data.accreditedMethods || [] });
        const base64 = pdfBuffer.toString('base64');
        
        // Lấy public URL của Supabase trước (tính toán offline nhanh chóng)
        let fileUrl = isConfigured() ? getPublicUrl(fileName) : null;
        
        // Upload lên Supabase Storage trong background (không await để tránh block request)
        if (isConfigured()) {
            console.log(`🔍 DEBUG: Starting background uploadToSupabase for ${fileName} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
            uploadToSupabase(pdfBuffer, fileName, 'application/pdf')
                .then(uploadResult => {
                    if (uploadResult.success) {
                        console.log(`☁️ PDF uploaded to Supabase in background: ${uploadResult.publicUrl}`);
                    } else {
                        console.warn('⚠️ PDF upload background thất bại. Chi tiết:', uploadResult.error || uploadResult);
                    }
                })
                .catch(err => {
                    console.error('❌ PDF background upload error:', err.message);
                });
        } else {
            console.log(`🔍 DEBUG: isConfigured() = false, skipping Supabase upload. downloadUrl used for QR: ${downloadUrl}`);
        }
        
        // Fallback: dùng local URL nếu chưa/không cấu hình Supabase
        if (!fileUrl) {
            const requestBaseUrl = req.protocol + '://' + req.get('host');
            const fileUrlPath = process.env.VERCEL ? `/api/static/${fileName}` : `/static/${fileName}`;
            fileUrl = `${requestBaseUrl}${fileUrlPath}`;
        }

        logActivity("Hệ thống / KTV", "EXPORT_PDF", "CERTIFICATES", cert_no, `Xuất PDF: ${fileName}`);
        res.json({ 
            success: true, 
            message: `Đã xuất thành công ${fileName}`, 
            file_url: fileUrl,
            base64: base64,
            filename: fileName,
            mimeType: 'application/pdf'
        });
    } catch (err) {
        console.error('EXPORT-PDF ERROR STACK:', err.stack);
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

app.post('/api/calibration/export-excel', async (req, res) => {
    const data = req.body;
    const cert_no = data.cert_no || data.certNo;

    if (!cert_no) return res.status(400).json({ success: false, message: "Thiếu số chứng nhận cert_no!" });

    try {
        await saveCalibrationDataToDBHelper(data, cert_no);
        await generateExcel({ certNo: cert_no, accreditedMethods: data.accreditedMethods || [] });
        const fileName = `GCN_${cert_no.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;

        const outputDir = process.env.VERCEL ? require('os').tmpdir() : path.join(__dirname, 'static');
        const filePath = path.join(outputDir, fileName);
        let base64 = null;
        let fileUrl = isConfigured() ? getPublicUrl(fileName) : null;
        
        if (fs.existsSync(filePath)) {
            const buf = fs.readFileSync(filePath);
            base64 = buf.toString('base64');
            
            // Upload lên Supabase Storage (nếu cấu hình) trong background
            if (isConfigured()) {
                console.log(`🔍 DEBUG: Starting background uploadToSupabase for ${fileName} (${(buf ? buf.length : 0)} bytes)`);
                uploadToSupabase(buf, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    .then(uploadResult => {
                        if (uploadResult.success) {
                            console.log(`☁️ Excel uploaded to Supabase in background: ${uploadResult.publicUrl}`);
                        } else {
                            console.warn('⚠️ Excel upload background thất bại:', uploadResult.error || uploadResult);
                        }
                    })
                    .catch(err => {
                        console.error('❌ Excel background upload error:', err.message);
                    });
            }
        }
        
        // Fallback: dùng local URL nếu chưa/không cấu hình Supabase
        if (!fileUrl) {
            const requestBaseUrl = req.protocol + '://' + req.get('host');
            const fileUrlPath = process.env.VERCEL ? `/api/static/${fileName}` : `/static/${fileName}`;
            fileUrl = `${requestBaseUrl}${fileUrlPath}`;
        }

        logActivity("Hệ thống / KTV", "EXPORT_EXCEL", "CERTIFICATES", cert_no, `Xuất Excel: ${fileName}`);
        res.json({ 
            success: true, 
            message: `Đã xuất thành công ${fileName}`, 
            file_url: fileUrl,
            base64: base64,
            filename: fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
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

        // Ưu tiên Supabase Storage URL cho QR code (nếu đã cấu hình)
        // Vì QR in trên giấy, khách hàng quét từ bất kỳ đâu (khác mạng, ngoài LAN)
        const supabaseUrl = getPublicUrl(fileName);
        const publicBaseUrl = getBaseUrl();
        const localUrl = `${publicBaseUrl}${process.env.VERCEL ? '/api/static/' : '/static/'}${fileName}`;
        const downloadUrl = supabaseUrl || localUrl;

        const eqName = data.equipmentName || data.equipment_name || '';
        const docxBuffer = await generateDocx({ certNo: cert_no, downloadUrl, equipmentName: eqName, accreditedMethods: data.accreditedMethods || [] });
        const base64 = docxBuffer.toString('base64');
        
        // Lấy public URL của Supabase trước (tính toán offline nhanh chóng)
        let fileUrl = isConfigured() ? getPublicUrl(fileName) : null;
        
        // Upload lên Supabase Storage (nếu cấu hình) trong background
        if (isConfigured()) {
            console.log(`🔍 DEBUG: Starting background uploadToSupabase for ${fileName} (${(docxBuffer.length / 1024).toFixed(1)} KB)`);
            uploadToSupabase(docxBuffer, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                .then(uploadResult => {
                    if (uploadResult.success) {
                        console.log(`☁️ DOCX uploaded to Supabase in background: ${uploadResult.publicUrl}`);
                    } else {
                        console.warn('⚠️ DOCX upload background thất bại:', uploadResult.error || uploadResult);
                    }
                })
                .catch(err => {
                    console.error('❌ DOCX background upload error:', err.message);
                });
        } else {
            console.log(`🔍 DEBUG: isConfigured() = false, skipping Supabase upload. downloadUrl used for QR: ${downloadUrl}`);
        }
        
        // Fallback: dùng local URL nếu chưa/không cấu hình Supabase
        if (!fileUrl) {
            const requestBaseUrl = req.protocol + '://' + req.get('host');
            const fileUrlPath = process.env.VERCEL ? `/api/static/${fileName}` : `/static/${fileName}`;
            fileUrl = `${requestBaseUrl}${fileUrlPath}`;
        }

        logActivity("Hệ thống / KTV", "EXPORT_DOCX", "CERTIFICATES", cert_no, `Xuất Word: ${fileName}`);
        res.json({ 
            success: true, 
            message: `Đã xuất thành công ${fileName}`, 
            file_url: fileUrl,
            base64: base64,
            filename: fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= API THÔNG TIN SERVER & LOGIN =================

app.get('/api/server/info', (req, res) => {
    res.json({ baseUrl: getBaseUrl(), lanIp: getLANIP(), port: port, publicUrl: process.env.PUBLIC_URL || null });
});

// ================= AUTH — LOGIN & REGISTER =================

app.post('/api/auth/register', async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu!" });
    }
    username = username.trim().toLowerCase();
    if (username.length < 3) {
        return res.status(400).json({ success: false, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" });
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return res.status(400).json({ success: false, message: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang!" });
    }
    if (password.length < 4) {
        return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 4 ký tự!" });
    }
    try {
        const existing = await sql`SELECT USERNAME FROM USERS WHERE USERNAME = ${username}`;
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await sql`
            INSERT INTO USERS (USERNAME, PASSWORD, FULL_NAME, ROLE)
            VALUES (${username}, ${hashedPassword}, ${username}, 'user')
        `;
        logActivity(username, "REGISTER", "USERS", username, `Tài khoản mới đăng ký: ${username}`);
        res.json({ success: true, message: "Đăng ký tài khoản thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu!" });
    }
    username = username.trim().toLowerCase();
    try {
        const rows = await sql`SELECT * FROM USERS WHERE USERNAME = ${username}`;
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
        }
        logActivity(user.full_name || username, "LOGIN", "USERS", username, `Đăng nhập hệ thống`);
        res.json({ success: true, user: { username: user.username, fullName: user.full_name, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= AUTH — USER MANAGEMENT (ADMIN ONLY) =================

// Helper: kiểm tra quyền admin từ header x-auth-username
async function requireAdmin(req, res) {
    const authUser = req.headers['x-auth-username'];
    if (!authUser) {
        res.status(401).json({ success: false, message: "Thiếu thông tin xác thực!" });
        return null;
    }
    const rows = await sql`SELECT ROLE FROM USERS WHERE USERNAME = ${authUser.trim().toLowerCase()}`;
    if (rows.length === 0 || rows[0].role !== 'admin') {
        res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này!" });
        return null;
    }
    return true;
}

// GET: Lấy danh sách users (admin only)
app.get('/api/auth/users', async (req, res) => {
    const authorized = await requireAdmin(req, res);
    if (!authorized) return;
    try {
        const rowsDb = await sql`SELECT ID, USERNAME, FULL_NAME, ROLE FROM USERS ORDER BY USERNAME ASC`;
        const users = rowsDb.map(u => ({
            ID: u.id,
            USERNAME: u.username,
            FULL_NAME: u.full_name,
            ROLE: u.role
        }));
        res.json({ success: true, users: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: Admin tạo user mới (admin only)
app.post('/api/auth/users', async (req, res) => {
    const authorized = await requireAdmin(req, res);
    if (!authorized) return;
    let { username, password, full_name, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu!" });
    }
    username = username.trim().toLowerCase();
    if (username.length < 3) {
        return res.status(400).json({ success: false, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" });
    }
    if (password.length < 4) {
        return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 4 ký tự!" });
    }
    try {
        const existing = await sql`SELECT USERNAME FROM USERS WHERE USERNAME = ${username}`;
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const safeRole = (role === 'admin' || role === 'user') ? role : 'user';
        const displayName = full_name || username;
        const result = await sql`
            INSERT INTO USERS (USERNAME, PASSWORD, FULL_NAME, ROLE)
            VALUES (${username}, ${hashedPassword}, ${displayName}, ${safeRole})
            RETURNING ID
        `;
        logActivity(req.headers['x-auth-username'] || 'admin', "CREATE", "USERS", result[0]?.id?.toString() || username, `Admin tạo tài khoản: ${username} (${safeRole})`);
        res.json({ success: true, message: `Tạo tài khoản ${username} thành công!` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT: Admin cập nhật thông tin user (admin only)
app.put('/api/auth/users/:id', async (req, res) => {
    const authorized = await requireAdmin(req, res);
    if (!authorized) return;
    const userId = req.params.id;
    let { full_name, role, password } = req.body;
    try {
        const target = await sql`SELECT USERNAME FROM USERS WHERE ID = ${userId}`;
        if (target.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
        }
        const username = target[0].username;
        
        if (role !== undefined && role !== '' && role !== 'admin' && role !== 'user') {
            return res.status(400).json({ success: false, message: "Role không hợp lệ!" });
        }
        
        let updateFields = [];
        let updateValues = [];
        let idx = 1;

        if (full_name !== undefined) {
            updateFields.push(`FULL_NAME = $${idx++}`);
            updateValues.push(full_name);
        }
        if (role !== undefined) {
            updateFields.push(`ROLE = $${idx++}`);
            updateValues.push(role);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            updateFields.push(`PASSWORD = $${idx++}`);
            updateValues.push(hashedPassword);
        }

        if (updateFields.length > 0) {
            const query = `UPDATE USERS SET ${updateFields.join(', ')} WHERE ID = $${idx}`;
            updateValues.push(userId);
            await sql.unsafe(query, updateValues);
        }

        logActivity(req.headers['x-auth-username'] || 'admin', "UPDATE", "USERS", userId, `Cập nhật thông tin user: ${username}`);
        res.json({ success: true, message: `Cập nhật user ${username} thành công!` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/auth/users/:id', async (req, res) => {
    const authorized = await requireAdmin(req, res);
    if (!authorized) return;
    const userId = req.params.id;
    try {
        // Không cho xóa chính admin
        const target = await sql`SELECT USERNAME FROM USERS WHERE ID = ${userId}`;
        if (target.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
        }
        if (target[0].username === 'admin') {
            return res.status(403).json({ success: false, message: "Không thể xóa tài khoản admin mặc định!" });
        }
        await sql`DELETE FROM USERS WHERE ID = ${userId}`;
        logActivity(req.headers['x-auth-username'] || 'admin', "DELETE", "USERS", userId, `Đã xóa người dùng: ${target[0].username}`);
        res.json({ success: true, message: `Đã xóa người dùng ${target[0].username} thành công!` });
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
        const row = rows[0];
        const mappedRow = {
            ID: row.id,
            TITLE: row.title,
            TECH: row.tech,
            STATUS: row.status,
            CREATED_AT: row.created_at,
            EQUIPMENT_NAME: row.equipment_name
        };
        res.json({ success: true, data: mappedRow });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Khởi tạo DB ngay khi server start (thay vì đợi request đầu tiên)
async function startServer() {
    try {
        await ensureDbInitialized();
        console.log('✅ Database initialized at startup.');
        if (!process.env.PUBLIC_URL) {
            const baseForWarn = getBaseUrl();
            console.warn('⚠️ PUBLIC_URL chưa được cấu hình. QR code sẽ dùng địa chỉ LAN (' + baseForWarn + '), không hoạt động từ WAN. Vui lòng set biến môi trường PUBLIC_URL (ví dụ: https://labmaster.vn) để QR hoạt động toàn cầu.');
        }
        
        // Cảnh báo nếu chưa cấu hình Supabase Storage
        if (!isConfigured()) {
            console.warn('⚠️ SUPABASE_URL và SUPABASE_SERVICE_KEY chưa được cấu hình. File export sẽ chỉ được lưu local và phục vụ qua /api/static/, không hoạt động ổn định trên Vercel serverless!');
        } else {
            const supabaseUrl = process.env.SUPABASE_URL;
            console.log('✅ Supabase Storage đã sẵn sàng. File export sẽ được upload lên bucket "' + BUCKET_NAME + '" tại ' + supabaseUrl + '.');
        }
    } catch (err) {
        console.error('❌ Database init at startup failed:', err.message);
        // Không throw - để middleware fallback xử lý
    }
    
    app.listen(port, () => {
        console.log(`[LabMaster Enterprise OS] Backend API Cloud đang chạy mượt mà tại cổng: http://localhost:${port}`);
    });
}

// Export app for Vercel serverless, or listen directly for local dev
if (require.main === module) {
    startServer();
}

module.exports = app;