// --- [Imports] ---
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { JwtAuthGuard } from 'src/common/jwt/guards/jwt.guard';
import { UserRole } from 'src/modules/users/constants/user-role.enum';
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dtos/update-product-variant.dto';
import { ProductVariantService } from '../services/product-variant.service';

// --- [ProductVariantController] ---
@Controller('product-variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  // --- [API: Tạo biến thể sản phẩm] ---
  @Post(':productCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createVariants(
    @Param('productCode') productCode: string,
    @Body() dto: CreateProductVariantDto | CreateProductVariantDto[],
  ): Promise<StandardResponse> {
    if (Array.isArray(dto)) {
      return this.productVariantService.createMany(productCode, dto);
    }
    return this.productVariantService.create(productCode, dto);
  }

  // --- [API: Cập nhật biến thể sản phẩm] ---
  @Patch(':productCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateVariants(
    @Param('productCode') productCode: string,
    @Body() dto: UpdateProductVariantDto | UpdateProductVariantDto[],
  ): Promise<StandardResponse> {
    if (Array.isArray(dto)) {
      return this.productVariantService.updateMany(productCode, dto);
    }
    return this.productVariantService.updateOne(productCode, dto);
  }

  // --- [API: Lấy biến thể cho user] ---
  @Get(':productCode/user')
  @HttpCode(HttpStatus.OK)
  getVariantsForUser(@Param('productCode') productCode: string): Promise<StandardResponse> {
    return this.productVariantService.getListForUser(productCode);
  }

  // --- [API: Lấy biến thể cho admin] ---
  @Get(':productCode/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  getVariantsForAdmin(@Param('productCode') productCode: string): Promise<StandardResponse> {
    return this.productVariantService.getListForAdmin(productCode);
  }

  // --- [API: Lấy danh sách số ngày theo dung lượng] ---
  @Get(':productCode/durations')
  @HttpCode(HttpStatus.OK)
  getDurationsByCapacity(
    @Param('productCode') productCode: string,
    @Query('capacity') capacity: number,
  ): Promise<StandardResponse> {
    return this.productVariantService.getDurationsByCapacity(productCode, capacity);
  }

  // --- [API: Lấy giá biến thể theo dung lượng và số ngày] ---
  @Get(':productCode/price')
  @HttpCode(HttpStatus.OK)
  getPriceByCapacityAndDuration(
    @Param('productCode') productCode: string,
    @Query('capacity') capacity: number,
    @Query('duration') duration: number,
  ): Promise<StandardResponse> {
    return this.productVariantService.getPriceByCapacityAndDuration(
      productCode,
      capacity,
      duration,
    );
  }

  // --- [API: Xoá biến thể] ---
  @Delete(':productCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  deleteVariants(
    @Param('productCode') productCode: string,
    @Query('code') code?: string,
  ): Promise<StandardResponse> {
    if (code) {
      return this.productVariantService.deleteOne(code);
    }
    return this.productVariantService.deleteAllByProductCode(productCode);
  }
}
