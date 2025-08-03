# Tổng quan MediaController

## 🧭 Base Route

- Tất cả các endpoint dưới MediaController được đặt dưới tiền tố `/media`

## 📚 Tổng hợp các API

| Method | Endpoint                      | Mô tả                                  |
| ------ | ----------------------------- | -------------------------------------- |
| POST   | /media/upload                 | Upload một file đơn lẻ                 |
| POST   | /media/uploads                | Upload nhiều file cùng lúc (tối đa 10) |
| DELETE | /media/:mediaCode/hard-delete | Xoá vĩnh viễn một media khỏi hệ thống  |

---

## Mô tả MediaController

### POST /upload

#### 🎯 Mục đích endpoint /upload

Tải lên một file duy nhất (ảnh hoặc video), lưu file vào hệ thống và lưu metadata vào MongoDB.

#### 📝 Tham số endpoint /upload

- `file` (multipart/form-data): File upload duy nhất (hỗ trợ ảnh/video).
- `usage` (MediaUsageEnum): Mục đích sử dụng file – ví dụ: `product`, `user`, `post`, ...

#### ⚙️ Xử lý backend endpoint /upload

1. Sử dụng `FileInterceptor` kết hợp cấu hình `multerConfig` để:
   - Kiểm tra định dạng MIME type (chỉ cho phép các định dạng ảnh/video).
   - Lưu file vào thư mục `uploads/yyyy/mm/dd`.
   - Tạo các thông tin tạm thời: `slug`, `extension`, `absolutePath` → lưu vào `customUploadInfo` của file.
2. Validate giá trị `usage` (phải nằm trong enum `MediaUsageEnum`).
3. Từ `customUploadInfo`, sử dụng `generateFileMetadata()` để tạo metadata đầy đủ (bao gồm size, type, slug, v.v.).
4. Gọi `mediaService.handleSingleUpload(metadata, usage)` để lưu thông tin vào MongoDB.
5. Trả về thông tin media đã lưu.

#### ✅ Phản hồi thành công (một file)

```json
{
  "message": "Upload thành công",
  "data": {
    "mediaCode": "media_image_80ab4aba-bc18-4b75-a3c6-d3591a1062f4",
    "originalName": "Ảnh màn hình 2025-07-04 lúc 20.49.32.png",
    "slug": "anh-man-hinh-2025-07-04-luc-204932-1751694030326",
    "usage": "product",
    "type": "image",
    "mimeType": "image/png",
    "extension": "png",
    "size": 68453,
    "width": null,
    "height": null,
    "url": "/uploads/2025/07/05/anh-man-hinh-2025-07-04-luc-204932-1751694030326.png",
    "storageType": "local",
    "isActive": true,
    "isDeleted": false,
    "deletedAt": null,
    "_id": "6868bace2771b11277f21968",
    "createdAt": "2025-07-05T05:40:30.329Z",
    "updatedAt": "2025-07-05T05:40:30.329Z"
  },
  "errorCode": null
}
```

#### ❌ Lỗi có thể gặp (một file)

- `FILE_REQUIRED`: Không có file hoặc thiếu thông tin tạm `customUploadInfo`.
- `Usage không hợp lệ`: usage không nằm trong enum cho phép.

---

### POST /uploads

#### 🎯 Mục đích endpoint /uploads

Tải lên nhiều file cùng lúc (tối đa 10 file), lưu từng file và metadata tương ứng vào MongoDB.

#### 📝 Tham số

- `files` (multipart/form-data): Mảng file ảnh/video.
- `usage` (MediaUsageEnum): Mục đích sử dụng của các file.

#### ⚙️ Xử lý backend endpoint /uploads

1. Dùng `FilesInterceptor` với giới hạn tối đa 10 file.
2. Với mỗi file:
   - Lấy thông tin `slug`, `extension`, `absolutePath` từ `customUploadInfo`.
   - Gọi `generateFileMetadata(...)` để tạo metadata.
