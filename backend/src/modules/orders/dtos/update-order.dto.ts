import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { CreateOrderDto } from './create-order.dto';

/**
 * DTO: Cập nhật đơn hàng (UpdateOrderDto)
 * Cho phép cập nhật các trường linh hoạt từ phía backend hoặc admin.
 * Kế thừa toàn bộ trường từ CreateOrderDto (dạng optional),
 * đồng thời bổ sung thêm các trường nội bộ như trạng thái xử lý và thanh toán.
 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
