// --- Schema: Order (Đơn hàng) ---

// --- Import Dependencies ---
// Import các thư viện cần thiết từ NestJS và Mongoose để định nghĩa schema và xử lý lỗi
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

// --- Middleware Functions ---
// Import các middleware kiểm tra dữ liệu và xử lý logic trước khi lưu đơn hàng
import { checkProductAndVariant } from '../middlewares/validate-order.middleware';

// --- Enum: Trạng thái đơn hàng và thanh toán ---
// Định nghĩa các trạng thái hợp lệ cho đơn hàng và trạng thái thanh toán, giúp đảm bảo tính nhất quán trong dữ liệu

// Trạng thái đơn hàng biểu thị quá trình xử lý đơn hàng trong hệ thống
export enum OrderStatus {
  // Đơn hàng đang chờ xử lý, chưa được xác nhận
  PENDING = 'PENDING',
  // Đơn hàng đã được xác nhận bởi hệ thống hoặc nhân viên
  CONFIRMED = 'CONFIRMED',
  // Đơn hàng đã được gửi đi giao hàng
  SHIPPED = 'SHIPPED',
  // Đơn hàng đã được giao thành công tới khách hàng
  DELIVERED = 'DELIVERED',
  // Đơn hàng đã bị hủy, không tiếp tục xử lý
  CANCELLED = 'CANCELLED',
}

// Trạng thái thanh toán biểu thị tình trạng thanh toán của đơn hàng
export enum PaymentStatus {
  // Khách hàng chưa thanh toán cho đơn hàng
  UNPAID = 'UNPAID',
  // Khách hàng đã thanh toán đầy đủ cho đơn hàng
  PAID = 'PAID',
  // Đơn hàng đã được hoàn tiền lại cho khách hàng
  REFUNDED = 'REFUNDED',
}

// --- Kiểu dữ liệu Document của Mongoose ---
// Kết hợp giữa interface Order và Document của Mongoose để sử dụng trong các thao tác với database
export type OrderDocument = Order & Document;

