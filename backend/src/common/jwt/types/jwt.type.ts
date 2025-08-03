// --- Định Nghĩa Kiểu Payload JWT ---
// Payload chứa thông tin người dùng sẽ được encode vào access token và refresh token và là kiểu dữ liệu dùng chung cho cả access token và refresh token

export type JwtPayload = {
  sessionId: string; // ID phiên đăng nhập duy nhất cho mỗi phiên, dùng để quản lý session trong hệ thống
  sub: string; // ID duy nhất của người dùng, thường dùng làm định danh chính
  email: string; // Địa chỉ email của người dùng, dùng để đăng nhập và xác minh
  roles: string[]; // Danh sách phân quyền của người dùng trong hệ thống
  iat?: number; // (Issued At) Thời điểm token được phát hành, tính bằng giây kể từ Epoch
  exp?: number; // (Expiration Time) Thời điểm token hết hạn, tính bằng giây kể từ Epoch
};
