# Media Schema

## Tham chiếu file thực tế [`src/modules/media/media.schema.ts`](../media.schema.ts)

## Khái quát

- Xác định cấu trúc dữ liệu MongoDB cho media (ảnh, video), bao gồm thông tin định danh, nội dung file, lưu trữ và trạng thái hoạt động.

---

## 🧠 Tổng quan

`MediaSchema` đại diện cho cấu trúc lưu trữ thông tin của một media object trong hệ thống.
Nó mở rộng từ `BaseTimestampsSchema` và tự động lưu `createdAt`, `updatedAt`.
Mỗi media được gán `mediaCode`, định danh duy nhất với tiền tố theo loại (`image`, `video`).

---

## 🧩 Các trường chính

### 🔖 Định danh & thông tin cơ bản

| Trường         | Kiểu             | Mô tả                                            |
| -------------- | ---------------- | ------------------------------------------------ |
| `mediaCode`    | `string`         | Mã định danh duy nhất, sinh bởi BE.              |
| `originalName` | `string`         | Tên gốc của file khi upload.                     |
| `slug`         | `string`         | Slug từ originalName + timestamp, unique.        |
| `usage`        | `MediaUsageEnum` | Mục đích sử dụng media (product, post, user,...) |

---

### 🖼️ Nội dung & định dạng file

| Trường      | Kiểu                 | Mô tả                   |
| ----------- | -------------------- | ----------------------- |
| `type`      | `'image' \| 'video'` | Loại media              |
| `mimeType`  | `MediaMimeTypeEnum`  | MIME chuẩn              |
| `extension` | `MediaExtensionEnum` | Phần mở rộng            |
| `size`      | `number`             | Kích thước file (bytes) |
| `width`     | `number \| null`     | Chiều rộng (nếu có)     |
| `height`    | `number \| null`     | Chiều cao (nếu có)      |

---

### 📦 Lưu trữ & đường dẫn

| Trường        | Kiểu                   | Mô tả                         |
| ------------- | ---------------------- | ----------------------------- |
| `url`         | `string`               | Đường dẫn file (local/CDN/S3) |
| `storageType` | `MediaStorageTypeEnum` | Nguồn lưu trữ                 |

---

### ✅ Trạng thái & xoá mềm

| Trường      | Kiểu           | Mô tả             |
| ----------- | -------------- | ----------------- |
| `isActive`  | `boolean`      | Mặc định `true`   |
| `isDeleted` | `boolean`      | Mặc định `false`  |
| `deletedAt` | `Date \| null` | Thời gian xoá mềm |

---

### 🕒 Timestamps kế thừa từ `BaseTimestampsSchema`

- `createdAt`: thời gian tạo
- `updatedAt`: thời gian cập nhật gần nhất

---

## 🧩 Indexes

MediaSchema được tối ưu với các chỉ mục sau:

```ts
mediaCode: 1 (unique)
slug: 1 (unique)
type: 1
usage: 1
storageType: 1
isDeleted: 1, isActive: 1
createdAt: -1
```

---

## 📌 Ghi chú bổ sung

- `mediaCode`, `slug` được sinh backend – frontend không gửi.
- Các enum bắt buộc: `usage`, `mimeType`, `extension`, `storageType`.
- Mỗi media object gắn liền với `usage` để phân loại chức năng.
