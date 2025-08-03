// --- [Imports] ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// --- [Product Schema] ---
@Schema({ timestamps: true, collection: 'products' })
export class Product {
  // --- [Thông tin định danh] ---
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ required: true, index: true })
  productCategoryCode: string;

  // --- [Thông tin hiển thị & tìm kiếm] ---
  @Prop({
    type: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
      _id: false,
    },
  })
  name: {
    vi: string;
    en: string;
  };

  @Prop({
    type: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
      _id: false,
    },
  })
  description?: {
    vi: string;
    en: string;
  };

  @Prop({
    type: {
      vi: { type: [String], default: [] },
      en: { type: [String], default: [] },
      _id: false,
    },
  })
  tokens: {
    vi: string[];
    en: string[];
  };

  // --- [Hình ảnh] ---
  @Prop({
    type: {
      url: { type: String, required: true },
      mediaCode: { type: String, required: true },
      _id: false,
    },
    required: true,
  })
  cover: {
    url: string;
    mediaCode: string;
  };

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        mediaCode: { type: String, required: true },
        _id: false,
      },
    ],
    default: [],
  })
  gallery: {
    url: string;
    mediaCode: string;
  }[];

  // --- [Khoảng giá] ---

  @Prop({
    type: {
      vnd: {
        type: {
          min: { type: Number, required: true },
          max: { type: Number, required: true },
          _id: false,
        },
        required: true,
        default: { min: 0, max: 0 },
        _id: false,
      },
      usd: {
        type: {
          min: { type: Number, required: true },
          max: { type: Number, required: true },
          _id: false,
        },
        required: true,
        default: { min: 0, max: 0 },
        _id: false,
      },
      _id: false,
    },
    required: true,
    default: {
      vnd: { min: 0, max: 0 },
      usd: { min: 0, max: 0 },
    },
  })
  priceRange: {
    vnd: {
      min: number;
      max: number;
    };
    usd: {
      min: number;
      max: number;
    };
  };

  // --- [Thông số kỹ thuật] ---

  // Danh sách dung lượng (GB), mặc định là đơn vị GB
  @Prop({ type: [String], default: [] })
  capacities: string[];

  // Danh sách số ngày sử dụng (ngày)
  @Prop({ type: [Number], default: [] })
  durations: number[];

  // --- [Trạng thái & thời gian] ---
  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

// --- [Schema Factory] ---
// Tạo mongoose schema từ class Product.
export const ProductSchema = SchemaFactory.createForClass(Product);

// --- [Indexes] ---
ProductSchema.index({ productCategoryCode: 1, isActive: 1 });
ProductSchema.index({ 'tokens.vi': 1, isActive: 1 });
ProductSchema.index({ 'tokens.en': 1, isActive: 1 });
