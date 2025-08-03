# Mô tả Module Đơn hàng (Orders Module) trong NestJS

## Tổng quan

Module `Orders` trong NestJS quản lý các thao tác liên quan đến đơn hàng: tạo, truy vấn, cập nhật, lọc, xóa. Tích hợp Mongoose để tương tác với MongoDB, sử dụng schema `Order`, các DTO (`CreateOrderDto`, `UpdateOrderDto`, `FilterOrderQueryDto`, `GetOrderListQueryDto`), middleware để kiểm tra dữ liệu, controller xử lý API, service xử lý logic nghiệp vụ, và repository thao tác với cơ sở dữ liệu. Bảo mật bằng xác thực JWT và phân quyền `ADMIN` cho một số endpoint.

## Cấu trúc dữ liệu

### Schema Order

Định nghĩa cấu trúc đơn hàng trong MongoDB.

| Tên trường             | Kiểu dữ liệu                                            | Mô tả                                                                              | Ràng buộc                    |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| `code`                 | String                                                  | Mã đơn hàng duy nhất, định dạng `OD[ddMMyy][4 số ngẫu nhiên]`.                     | Bắt buộc, duy nhất, tự sinh  |
| `email`                | String                                                  | Email người đặt hàng, liên kết với người dùng.                                     | Bắt buộc, mặc định rỗng      |
| `phone`                | String                                                  | Số điện thoại người nhận.                                                          | Bắt buộc, mặc định rỗng      |
| `shippingAddress`      | String                                                  | Địa chỉ giao hàng.                                                                 | Bắt buộc, mặc định rỗng      |
| `note`                 | String                                                  | Ghi chú thêm cho đơn hàng.                                                         | Bắt buộc, mặc định rỗng      |
| `products`             | Array<{productCode, variantCode, quantity, finalPrice}> | Danh sách sản phẩm.                                                                | Bắt buộc                     |
| `products.productCode` | String                                                  | Mã định danh sản phẩm.                                                             | Bắt buộc                     |
| `products.variantCode` | String                                                  | Mã định danh biến thể sản phẩm.                                                    | Bắt buộc                     |
| `products.quantity`    | Number                                                  | Số lượng sản phẩm.                                                                 | Bắt buộc, >= 1               |
| `products.finalPrice`  | Number                                                  | Giá cuối cùng sau chiết khấu (VND).                                                | Bắt buộc, >= 0               |
| `totalPrice`           | Number                                                  | Tổng số tiền đơn hàng (VND).                                                       | Bắt buộc, >= 0               |
| `orderStatus`          | Enum (`OrderStatus`)                                    | Trạng thái đơn hàng (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`). | Bắt buộc, mặc định `PENDING` |
| `paymentStatus`        | Enum (`PaymentStatus`)                                  | Trạng thái thanh toán (`UNPAID`, `PAID`, `REFUNDED`).                              | Bắt buộc, mặc định `UNPAID`  |
| `qrImageUrl`           | String                                                  | URL ảnh QR thanh toán.                                                             | Bắt buộc, mặc định rỗng      |
| `createdAt`            | Date                                                    | Thời gian tạo đơn hàng, tự động bởi Mongoose.                                      | Tùy chọn, có chỉ mục         |
| `updatedAt`            | Date                                                    | Thời gian cập nhật đơn hàng, tự động bởi Mongoose.                                 | Tùy chọn, có chỉ mục         |

### Enum

- **OrderStatus**: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- **PaymentStatus**: `UNPAID`, `PAID`, `REFUNDED`

## DTO (Data Transfer Object)

### OrderProductDto

Cấu trúc sản phẩm trong đơn hàng.

| Tên trường    | Kiểu dữ liệu | Mô tả                               | Ràng buộc                  |
| ------------- | ------------ | ----------------------------------- | -------------------------- |
| `productCode` | String       | Mã sản phẩm.                        | Bắt buộc, chuỗi không rỗng |
| `variantCode` | String       | Mã biến thể sản phẩm.               | Bắt buộc, chuỗi không rỗng |
| `quantity`    | Number       | Số lượng sản phẩm.                  | Bắt buộc, số nguyên >= 1   |
| `finalPrice`  | Number       | Giá cuối cùng sau chiết khấu (VND). | Bắt buộc, số >= 0          |

### CreateOrderDto

Dữ liệu đầu vào để tạo đơn hàng.

| Tên trường        | Kiểu dữ liệu             | Mô tả                     | Ràng buộc                  |
| ----------------- | ------------------------ | ------------------------- | -------------------------- |
| `email`           | String                   | Email người đặt hàng.     | Bắt buộc, định dạng email  |
| `phone`           | String                   | Số điện thoại người nhận. | Bắt buộc, chuỗi không rỗng |
| `shippingAddress` | String                   | Địa chỉ giao hàng.        | Bắt buộc, chuỗi không rỗng |
| `note`            | String                   | Ghi chú đơn hàng.         | Tùy chọn, chuỗi            |
| `products`        | Array<`OrderProductDto`> | Danh sách sản phẩm.       | Bắt buộc, mảng hợp lệ      |

### UpdateOrderDto

Kế thừa `CreateOrderDto` (optional), bổ sung `orderStatus` và `paymentStatus`.

| Tên trường      | Kiểu dữ liệu           | Mô tả                  | Ràng buộc |
| --------------- | ---------------------- | ---------------------- | --------- |
| `orderStatus`   | Enum (`OrderStatus`)   | Trạng thái đơn hàng.   | Tùy chọn  |
| `paymentStatus` | Enum (`PaymentStatus`) | Trạng thái thanh toán. | Tùy chọn  |

### FilterOrderQueryDto

Lọc đơn hàng theo trạng thái.

| Tên trường      | Kiểu dữ liệu           | Mô tả                  | Ràng buộc |
| --------------- | ---------------------- | ---------------------- | --------- |
| `orderStatus`   | Enum (`OrderStatus`)   | Trạng thái đơn hàng.   | Tùy chọn  |
| `paymentStatus` | Enum (`PaymentStatus`) | Trạng thái thanh toán. | Tùy chọn  |

### GetOrderListQueryDto

Hỗ trợ phân trang.

| Tên trường | Kiểu dữ liệu | Mô tả                           | Ràng buộc                |
| ---------- | ------------ | ------------------------------- | ------------------------ |
| `page`     | Number       | Trang hiện tại (mặc định 1).    | Tùy chọn, số nguyên >= 1 |
| `limit`    | Number       | Số mục mỗi trang (mặc định 10). | Tùy chọn, số nguyên >= 1 |

## Middleware

Kiểm tra dữ liệu trước khi lưu vào MongoDB.

| Tên Middleware           | Mô tả                                                                            | Xử lý lỗi                                                                                |
| ------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `checkProductAndVariant` | Xác minh `productCode` và `variantCode` hợp lệ, đảm bảo biến thể thuộc sản phẩm. | `DB_NOT_CONNECTED`, `PRODUCT_NOT_FOUND`, `VARIANT_NOT_FOUND`, `VARIANT_PRODUCT_MISMATCH` |

## Chỉ mục (Indexes)

Tối ưu truy vấn:

- `code: 1`: Tìm kiếm theo mã đơn.
- `orderStatus: 1`: Lọc theo trạng thái đơn.
- `paymentStatus: 1`: Lọc theo trạng thái thanh toán.
- `createdAt: -1`: Sắp xếp theo thời gian tạo.
- `updatedAt: -1`: Sắp xếp theo thời gian cập nhật.

## Controller (OrderController)

API base: `/orders`. Tất cả yêu cầu xác thực JWT, một số giới hạn quyền `ADMIN`.

| Phương thức | Endpoint               | Mô tả                                             | Quyền truy cập        | Body/Params/Query                       | Kết quả                                 |
| ----------- | ---------------------- | ------------------------------------------------- | --------------------- | --------------------------------------- | --------------------------------------- |
| `POST`      | `/orders`              | Tạo đơn hàng mới.                                 | Đăng nhập (JWT)       | `CreateOrderDto` (body)                 | `StandardResponse` (đơn hàng được tạo)  |
| `GET`       | `/orders`              | Lấy danh sách đơn hàng (phân trang).              | `ADMIN` (JWT + Roles) | `page`, `limit` (query)                 | `{ items: Order[], total: number }`     |
| `GET`       | `/orders/detail/:code` | Lấy chi tiết đơn hàng theo mã.                    | `ADMIN` (JWT + Roles) | `code` (param)                          | `StandardResponse` (đơn hàng hoặc null) |
| `GET`       | `/orders/search`       | Tìm đơn hàng theo mã.                             | `ADMIN` (JWT + Roles) | `code` (query)                          | `StandardResponse` (đơn hàng hoặc null) |
| `GET`       | `/orders/filter`       | Lọc đơn hàng theo `orderStatus`, `paymentStatus`. | `ADMIN` (JWT + Roles) | `orderStatus`, `paymentStatus` (query)  | `StandardResponse` (danh sách đơn hàng) |
| `PATCH`     | `/orders/:code`        | Cập nhật đơn hàng.                                | `ADMIN` (JWT + Roles) | `code` (param), `UpdateOrderDto` (body) | `StandardResponse` (đơn hàng cập nhật)  |
| `DELETE`    | `/orders/:code`        | Xóa đơn hàng theo mã.                             | `ADMIN` (JWT + Roles) | `code` (param)                          | `StandardResponse` (xác nhận xóa)       |

## Service (OrderService)

Xử lý logic nghiệp vụ, tương tác với `OrderRepository`.

| Phương thức      | Mô tả                                                                | Tham số đầu vào                  | Kết quả                                                  |
| ---------------- | -------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------- |
| `createOrder`    | Tạo đơn hàng mới, sinh `code`, tính `totalPrice`, tạo QR thanh toán. | `CreateOrderDto`                 | `StandardResponse` (đơn hàng được tạo)                   |
| `getOrderList`   | Lấy danh sách đơn hàng, hỗ trợ phân trang.                           | `GetOrderListQueryDto`           | `{ items: Order[], total: number }`                      |
| `getOrderDetail` | Lấy chi tiết đơn hàng theo `code`.                                   | `code: string`                   | `StandardResponse` (đơn hàng hoặc null)                  |
| `filterOrders`   | Lọc đơn hàng theo `orderStatus`, `paymentStatus`.                    | `FilterOrderQueryDto`            | `Order[]`                                                |
| `updateOrder`    | Cập nhật đơn hàng, tính lại `totalPrice` và QR nếu có sản phẩm.      | `code: string`, `UpdateOrderDto` | `StandardResponse` (đơn hàng cập nhật hoặc null)         |
| `deleteOrder`    | Xóa đơn hàng theo `code`.                                            | `code: string`                   | `StandardResponse` (xác nhận xóa hoặc `ORDER_NOT_FOUND`) |

## Repository (OrderRepository)

Thao tác trực tiếp với MongoDB.

| Phương thức    | Mô tả                                      | Tham số đầu vào                          | Kết quả             |
| -------------- | ------------------------------------------ | ---------------------------------------- | ------------------- | ----- |
| `create`       | Tạo đơn hàng mới.                          | `Partial<Order>`                         | `Order`             |
| `paginate`     | Lấy danh sách đơn hàng, hỗ trợ phân trang. | `page: number`, `limit: number`          | `[Order[], number]` |
| `findByCode`   | Lấy chi tiết đơn hàng theo `code`.         | `code: string`                           | `Order              | null` |
| `findByFilter` | Lọc đơn hàng theo tiêu chí.                | `FilterQuery<OrderDocument>`             | `Order[]`           |
| `updateByCode` | Cập nhật đơn hàng theo `code`.             | `code: string`, `update: Partial<Order>` | `Order              | null` |
| `deleteByCode` | Xóa đơn hàng theo `code`.                  | `code: string`                           | `Order              | null` |

## Utilities

- `calcTotalOrderPrice`: Tính tổng tiền đơn hàng dựa trên `quantity` và `finalPrice`.
- `generateOrderCode`: Sinh mã đơn hàng (`OD[ddMMyy][4 số ngẫu nhiên]`).
- `generateQrImageUrl`: Tạo URL ảnh QR thanh toán VietQR dựa trên mã đơn và tổng tiền.

## Ghi chú chung

- **Collection**: `orders`, liên kết với `users` qua `email`.
- **Bảo mật**: JWT (`JwtAuthGuard`) và phân quyền (`RolesGuard`) cho endpoint `ADMIN`.
- **API base**: `/orders`.
- **Tách biệt tầng**: Middleware kiểm tra dữ liệu, repository xử lý truy vấn, service xử lý logic, controller xử lý API.
