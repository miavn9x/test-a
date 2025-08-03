import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContinentKey, CONTINENTS } from '../constants/product-category.enum';
import { ProductCategory, ProductCategoryDocument } from '../schemas/product-category.schema';

// --- [ProductCategoryRepository] ---
@Injectable()
export class ProductCategoryRepository {
  // --- [Khởi tạo Repository] ---
  constructor(
    @InjectModel(ProductCategory.name)
    private readonly model: Model<ProductCategoryDocument>,
  ) {}

  // --- [Tạo danh mục] ---
  async create(data: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.model.create(data);
  }

  // --- [Lấy danh mục theo code] ---
  async findByCode(code: string): Promise<ProductCategory | null> {
    return this.model.findOne({ code }).lean<ProductCategory>().exec();
  }

  // --- [Lấy danh mục cho Product theo code] ---
  async findByCategoryCode(code: string): Promise<ProductCategory | null> {
    return this.model.findOne({ code }).lean();
  }

  // --- [Cập nhật danh mục theo code] ---
  async updateByCode(
    code: string,
    data: Partial<ProductCategory>,
  ): Promise<ProductCategory | null> {
    return this.model
      .findOneAndUpdate({ code }, data, { new: true })
      .lean<ProductCategory>()
      .exec();
  }

  // --- [Xoá danh mục theo code] ---
  async deleteByCode(code: string): Promise<void> {
    await this.model.deleteOne({ code });
  }

  // --- [Lấy tất cả danh mục] ---
  async findAll(sortOption: Record<string, 1 | -1>): Promise<ProductCategory[]> {
    return this.model.find().sort(sortOption).lean<ProductCategory[]>().exec();
  }

  // --- [Lấy tất cả danh mục đang kích hoạt] ---
  async findAllActive(sortOption: Record<string, 1 | -1>): Promise<ProductCategory[]> {
    return this.model.find({ isActive: true }).sort(sortOption).lean<ProductCategory[]>().exec();
  }

  // --- [Lấy danh mục theo type] ---
  async findByType(type: string, sortOption: Record<string, 1 | -1>): Promise<ProductCategory[]> {
    return this.model
      .find({ type, isActive: true })
      .sort(sortOption)
      .lean<ProductCategory[]>()
      .exec();
  }

  // --- [Lấy danh sách code danh mục theo type] ---
  async findCodesByType(type: string): Promise<string[]> {
    const categories = await this.model
      .find({ type, isActive: true })
      .select('code -_id')
      .lean<{ code: string }[]>()
      .exec();

    return categories.map(c => c.code);
  }

  // --- [Lấy danh sách code danh mục theo type và continent] ---
  async findCodesByTypeAndContinent(type: string, continentKey: ContinentKey): Promise<string[]> {
    // Lấy thông tin continent theo key
    const continentObj = CONTINENTS[continentKey];

    const categories = await this.model
      .find({
        type,
        isActive: true,
        'continent.vi': continentObj.vi,
        'continent.en': continentObj.en,
      })
      .select('code -_id') // Chỉ lấy code, bỏ _id
      .lean<{ code: string }[]>()
      .exec();

    return categories.map(c => c.code);
  }

  // --- [Lấy danh sách code danh mục theo type, continent và country] ---
  async findCodesByTypeContinentCountry(
    type: string,
    continentKey: ContinentKey,
    country: string,
  ): Promise<string[]> {
    const continentObj = CONTINENTS[continentKey];

    const categories = await this.model
      .find({
        type,
        isActive: true,
        'continent.vi': continentObj.vi,
        'continent.en': continentObj.en,
        'country.en': country,
      })
      .select('code -_id')
      .lean<{ code: string }[]>()
      .exec();

    return categories.map(c => c.code);
  }
}
