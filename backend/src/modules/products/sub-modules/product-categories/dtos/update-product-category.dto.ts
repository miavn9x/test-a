// --- [Imports] ---
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductCategoryDto } from './create-product-category.dto';

// --- [UpdateProductCategoryDto] ---
export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto) {
  // --- [Trạng thái kích hoạt] ---
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
