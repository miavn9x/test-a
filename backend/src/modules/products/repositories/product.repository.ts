import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = new this.productModel(data);
    return product.save();
  }

  async findByCode(code: string): Promise<Product | null> {
    return this.productModel.findOne({ code }).lean();
  }

  async updateByCode(code: string, data: Partial<Product>): Promise<Product | null> {
    return this.productModel.findOneAndUpdate({ code }, data, { new: true }).lean();
  }

  async deleteByCode(code: string): Promise<void> {
    await this.productModel.deleteOne({ code });
  }

  async findAllForAdmin(sort: Record<string, 1 | -1>): Promise<{ data: Product[]; total: number }> {
    const [data, total] = await Promise.all([
      this.productModel.find().sort(sort).lean(),
      this.productModel.countDocuments(),
    ]);
    return { data, total };
  }

  async findByCategoryForAdmin(
    productCategoryCode: string,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = { productCategoryCode };
    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);
    return { data, total };
  }

  async findAllPublic(
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);
    return { data, total };
  }

  async findByCategoryPublic(
    productCategoryCode: string,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = { productCategoryCode, isActive: true };
    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);
    return { data, total };
  }

  async deleteByCategoryCode(productCategoryCode: string): Promise<void> {
    await this.productModel.deleteMany({ productCategoryCode });
  }

  // --- [Lấy danh sách sản phẩm thuộc nhiều danh mục cho public] ---
  async findByCategoryCodesPublic(
    categoryCodes: string[],
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{
    data: {
      code: string;
      name: { vi: string; en: string };
      cover: { url: string; mediaCode: string };
      priceRange: {
        vnd: { min: number; max: number };
        usd: { min: number; max: number };
      };
    }[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const filter = {
      productCategoryCode: { $in: categoryCodes },
      isActive: true,
    };

    const [rawData, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('code name cover priceRange')
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    const data = rawData.map(item => ({
      code: item.code,
      name: item.name,
      cover: item.cover,
      priceRange: item.priceRange,
    }));

    return { data, total };
  }

  // --- [Tìm kiếm sản phẩm theo tokens] ---
  async searchByTokens(tokens: string[], sort: Record<string, 1 | -1>): Promise<Product[]> {
    if (tokens.length === 0) return [];

    const filter = {
      isActive: true,
      $or: [{ 'tokens.vi': { $in: tokens } }, { 'tokens.en': { $in: tokens } }],
    };

    return this.productModel.find(filter).sort(sort).lean();
  }
}
