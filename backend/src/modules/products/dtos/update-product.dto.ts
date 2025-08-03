import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

// --- [UpdateProductDto] ---
export class UpdateProductDto extends PartialType(CreateProductDto) {
  // --- [Trạng thái hoạt động] ---
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // --- [Danh mục] ---
  @IsOptional()
  productCategoryCode?: string;

  // --- [Khoảng giá] ---
  @IsOptional()
  priceRange?: {
    vnd: {
      min: number;
      max: number;
    };
    usd: {
      min: number;
      max: number;
    };
  } = {
    vnd: { min: 0, max: 0 },
    usd: { min: 0, max: 0 },
  };
}