// --- Subdocument Schema: Sản phẩm trong đơn hàng ---
// Định nghĩa cấu trúc của một sản phẩm trong đơn hàng (sử dụng làm subdocument)
const ProductInOrderSchema = new mongoose.Schema(
  {
    // Mã sản phẩm chính (bắt buộc)
    productCode: { type: String, required: true },

    // Mã biến thể sản phẩm (bắt buộc - nếu không có thì truyền rỗng)
    variantCode: { type: String, required: true },

    // Số lượng sản phẩm đặt mua (>= 1)
    quantity: { type: Number, required: true, min: 1 },

    // Giá cuối cùng sau chiết khấu (>= 0)
    finalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

// --- Định nghĩa Schema: Order ---
// Định nghĩa cấu trúc dữ liệu của đơn hàng trong MongoDB với các trường cụ thể và ràng buộc dữ liệu
@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  // --- Cấu trúc trường dữ liệu ---

  /**
   * Mã đơn hàng duy nhất, dùng để truy xuất và quản lý đơn hàng dễ dàng.
   * Đây là trường bắt buộc và phải là duy nhất trong collection.
   */
  @Prop({ required: true, unique: true })
  code: string;

  /**
   * Email của người nhận hàng.
   * Trường bắt buộc, mặc định là chuỗi rỗng nếu không có dữ liệu.
   */
  @Prop({ required: true, default: '' })
  email: string;

  /**
   * Số điện thoại của người nhận hàng.
   * Trường bắt buộc, mặc định là chuỗi rỗng nếu không có dữ liệu.
   */
  @Prop({ required: true, default: '' })
  phone: string;

  /**
   * Địa chỉ giao hàng.
   * Trường bắt buộc, mặc định là chuỗi rỗng nếu không có dữ liệu.
   */
  @Prop({ default: '' })
  shippingAddress: string;

  /**
   * Ghi chú thêm cho đơn hàng (nếu có).
   * Trường bắt buộc, mặc định là chuỗi rỗng nếu không có dữ liệu.
   */
  @Prop({ required: true, default: '' })
  note: string;

  /**
   * Danh sách các sản phẩm trong đơn hàng.
   * Mỗi sản phẩm bao gồm:
   * - productCode: mã định danh sản phẩm trong hệ thống (bắt buộc).
   * - variantCode: mã định danh biến thể sản phẩm (không bắt buộc).
   * - quantity: số lượng sản phẩm khách hàng đặt mua (bắt buộc, >= 0).
   * - finalPrice: giá cuối cùng của sản phẩm sau chiết khấu (bắt buộc, >= 0).
   * Trường này là mảng và bắt buộc phải có ít nhất một sản phẩm.
   */
  @Prop({ type: [ProductInOrderSchema], required: true })
  products: {
    productCode: string;
    variantCode: string;
    quantity: number;
    finalPrice: number;
  }[];

  /**
   * Tổng số tiền của toàn bộ đơn hàng,
   * là tổng giá cuối cùng của tất cả các sản phẩm trong đơn.
   * Trường bắt buộc và giá trị phải lớn hơn hoặc bằng 0.
   */
  @Prop({ required: true, min: 0 })
  totalPrice: number;

  /**
   * Trạng thái hiện tại của đơn hàng,
   * thể hiện bước xử lý đơn hàng trong quy trình bán hàng.
   * Giá trị thuộc enum OrderStatus.
   * Trường bắt buộc, mặc định là PENDING.
   */
  @Prop({ required: true, enum: Object.values(OrderStatus), default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  /**
   * Trạng thái thanh toán của đơn hàng,
   * cho biết khách hàng đã thanh toán hay chưa.
   * Giá trị thuộc enum PaymentStatus.
   * Trường bắt buộc, mặc định là UNPAID.
   */
  @Prop({ required: true, enum: Object.values(PaymentStatus), default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  /**
   * Ảnh mã QR thanh toán, được sinh ra khi tạo đơn,
   * dùng để khách hàng quét thanh toán.
   * Trường bắt buộc, mặc định là chuỗi rỗng.
   */
  @Prop({ required: true, default: '' })
  qrImageUrl: string;

  /**
   * Thời gian tạo đơn hàng,
   * được tự động tạo bởi Mongoose khi lưu dữ liệu.
   * Trường bắt buộc và có chỉ mục để tối ưu truy vấn.
   */
  @Prop({ index: true })
  createdAt: Date;

  /**
   * Thời gian cập nhật cuối cùng của đơn hàng,
   * được tự động cập nhật khi có thay đổi dữ liệu.
   * Trường bắt buộc và có chỉ mục để tối ưu truy vấn.
   */
  @Prop({ index: true })
  updatedAt: Date;
}

// --- Tạo Schema từ Class ---
// Tạo schema Mongoose từ class Order để sử dụng trong các thao tác CRUD với MongoDB
export const OrderSchema = SchemaFactory.createForClass(Order);

// --- Chỉ mục (Indexes) ---

/**
 * Chỉ mục tổ hợp phục vụ cho việc:
 * - Tìm kiếm đơn theo mã đơn hàng
 * - Lọc theo trạng thái xử lý & thanh toán
 * - Sắp xếp theo thời gian tạo & cập nhật
 */
OrderSchema.index({ code: 1, orderStatus: 1, paymentStatus: 1, createdAt: -1, updatedAt: -1 });
/**
 * Các chỉ mục riêng biệt cho từng trường thường dùng để lọc hoặc tìm kiếm độc lập
 */

// Chỉ mục phục vụ lọc theo trạng thái
OrderSchema.index({ orderStatus: 1 });
// Chỉ mục phục vụ lọc đơn chưa thanh toán
OrderSchema.index({ paymentStatus: 1 });
// Chỉ mục phục vụ lọc và sắp xếp theo thời gian tạo đơn
OrderSchema.index({ createdAt: -1 });
// Chỉ mục phục vụ lọc và sắp xếp theo thời gian cập nhật đơn
OrderSchema.index({ updatedAt: -1 });

// --- Middleware xử lý trước khi lưu ---
// Kiểm tra productCode và variantCode hợp lệ
OrderSchema.pre<OrderDocument>('save', checkProductAndVariant);
