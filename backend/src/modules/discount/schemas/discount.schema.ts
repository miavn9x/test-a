// --- [Imports] ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- [Discount Document] ---
export type DiscountDocument = Discount & Document;

// --- [Discount Schema] ---
@Schema({ timestamps: true, collection: 'discounts' })
export class Discount {
  // --- [Mã giảm giá] ---
  @Prop({ required: true, unique: true })
  code: string;

  // --- [Phần trăm giảm] ---
  @Prop({ required: true, min: 0, max: 100 })
  discountPercent: number;

  // --- [Thời gian tạo] ---
  @Prop()
  createdAt?: Date;

  // --- [Thời gian cập nhật] ---
  @Prop()
  updatedAt?: Date;
}

// --- [Schema Factory] ---
export const DiscountSchema = SchemaFactory.createForClass(Discount);
