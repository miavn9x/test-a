// --- [Imports] ---
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

// --- [CreateProductVariantDto] ---
export class CreateProductVariantDto {
  // --- [Định danh & liên kết] ---

  /**
   * Mã sản phẩm cha (liên kết với bảng Product)
   */
  @IsNotEmpty()
  @IsString()
  productCode: string;

  // --- [Thông số kỹ thuật] ---

  /**
   * Dung lượng của biến thể (GB)
   */
  @IsNotEmpty()
  @Type(() => String)
  capacity: string;

  /**
   * Số ngày sử dụng của biến thể
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  duration: number;

  // --- [Giá bán VND] ---

  /**
   * Giá gốc VND (bắt buộc)
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vndOriginal: number;

  /**
   * Phần trăm giảm giá VND (bắt buộc)
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  vndDiscountPercent: number;

  // --- [Giá bán USD] ---

  /**
   * Giá gốc USD (bắt buộc)
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  usdOriginal: number;

  /**
   * Phần trăm giảm giá USD (bắt buộc)
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  usdDiscountPercent: number;
}
