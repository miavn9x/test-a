// ===============================
// DTO: Tạo đơn hàng (CreateOrderDto)
// Xác định dữ liệu đầu vào hợp lệ khi tạo đơn hàng từ phía client
// ===============================

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// --- DTO: Sản phẩm trong đơn hàng ---
export class OrderProductDto {
  @IsString()
  @IsNotEmpty()
  productCode: string; // Mã sản phẩm chính (bắt buộc)

  @IsString()
  @IsNotEmpty()
  variantCode: string; // Mã biến thể sản phẩm (bắt buộc)

  @IsNumber()
  @Min(1)
  quantity: number; // Số lượng sản phẩm đặt

  @IsNumber()
  @Min(0)
  finalPrice: number; // Giá cuối cùng sau chiết khấu (1 sản phẩm)
}

// --- DTO: Yêu cầu tạo đơn hàng ---
export class CreateOrderDto {
  @IsEmail()
  email: string; // Email người đặt hàng (phải tồn tại trong hệ thống)

  @IsString()
  @IsNotEmpty()
  phone: string; // Số điện thoại người nhận

  @IsString()
  @IsOptional()
  shippingAddress: string; // Địa chỉ giao hàng

  @IsString()
  @IsOptional()
  note?: string; // Ghi chú thêm cho đơn hàng (không bắt buộc)

  @IsString()
  @IsOptional()
  discountCode?: string; // Mã giảm giá áp dụng cho đơn hàng (không bắt buộc)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[]; // Danh sách sản phẩm trong đơn hàng
}
