# 👤 Tính Năng: Lấy Thông Tin Người Dùng Đang Đăng Nhập

Tính năng cho phép người dùng đã đăng nhập lấy thông tin cá nhân của mình từ hệ thống một cách an toàn và chính xác.

---

## 🧭 Luồng Xử Lý

1. **Client gửi yêu cầu**:
   - Gửi HTTP request tới endpoint `GET /user/me`.
   - Access Token sẽ được gửi tự động trong **HttpOnly Cookie** (`accessToken`) từ phía client.

2. **Xác thực JWT**:
   - NestJS dùng `@UseGuards(JwtAuthGuard)` để bảo vệ route — guard này được tuỳ chỉnh để lấy accessToken từ HttpOnly Cookie.
   - Hệ thống dùng JWT Strategy để xác thực token.
   - Nếu hợp lệ, payload được gán vào `request.user`.

3. **Trích xuất thông tin từ token**:
   - Decorator `@CurrentUser()` lấy payload từ JWT.
   - Trong đó `sub` chính là `userId`.

4. **Truy vấn dữ liệu người dùng**:
   - Gọi `usersService.findById(userId)` từ controller.
   - Service gọi tiếp `usersRepository.findUserById(userId)`.
   - Repository truy vấn MongoDB và loại bỏ trường `password`.

5. **Phản hồi dữ liệu**:
   - Nếu tìm thấy user → trả JSON chứa thông tin người dùng.
   - Nếu không tìm thấy → trả lỗi 404 với thông báo "Người dùng không tồn tại".

---

## ✅ Mẫu Phản Hồi Thành Công

```json
{
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": "user_id",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "fullName": "Nguyễn Văn A",
    "dateOfBirth": "2000-01-01",
    "gender": "Nam",
    "nationalId": "012345678901",
    "email": "example@email.com",
    "phone": "0901234567",
    "avatarUrl": "https://cdn.example.com/avatar.jpg",
    "address": "123 Trần Hưng Đạo, Quận 1, TP.HCM",
    "isEmailVerified": true,
    "emailVerifiedAt": "2024-12-31T10:00:00.000Z",
    "lastLoginAt": "2025-06-26T12:34:56.000Z",
    "roles": ["user"],
    "loyaltyPoints": 1200,
    "membershipTier": "Bronze",
    "note": "",
    "orders": ["orderId1", "orderId2"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-06-27T08:00:00.000Z"
  },
  "errorCode": null
}
```

---

## ❌ Mẫu Phản Hồi Thất Bại

### Không tìm thấy người dùng (userId không tồn tại hoặc đã bị xoá)

```json
{
  "message": "Người dùng không tồn tại",
  "data": null,
  "errorCode": "USER_NOT_FOUND"
}
```

### Token không hợp lệ hoặc không có token

```json
{
  "message": "Không được phép truy cập",
  "data": null,
  "errorCode": "UNAUTHORIZED"
}
```

---

## 📌 Ghi Chú

- Token phải hợp lệ để truy cập được API này.
- Các thông tin được trả về có thể dùng để hiển thị trong trang hồ sơ người dùng hoặc menu điều hướng.
- Không nên để lộ các thông tin nhạy cảm như `password`, `refreshToken`, `sessionId`.
