// --- [Imports] ---
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/jwt/guards/jwt.guard';
import { DiscountService } from 'src/modules/discount/services/discount.service';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { Discount, DiscountDocument } from '../schemas/discount.schema';

// --- [DiscountController] ---
@Controller('discounts')
export class DiscountController {
  constructor(
    private readonly discountService: DiscountService,
    @InjectModel(Discount.name)
    private readonly discountModel: Model<DiscountDocument>,
  ) {}

  // --- [API: Tạo mã giảm giá] ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createDiscount(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  // --- [API: Xoá mã giảm giá] ---
  @Delete(':code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteDiscount(@Param('code') code: string) {
    return this.discountService.delete(code);
  }

  // --- [API: Xem tất cả mã giảm giá] ---
  @Get('all')
  async getAllDiscounts() {
    return this.discountService.getAll();
  }

  // --- [API: Lấy phần trăm giảm giá theo mã code] ---
  @Get('percent')
  async getDiscountPercent(@Query('code') code: string): Promise<{ discountPercent: number }> {
    return this.discountService.getDiscountPercentByCode(code);
  }
}
