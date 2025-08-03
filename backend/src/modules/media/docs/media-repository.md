# MediaRepository

## Tham chiếu file thực tế: [`src/modules/media/media.repository.ts`](../media.repository.ts)

## Khái quát

- Thực hiện các thao tác trực tiếp với database MongoDB liên quan đến collection `media`.

---

## 🧠 Tổng quan

`MediaRepository` cung cấp các phương thức chuẩn để thao tác với `Media` document bao gồm:

- Tạo một media mới (`create`)
- Chèn nhiều media cùng lúc (`insertMany`)
- Truy vấn một media theo điều kiện (`findOne`)
- Xoá một media theo điều kiện (`deleteOne`)

Repository sử dụng Mongoose để kết nối và thao tác dữ liệu.

---

## 🧩 Phụ thuộc

- [`Media`](../media.schema.ts): Mongoose schema đại diện cho media.
- `MediaDocument`: Kiểu document của `Media`.
- `@InjectModel(Media.name)`: Sử dụng Mongoose Model injection.

---

## 🔍 Các phương thức

### `create(media: Partial<Media>): Promise<Media>`

Tạo một bản ghi media mới trong DB.

**Tham số**:

- `media`: Đối tượng chứa thông tin cần tạo.

**Trả về**:

- Document `Media` sau khi được lưu.

---

### `insertMany(mediaList: Partial<Media>[]): Promise<Media[]>`

Tạo nhiều bản ghi media một lần.

**Tham số**:

- `mediaList`: Mảng đối tượng media cần lưu.

**Trả về**:

- Mảng các document `Media` đã lưu (ở dạng `plain object` thông qua `.toObject()`).

---

### `findOne(condition: Partial<Media>): Promise<Media | null>`

Tìm một document media theo điều kiện.

**Tham số**:

- `condition`: Điều kiện tìm kiếm (ví dụ `{ mediaCode: 'media_123' }`)

**Trả về**:

- Document `Media` tương ứng hoặc `null` nếu không tìm thấy.

---

### `deleteOne(condition: Partial<Media>): Promise<void>`

Xoá một document media theo điều kiện.

**Tham số**:

- `condition`: Điều kiện xoá.

**Ghi chú**:

- Đây là xoá cứng khỏi DB (không phải xoá mềm).

---

## 🧩 Ghi chú bổ sung

- Sử dụng `.lean()` để đảm bảo kết quả trả về là plain object, nhẹ hơn.
- Repository không chứa logic nghiệp vụ, chỉ tập trung xử lý dữ liệu thuần tuý.
