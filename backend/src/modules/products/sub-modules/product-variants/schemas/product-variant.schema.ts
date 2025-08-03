// --- [ProductVariant Schema] ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- [Kiểu dữ liệu] ---
export type ProductVariantDocument = ProductVariant & Document;

// --- [Định nghĩa ProductVariant Schema] ---
@Schema({ collection: 'product-variants' })
export class ProductVariant {
  // --- [Thông tin định danh] ---
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ required: true, index: true })
  productCode: string;

  // --- [Thông số kỹ thuật & giá bán] ---
  /** Dung lượng (GB), mặc định là đơn vị GB */
  @Prop({ required: true })
  capacity: string;

  /** Số ngày sử dụng */
  @Prop({ required: true })
  duration: number;

  /** Giá bán theo VND (gồm giá gốc, phần trăm giảm, giá sau giảm) */
  @Prop({
    type: {
      original: { type: Number, required: true },
      discountPercent: { type: Number, default: 0, min: 0, max: 100 },
      final: { type: Number, required: true },
      _id: false,
    },
    required: true,
  })
  vndPrice: {
    original: number;
    discountPercent: number;
    final: number;
  };

  /** Giá bán theo USD (gồm giá gốc, phần trăm giảm, giá sau giảm) */
  @Prop({
    type: {
      original: { type: Number, required: true },
      discountPercent: { type: Number, default: 0, min: 0, max: 100 },
      final: { type: Number, required: true },
      _id: false,
    },
    required: true,
  })
  usdPrice: {
    original: number;
    discountPercent: number;
    final: number;
  };

  // --- [Trạng thái & thời gian] ---
  @Prop({ default: true, index: true })
  isActive: boolean;
}

// --- [Schema Factory] ---
export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

// --- [Indexes] ---
ProductVariantSchema.index({ productCode: 1, isActive: 1 });
ProductVariantSchema.index({ productCode: 1, capacity: 1, isActive: 1 });
