'use strict';

/**
 * storage.js — Supabase Storage client helper
 * 
 * Upload export vào bucket đã được provision sẵn.
 * 
 * Yêu cầu biến môi trường:
 *   SUPABASE_URL      — Ví dụ: https://jvlkfunovqujjwfpmnau.supabase.co
 *   SUPABASE_SERVICE_KEY — Service role key (có quyền upload)
 */

require('dotenv').config();
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
    // Let browsers render PDF files inline; DOCX/XLSX still download by MIME handling.
    return data.publicUrl;
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
                upsert: false,
            });
        if (uploadError) throw uploadError;

        // Lấy public URL
        const publicUrl = getPublicUrl(filename);
        console.log(`✅ [Supabase Storage] Upload thành công: ${filename} → ${publicUrl}`);
        return { success: true, publicUrl, path: filename };
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
