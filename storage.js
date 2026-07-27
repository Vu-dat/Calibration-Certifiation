'use strict';

/**
 * storage.js — Supabase Storage client helper
 * 
 * Upload file PDF/DOCX/XLSX lên Supabase Storage bucket "certificates"
 * và trả về public URL để dùng trong QR code.
 * 
 * Yêu cầu biến môi trường:
 *   SUPABASE_URL      — Ví dụ: https://jvlkfunovqujjwfpmnau.supabase.co
 *   SUPABASE_SERVICE_KEY — Service role key (có quyền upload)
 */

require('dotenv').config({ override: true });
const { createClient } = require('@supabase/supabase-js');

// Export hằng để server.js dùng mà không cần require lại module này
const BUCKET_NAME = 'certificates';

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabaseInstance = null;

/**
 * Khởi tạo Supabase client (singleton)
 */
function getSupabase() {
    if (supabaseInstance) return supabaseInstance;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false },
    });
    return supabaseInstance;
}

/**
 * Kiểm tra xem Supabase Storage đã được cấu hình chưa
 */
function isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

/**
 * Lấy public URL cho một file trong bucket "certificates"
 * (File chưa cần tồn tại — URL được tính từ bucket + path)
 */
function getPublicUrl(filename) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
    // Thêm ?download=1 để trình duyệt tự động tải file thay vì hiển thị
    return data.publicUrl + '?download=1';
}

/**
 * Upload buffer lên Supabase Storage bucket "certificates"
 * 
 * @param {Buffer} buffer    - Nội dung file
 * @param {string} filename  - Tên file (vd: GCN_000004.pdf)
 * @param {string} contentType - MIME type (application/pdf, ...)
 * @returns {Promise<{success: boolean, publicUrl?: string, error?: string}>}
 */
async function uploadToSupabase(buffer, filename, contentType) {
    const supabase = getSupabase();
    
    // Nếu chưa cấu hình Supabase → báo lỗi rõ ràng
    if (!supabase) {
        const missingVars = [];
        if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
        if (!SUPABASE_SERVICE_KEY) missingVars.push('SUPABASE_SERVICE_KEY');
        const msg = `Thiếu biến môi trường: ${missingVars.join(', ')}. File chỉ được lưu local.`;
        console.warn('⚠️ [Supabase Storage] ' + msg);
        return { success: false, reason: 'not_configured', error: msg };
    }

    try {
        // Upload file
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, buffer, {
                contentType: contentType,
                upsert: true,     // Ghi đè nếu file đã tồn tại
            });

        // Nếu bucket chưa tồn tại → tạo mới rồi upload lại
        if (uploadError && (
            uploadError.message?.toLowerCase().includes('bucket') ||
            uploadError.message?.toLowerCase().includes('not found')
        )) {
            console.log(`📦 [Supabase Storage] Tạo bucket "${BUCKET_NAME}"...`);
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,     // Bucket public để ai cũng tải được file
                allowedMimeTypes: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
            });
            if (createError) {
                throw new Error(`Không thể tạo bucket: ${createError.message}`);
            }
            // Retry upload
            const { error: retryError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filename, buffer, {
                    contentType: contentType,
                    upsert: true,
                });
            if (retryError) throw retryError;
        } else if (uploadError) {
            throw uploadError;
        }

        // Lấy public URL
        const publicUrl = getPublicUrl(filename);
        console.log(`✅ [Supabase Storage] Upload thành công: ${filename} → ${publicUrl}`);
        return { success: true, publicUrl };
    } catch (err) {
        console.error('❌ [Supabase Storage] Upload thất bại:', err.message);
        return { success: false, reason: 'upload_error', error: err.message };
    }
}

module.exports = {
    uploadToSupabase,
    getPublicUrl,
    isConfigured,
    getSupabase,
    BUCKET_NAME,
};
