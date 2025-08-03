// --- [Imports] ---
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from '../schemas/product-variant.schema';

// --- [Repository ProductVariantRepository] ---
@Injectable()
export class ProductVariantRepository {
  // --- [Khởi tạo Repository] ---
  constructor(
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  // --- [Tạo 1 biến thể] ---
  async create(payload: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.variantModel.create(payload);
  }

  // --- [Tạo nhiều biến thể] ---
  async createMany(payloads: Partial<ProductVariant>[]): Promise<ProductVariant[]> {
    const result = await this.variantModel.insertMany(payloads);
    return result.map(r => r.toObject()) as ProductVariant[];
  }

  // --- [Cập nhật 1 biến thể theo code & productCode] ---
  async updateOneByCodeAndProductCode(
    code: string,
    productCode: string,
    dto: Partial<ProductVariant>,
  ): Promise<ProductVariant | null> {
    return this.variantModel
      .findOneAndUpdate({ code, productCode }, dto, { new: true })
      .lean()
      .exec();
  }

  // --- [Tìm 1 biến thể theo code & productCode] ---
  async findOneByCodeAndProductCode(
    code: string,
    productCode: string,
  ): Promise<ProductVariant | null> {
    return this.variantModel.findOne({ code, productCode }).lean().exec();
  }

  // --- [Lấy danh sách biến thể theo productCode] ---
  async findByProductCode(productCode: string): Promise<ProductVariant[]> {
    return this.variantModel.find({ productCode }).sort({ sortOrder: 1 }).lean().exec();
  }

  // --- [Lấy danh sách biến thể theo productCode & isActive] ---
  async findByProductCodeAndIsActive(
    productCode: string,
    isActive: boolean,
  ): Promise<ProductVariant[]> {
    return this.variantModel.find({ productCode, isActive }).sort({ sortOrder: 1 }).lean().exec();
  }

  // --- [Lấy danh sách số ngày theo dung lượng & trạng thái] ---
  async getDurationsByCapacityAndIsActive(
    productCode: string,
    capacity: number,
    isActive: boolean,
  ): Promise<number[]> {
    const variants = await this.variantModel
      .find({ productCode, capacity, isActive })
      .select('duration')
      .sort({ duration: 1 })
      .lean();
    return variants.map(v => v.duration);
  }

  // --- [Lấy biến thể theo dung lượng, số ngày & trạng thái] ---
  async getPriceByCapacityAndDurationAndIsActive(
    productCode: string,
    capacity: number,
    duration: number,
    isActive: boolean,
  ): Promise<ProductVariant | null> {
    return this.variantModel.findOne({ productCode, capacity, duration, isActive }).lean().exec();
  }

  // --- [Xoá biến thể theo code] ---
  async deleteByCode(code: string): Promise<void> {
    await this.variantModel.deleteOne({ code });
  }

  // --- [Xoá toàn bộ biến thể theo productCode] ---
  async deleteAllByProductCode(productCode: string): Promise<void> {
    await this.variantModel.deleteMany({ productCode });
  }

  // --- [Cập nhật productCode cho toàn bộ biến thể theo sản phẩm] ---
  async updateProductCodeForVariants(
    oldProductCode: string,
    newProductCode: string,
  ): Promise<void> {
    await this.variantModel.updateMany(
      { productCode: oldProductCode },
      { $set: { productCode: newProductCode } },
    );
  }
}
