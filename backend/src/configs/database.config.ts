// --- Import Thư Viện ---
import mongoose from 'mongoose';

// --- Hàm Kết Nối Cơ Sở Dữ Liệu ---
/**
 * Kết nối đến MongoDB bằng URI từ biến môi trường.
 * Nếu kết nối thành công: log thành công kèm tên database.
 * Nếu thất bại hoặc hết thời gian kết nối: log lỗi chi tiết và dừng ứng dụng.
 */
export async function connectToDatabase() {
  // Lấy URI kết nối từ biến môi trường
  const uri = process.env.MONGO_URI;

  // Kiểm tra biến môi trường có tồn tại không
  if (!uri) {
    console.error(
      `[DATABASE] [${new Date().toLocaleString()}] ❌ Thiếu biến môi trường MONGO_URI.`,
    );
    process.exit(1);
  }

  try {
    // Cấu hình timeout kết nối là 10 giây
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 giây
    };

    console.log(`[DATABASE] [${new Date().toLocaleString()}] 🔌 Đang kết nối đến MongoDB...`);

    // Tiến hành kết nối
    await mongoose.connect(uri, options);

    // Lấy tên database từ connection sau khi kết nối
    const dbName = mongoose.connection.name;

    console.log(
      `[DATABASE] [${new Date().toLocaleString()}] ✅ Đã kết nối thành công đến MongoDB (DB: ${dbName})`,
    );
  } catch (error) {
    // Log lỗi kèm thời gian nếu kết nối thất bại
    console.error(
      `[DATABASE] [${new Date().toLocaleString()}] ❌ Kết nối đến MongoDB thất bại:`,
      error,
    );
    process.exit(1);
  }
}