3. Validate `usage` nằm trong enum cho phép.
4. Gọi `mediaService.handleMultiUpload(metadataList, usage)` để lưu hàng loạt vào MongoDB.
5. Trả về danh sách media đã được lưu thành công.

#### ✅ Phản hồi thành công (nhiều file)

```json
{
  "message": "Upload nhiều file thành công",
  "data": [
    {
      "mediaCode": "media_image_87385063-5173-4636-82e1-f17b8bb6f9f2",
      "originalName": "Ảnh màn hình 2025-07-04 lúc 20.49.32.png",
      "slug": "anh-man-hinh-2025-07-04-luc-204932-1751694093381",
      "usage": "product",
      "type": "image",
      "mimeType": "image/png",
      "extension": "png",
      "size": 68453,
      "width": null,
      "height": null,
      "url": "/uploads/2025/07/05/anh-man-hinh-2025-07-04-luc-204932-1751694093381.png",
      "storageType": "local",
      "isActive": true,
      "isDeleted": false,
      "deletedAt": null,
      "_id": "6868bb0d2771b11277f2196a",
      "createdAt": "2025-07-05T05:41:33.385Z",
      "updatedAt": "2025-07-05T05:41:33.385Z"
    },
    {
      "mediaCode": "media_image_73bc4449-f803-48f0-a1e7-a30d5d151060",
      "originalName": "screencapture-localhost-3000-tai-khoan-thong-tin-2025-06-30-19_50_28.png",
      "slug": "screencapture-localhost-3000-tai-khoan-thong-tin-2025-06-30-195028-1751694093381",
      "usage": "product",
      "type": "image",
      "mimeType": "image/png",
      "extension": "png",
      "size": 394730,
      "width": null,
      "height": null,
      "url": "/uploads/2025/07/05/screencapture-localhost-3000-tai-khoan-thong-tin-2025-06-30-195028-1751694093381.png",
      "storageType": "local",
      "isActive": true,
      "isDeleted": false,
      "deletedAt": null,
      "_id": "6868bb0d2771b11277f2196b",
      "createdAt": "2025-07-05T05:41:33.385Z",
      "updatedAt": "2025-07-05T05:41:33.385Z"
    }
  ],
  "errorCode": null
}
```

#### ❌ Lỗi có thể gặp (nhiều file)

- `FILE_REQUIRED`: Nếu một file không có `customUploadInfo`.
- `Usage không hợp lệ`.

---

### DELETE /media/:mediaCode/hard-delete

#### 🎯 Mục đích endpoint /:mediaCode/hard-delete

Xoá vĩnh viễn một media khỏi hệ thống:

- Xoá file khỏi thư mục `uploads/...`.
- Xoá bản ghi trong MongoDB.

#### 📝 Tham số endpoint /:mediaCode/hard-delete

- `mediaCode` (string): Mã định danh của media (ví dụ: `media_image_xxx`, `media_video_xxx`).

#### ⚙️ Xử lý backend endpoint /:mediaCode/hard-delete

1. Gọi `mediaService.getByMediaCode(mediaCode)` để lấy media từ DB.
2. Nếu không tìm thấy → trả về lỗi `MEDIA_NOT_FOUND`.
3. Nếu có:
   - Gọi `fs.unlink(process.cwd() + media.url)` để xoá file vật lý.
   - Nếu lỗi → log cảnh báo nhưng không throw exception.
4. Gọi `mediaService.hardDeleteByMediaCode(mediaCode)` để xoá bản ghi khỏi MongoDB.

#### ✅ Phản hồi thành công (xoá media)

```json
{
  "message": "Xoá media thành công",
  "data": null,
  "errorCode": null
}
```

#### ❌ Lỗi có thể gặp (xoá media)

- `MEDIA_NOT_FOUND`: Không tồn tại media tương ứng.
- Cảnh báo `Không thể xoá file vật lý`: Ghi log nếu không xoá được file, không ảnh hưởng xoá DB.
