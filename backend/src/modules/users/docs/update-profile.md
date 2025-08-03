# ✏️ Tính Năng Cập Nhật Thông Tin Người Dùng

Tính năng cho phép người dùng đã đăng nhập **chỉnh sửa thông tin cá nhân** trong hồ sơ của mình nhằm đảm bảo dữ liệu luôn chính xác, đầy đủ và cập nhật mới nhất.

---

## 🧭 Luồng Xử Lý

1. **Xác thực người dùng**:
   - API yêu cầu người dùng phải gửi **Access Token hợp lệ** (Bearer Token).
   - Token được giải mã để lấy thông tin định danh `userId`.

2. **Gửi yêu cầu cập nhật**:
   - Payload gửi lên từ client bao gồm một hoặc nhiều trường sau:
     - `firstName`, `lastName` → hệ thống sẽ tự sinh lại `fullName`.
     - `dateOfBirth`, `gender`, `nationalId`
     - `phone`, `avatarUrl`, `address`
   - Các trường như `email`, `roles`, `loyaltyPoints`, `membershipTier`, `password`,...**không thể thay đổi** qua API này để đảm bảo an toàn và đúng vai trò của người dùng.

3. **Xử lý cập nhật**:
   - Hệ thống xác minh `userId` từ token khớp với bản ghi trong DB.
   - Kiểm tra tính hợp lệ của các trường gửi lên:
     - `dateOfBirth`: Định dạng ngày tháng hợp lệ.
     - `gender`: Phải là một trong các giá trị đã định nghĩa (Nam/Nữ/Khác).
     - `phone`: Định dạng số điện thoại hợp lệ và phải là duy nhất.
     - `avatarUrl`: Phải là URL hợp lệ.
     - `address`: Không rỗng.
     - `nationalId`: Phải là duy nhất và định dạng hợp lệ.
   - Thực hiện cập nhật các trường hợp lệ, ghi lại `updatedAt` mới.

4. **Phản hồi kết quả**:
   - Trả về thông báo `"Cập nhật thông tin thành công"` kèm dữ liệu người dùng mới (ngoại trừ trường `password`).
   - Nếu có lỗi (VD: định dạng không hợp lệ, người dùng không tồn tại) sẽ trả về phản hồi chuẩn `message`, `data: null`, `errorCode`.

---

## ✅ Mẫu Payload Yêu Cầu

```json
{
  "firstName": "Minh",
  "lastName": "Hiếu",
  "dateOfBirth": "2000-01-01",
  "gender": "Nam",
  "phone": "0987654321",
  "avatarUrl": "https://cdn.example.com/avatar.png",
  "address": "123 Trần Hưng Đạo, Quận 1, TP.HCM"
}
```

---

## ✅ Mẫu Phản Hồi Thành Công

```json
{
  "message": "Cập nhật thông tin thành công",
  "data": {
    "id": "user_id",
    "fullName": "Minh Hiếu",
    "phone": "0987654321",
    ...
  },
  "errorCode": null
}
```

---

## 📌 Ghi Chú

- Không cho phép người dùng tự ý thay đổi `email`, `roles`, `loyaltyPoints`, `membershipTier`, `password` thông qua tính năng này.
- Mỗi lần cập nhật `firstName` hoặc `lastName`, trường `fullName` sẽ được tự động cập nhật lại nhờ middleware tại schema.
- Chỉ người dùng hợp lệ với access token mới có thể thực hiện được hành động cập nhật này.
