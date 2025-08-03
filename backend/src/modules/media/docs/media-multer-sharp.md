# 📦 Media Upload Config - Multer & Sharp

Tài liệu này mô tả cách cấu hình `Multer` để xử lý upload file và `Sharp` để nén ảnh vượt quá dung lượng giới hạn trong dự án **NestJS**.

---

## 🚀 Mục tiêu

- Hỗ trợ upload ảnh và video từ client.
- Tự động sinh tên file và đường dẫn lưu trữ.
- Hạn chế loại MIME không hợp lệ.
- Nén ảnh lớn hơn 1MB để tối ưu dung lượng.
- Chuẩn hóa metadata cho file upload.

---

## 📂 Cấu hình Multer

```ts
export const multerConfig: Options = { ... };
```

### 1. Storage (Lưu trữ)

```ts
storage: diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = generateUploadPath(); // ./uploads/yyyy/mm/dd
    fs.mkdirSync(uploadPath, { recursive: true });
    req['uploadPath'] = uploadPath;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { fullName, slug, extension, absolutePath } = generateFileName(file);
    (file as ExtendedMulterFile)['customUploadInfo'] = {
      fullName,
      slug,
      extension,
      absolutePath,
    };
    cb(null, fullName);
  },
});
```

- 📁 Đường dẫn upload tự sinh theo ngày: `uploads/YYYY/MM/DD`.
- 📛 Tên file dùng `UUID + slug + extension`.
- 🧾 Lưu metadata tạm trong `file.customUploadInfo`.

---

### 2. File Filter (Bộ lọc định dạng)

```ts
fileFilter: (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) return cb(null, false);
  if (file.mimetype.startsWith('image/') && file.size > 1MB) return cb(null, false);
  return cb(null, true);
}
```

- ✅ Chấp nhận: `jpg`, `jpeg`, `png`, `webp`, `gif`, `mp4`.
- ❌ Từ chối MIME không hợp lệ hoặc ảnh lớn hơn 1MB.
- ⚠️ Kiểm tra thêm trong Controller nếu cần logic khác.

---

### 3. MIME Types Hỗ Trợ

```ts
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
];
```

---

## 🛠️ Utility xử lý file

### `generateUploadPath()`

Tạo thư mục upload tự động theo ngày hiện tại:

```ts
// Example: /project-root/uploads/2025/07/05
```

---

### `generateFileName(file)`

Sinh ra:

- `fullName`: tên file hoàn chỉnh.
- `slug`: chuỗi thân thiện URL.
- `extension`: định dạng.
- `absolutePath`: đường dẫn tuyệt đối lưu file.

---

### `generateFileMetadata(file, ...)`

Tạo metadata chuẩn cho file sau khi upload:

```ts
{
  mediaCode: 'media_image_xxxx',
  originName: 'original.jpg',
  slug: 'original-1720129381',
  type: 'image' | 'video',
  mimeType: 'image/jpeg',
  extension: 'jpg',
  size: 849230,
  width: 1920,
  height: 1080,
  url: '/uploads/2025/07/05/filename.jpg'
}
```

---

## 🧼 Xử lý ảnh với Sharp

```ts
await compressImageIfNeeded(absPath: string, maxSizeMB = 1, quality = 80)
```

### Cơ chế hoạt động

1. Kiểm tra size > 1MB → tiến hành nén.
2. Tạo bản `.tmp` → nén bằng `sharp`.
3. Ghi đè lại file gốc.
4. Ghi log trước/sau quá trình nén.

### Định dạng ảnh được nén

```ts
export const SUPPORTED_IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
```

---

## ⚠️ Xử lý lỗi upload - Exception Filter

```ts
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter
```

### Mapping mã lỗi → thông báo

| Multer Code             | Thông điệp                  | ErrorCode               |
| ----------------------- | --------------------------- | ----------------------- |
| `LIMIT_FILE_SIZE`       | File vượt quá dung lượng    | `FILE_TOO_LARGE`        |
| `LIMIT_FILE_COUNT`      | Số lượng file vượt giới hạn | `FILE_COUNT_EXCEEDED`   |
| `LIMIT_PART_COUNT`      | Quá nhiều phần trong form   | `PART_COUNT_EXCEEDED`   |
| `LIMIT_FIELD_KEY`       | Field key quá dài           | `FIELD_KEY_TOO_LONG`    |
| `LIMIT_FIELD_VALUE`     | Field value quá lớn         | `FIELD_VALUE_TOO_LARGE` |
| `LIMIT_FIELD_COUNT`     | Quá nhiều field             | `FIELD_COUNT_EXCEEDED`  |
| `LIMIT_UNEXPECTED_FILE` | Trường không hợp lệ         | `UNEXPECTED_FILE_FIELD` |

---

## 📎 Interface liên quan

```ts
export interface ExtendedMulterFile extends Express.Multer.File {
  metadata?: FileMetadata;
  customUploadInfo?: {
    fullName: string;
    slug: string;
    extension: string;
    absolutePath: string;
  };
}
```

```ts
export interface FileMetadata {
  mediaCode: string;
  originName: string;
  slug: string;
  type: string;
  mimeType: string;
  extension: string;
  size: number;
  width?: number | null;
  height?: number | null;
  url: string;
}
```

---

## ✅ Kết luận

- Hệ thống upload đã được chuẩn hóa:
  - Có phân loại MIME rõ ràng.
  - Tự động nén ảnh lớn.
  - Cấu trúc lưu trữ có tổ chức.
  - Metadata đầy đủ để lưu DB.
- Dễ dàng tích hợp trong `MediaModule`, hỗ trợ tương lai mở rộng sang lưu trữ cloud (S3, Cloudinary…).
