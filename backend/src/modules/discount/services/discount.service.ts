// --- [Imports] ---
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { Discount, DiscountDocument } from '../schemas/discount.schema';

// --- [DiscountService] ---
@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(Discount.name)
    private readonly discountModel: Model<DiscountDocument>,
  ) {}

  // --- [Tạo mã giảm giá] ---
  async create(dto: CreateDiscountDto) {
    const date = new Date();
    const dd = date.getDate().toString().padStart(2, '0');
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const code = `SHGB${dd}${MM}${dto.discountPercent}`;
    const created = await this.discountModel.create({
      code,
      discountPercent: dto.discountPercent,
    });
    return {
      message: 'Tạo mã giảm giá thành công',
      data: created,
      errorCode: null,
    };
  }

  // --- [Xoá mã giảm giá] ---
  async delete(code: string) {
    await this.discountModel.deleteOne({ code });
    return {
      message: 'Xoá mã giảm giá thành công',
      data: null,
      errorCode: null,
    };
  }

  // --- [Lấy tất cả mã giảm giá] ---
  async getAll() {
    const list = await this.discountModel.find().sort({ createdAt: -1 });
    return {
      message: 'Lấy danh sách mã giảm giá thành công',
      data: list,
      errorCode: null,
    };
  }

  // --- [Lấy phần trăm giảm giá theo mã code] ---
  async getDiscountPercentByCode(code: string): Promise<{ discountPercent: number }> {
    const discount = await this.discountModel.findOne({ code }).lean();

    if (!discount) {
      return { discountPercent: 0 };
    }

    return { discountPercent: discount.discountPercent };
  }
}
