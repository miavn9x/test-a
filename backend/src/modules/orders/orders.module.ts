// ===============================
// = Module: Đơn hàng (OrdersModule) =
// = Khai báo module quản lý đơn hàng, gồm controller, service, repository, schema =
// ===============================

// --- Imports ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'src/mail/mail.module';
import { Discount, DiscountSchema } from '../discount/schemas/discount.schema';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MailModule,
    MongooseModule.forFeature([{ name: Discount.name, schema: DiscountSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrdersModule {}
