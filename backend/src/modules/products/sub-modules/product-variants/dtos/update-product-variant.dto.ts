// --- [Imports] ---
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateProductVariantDto } from './create-product-variant.dto';

// --- [UpdateProductVariantDto] ---
export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {
  // --- [Trạng thái & kích hoạt] ---
  /**
   * Trạng thái hoạt động của biến thể (true = bật, false = tắt).
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // --- [Định danh biến thể] ---
  @IsString()
  code: string;
}
