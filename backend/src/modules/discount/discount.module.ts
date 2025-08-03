// --- [Imports] ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountController } from './controllers/discount.controller';
import { Discount, DiscountSchema } from './schemas/discount.schema';
import { DiscountService } from './services/discount.service';

// --- [DiscountModule] ---
@Module({
  imports: [MongooseModule.forFeature([{ name: Discount.name, schema: DiscountSchema }])],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule {}
