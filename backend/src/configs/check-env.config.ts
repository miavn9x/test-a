// --- Kiểm Tra Biến Môi Trường ---

/**
 * Hàm validateEnv kiểm tra các biến môi trường bắt buộc.
 * Bước 1: Định nghĩa danh sách các biến môi trường cần thiết.
 * Bước 2: Lọc ra các biến thiếu trong process.env.
 * Bước 3: Nếu có biến thiếu, in lỗi và thoát ứng dụng.
 */
export function validateEnv() {
  // Danh sách biến môi trường bắt buộc
  const requiredEnvVars = ['PORT'];

  // Lọc ra các biến môi trường chưa được thiết lập
  const missing = requiredEnvVars.filter(key => !process.env[key]);

  // Nếu có biến môi trường thiếu, thông báo lỗi và dừng chương trình
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường bắt buộc: ${missing.join(', ')}`);
    process.exit(1);
  }
}
