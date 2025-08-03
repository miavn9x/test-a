// --- [Imports] ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CONTINENTS, ProductCategoryType } from '../constants/product-category.enum';

// --- [Types] ---
export type ProductCategoryDocument = ProductCategory & Document;

// --- [ProductCategory Schema] ---
@Schema({ timestamps: true, collection: 'product-categories' })
export class ProductCategory {
  // --- [Thông tin định danh] ---
  @Prop({ required: true, unique: true, index: true })
  code: string;

  // --- [Loại danh mục] ---
  @Prop({ required: true, enum: ProductCategoryType })
  type: ProductCategoryType;

  // --- [Khu vực địa lý - Châu lục] ---
  @Prop({
    type: [
      {
        vi: { type: String, required: true, enum: Object.values(CONTINENTS).map(c => c.vi) },
        en: { type: String, required: true, enum: Object.values(CONTINENTS).map(c => c.en) },
        _id: false,
      },
    ],
    required: true,
  })
  continent: {
    vi: string;
    en: string;
  }[];

  // --- [Khu vực địa lý - Quốc gia] ---
  @Prop({
    type: [
      {
        vi: { type: String, required: true },
        en: { type: String, required: true },
        _id: false,
      },
    ],
    required: true,
  })
  country: {
    vi: string;
    en: string;
  }[];

  // --- [Nhà mạng] ---
  @Prop({
    type: [
      {
        vi: { type: String, required: true },
        en: { type: String, required: true },
        _id: false,
      },
    ],
    required: true,
  })
  networkName: {
    vi: string;
    en: string;
  }[];

  // --- [Tên hiển thị] ---
  @Prop({
    type: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
      _id: false,
    },
  })
  displayName: {
    vi: string;
    en: string;
  };

  // --- [Trạng thái & thời gian] ---
  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

// --- [Schema Factory] ---
export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);

// --- [Indexes] ---
ProductCategorySchema.index({ code: 1, isActive: 1 });
ProductCategorySchema.index({ type: 1, isActive: 1 });
