import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentStatus } from 'src/modules/orders/schemas/order.schema';

export class FilterOrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
