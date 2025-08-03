# 🧑‍💼 Thông Tin Người Dùng

Tài khoản người dùng trong hệ thống được thiết kế theo mô hình phân quyền rõ ràng và hỗ trợ đầy đủ thông tin cá nhân lẫn lịch sử giao dịch. Dưới đây là cấu trúc và các nhóm dữ liệu chính liên quan đến người dùng:

---

## 🔐 Phân Quyền (Roles)

Mỗi người dùng được gán một hoặc nhiều quyền để xác định vai trò trong hệ thống:

- `user`: Khách hàng thông thường
- `admin`: Quản trị viên hệ thống

Roles được sử dụng để bảo vệ các API và chức năng phù hợp với từng vai trò — tách thành enum để quản lý và kiểm soát phân quyền rõ ràng, nhất quán trong toàn hệ thống.

---

## 👤 Thông Tin Cá Nhân

Thông tin người dùng được tổ chức theo các nhóm chính sau:

### 🧾 Hồ Sơ Cơ Bản

- `id`: Định danh người dùng (UUID) - duy nhất
- `firstName`: Họ
- `lastName`: Tên
- `fullName`: Họ và tên đầy đủ (tự động sinh từ firstName + lastName)
- `dateOfBirth`: Ngày sinh
- `gender`: Giới tính (Nam/Nữ/Khác)
- `nationalId`: Số CCCD/CMND — duy nhất
- `email`: Email chính (dùng để đăng nhập) — duy nhất
- `phone`: Số điện thoại liên hệ — duy nhất
- `avatarUrl`: Ảnh đại diện
- `address`: Địa chỉ giao hàng mặc định

### 🔒 Xác Thực & Truy Cập

- `isEmailVerified`: Đã xác minh email hay chưa
- `emailVerifiedAt`: Thời điểm xác minh email
- `lastLoginAt`: Thời điểm người dùng đăng nhập lần cuối — được cập nhật từ bảng `auth` (quản lý thông tin xác thực)

### 🏅 Thành Viên & Tích Lũy

- `loyaltyPoints`: Số điểm tích luỹ từ các đơn hàng
- `membershipTier`: Hạng thành viên (VD: Bronze, Silver, Gold) — nên tách thành enum để quản lý và kiểm soát logic liên quan

### 🧰 Quản Trị Hệ Thống

- `note`: Ghi chú nội bộ (chỉ dùng cho admin quản lý)
- `createdAt`, `updatedAt`: Thời gian tạo và cập nhật tài khoản

---

## 📦 Thông Tin Đơn Hàng

Mỗi người dùng có thể có nhiều đơn hàng gắn liền với tài khoản của họ. Trong thông tin người dùng, chỉ cần lưu `orderId` để truy vấn nhanh khi cần:

- `orders`: Danh sách ID đơn hàng (mảng)
  - `orderId`: Mã định danh duy nhất của đơn hàng

---

## 🔒 Bảo Mật

- `password`: Mật khẩu được mã hoá bằng `argon2id`

---

## 📌 Ghi chú

- Các API trả về thông tin người dùng cần phải xác thực bằng token hợp lệ.
- Dữ liệu nhạy cảm như mật khẩu không bao giờ được trả về từ API.
