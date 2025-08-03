# Tổng quan MediaService

## Tham chiếu file thực tế [`src/modules/media/media.service.ts`](../media.service.ts)

## Khái quát

- Xử lý nghiệp vụ liên quan đến media (hình ảnh, video), bao gồm upload một hoặc nhiều file, truy xuất, và xoá media

---

## 🧠 Tổng quan

`MediaService` chịu trách nhiệm xử lý các thao tác với media như:

- Upload một media (`handleSingleUpload`)
- Upload nhiều media (`handleMultiUpload`)
- Lấy thông tin media theo `mediaCode` (`getByMediaCode`)
- Xoá media khỏi hệ thống (`hardDeleteByMediaCode`)

Dịch vụ này làm việc với `MediaRepository` để thao tác dữ liệu media trong database.

---

## 🧩 Phụ thuộc

- [`MediaRepository`](../media.repository.ts): Thao tác cơ sở dữ liệu cho media.
- [`FileMetadata`](../../../common//interfaces//upload.interface.ts): Interface chứa thông tin file.
- Các enum:
  - [`MediaUsageEnum`](../enums/media-usage.enum.ts)
  - [`MediaMimeTypeEnum`](../enums/media-mime-type.enum.ts)
  - [`MediaExtensionEnum`](../enums/media-extension.enum.ts)
  - [`MediaStorageTypeEnum`](../enums/media-storage-type.enum.ts)

---

## 🚀 Các phương thức chính

### `handleSingleUpload(metadata: FileMetadata, usage: MediaUsageEnum)`

Upload một file media.
Tạo một bản ghi media mới trong DB với thông tin từ metadata.

**Tham số**:

- `metadata`: Metadata của file upload.
- `usage`: Enum xác định mục đích sử dụng media.

**Trả về**:

```ts
Promise<{ message: string; data: any; errorCode: null }>;
```

**Ví dụ**:

```ts
await mediaService.handleSingleUpload(fileMetadata, MediaUsageEnum.AVATAR);
```

---

### `handleMultiUpload(metadataList: FileMetadata[], usage: MediaUsageEnum)`

Upload nhiều file media một lúc.

**Tham số**:

- `metadataList`: Mảng metadata của các file.
- `usage`: Enum xác định mục đích sử dụng.

**Trả về**:

```ts
Promise<{ message: string; data: any[]; errorCode: null }>;
```

**Ví dụ**:

```ts
await mediaService.handleMultiUpload(listOfFileMetadata, MediaUsageEnum.GALLERY);
```

---

### `getByMediaCode(mediaCode: string)`

Tìm media theo `mediaCode`.

**Trả về**:
Media document hoặc `null` nếu không tìm thấy.

**Ví dụ**:

```ts
await mediaService.getByMediaCode('media_abc123');
```

---

### `hardDeleteByMediaCode(mediaCode: string)`

Xoá cứng media khỏi DB (không thể khôi phục).

**Ví dụ**:

```ts
await mediaService.hardDeleteByMediaCode('media_abc123');
```

---

## 📌 Ghi chú

- Tất cả media mặc định được gắn `storageType = LOCAL`, `isActive = true`, `isDeleted = false`.
- `slug`, `mediaCode`, `mimeType`, `extension` và các field như `width`, `height`, `size` được sinh bởi quá trình xử lý file trước đó (bên upload middleware hoặc service chuẩn hoá metadata).
