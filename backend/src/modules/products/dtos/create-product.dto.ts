// --- Imports ---
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { LocalizedStringDto } from 'src/common/dtos/localized-string.dto';
import { MediaDto } from 'src/common/dtos/media.dto';

// --- [CreateProductDto] ---
// DTO dùng để tạo mới sản phẩm chính (Product).
// Bao gồm: danh mục, thông tin hiển thị, hình ảnh, thông số kỹ thuật.
export class CreateProductDto {
  // --- [Metadata] ---
  /**
   * Mã danh mục sản phẩm (bắt buộc).
   */
  @IsString()
  @IsNotEmpty()
  productCategoryCode: string;

  /**
   * Tên sản phẩm đa ngôn ngữ (bắt buộc).
   * Backend sẽ sinh code và tokens từ trường này.
   * Sinh tự động:
   * - code sản phẩm (slug hóa)
   * - tokens tìm kiếm
   */
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name: LocalizedStringDto;

  /**
   * Mô tả sản phẩm đa ngôn ngữ (tuỳ chọn).
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;

  /**
   * Ảnh đại diện sản phẩm (bắt buộc).
   */
  @ValidateNested()
  @Type(() => MediaDto)
  cover: MediaDto;

  /**
   * Bộ sưu tập ảnh sản phẩm (tuỳ chọn).
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  gallery?: MediaDto[];

  /**
   * Danh sách dung lượng (GB), mặc định là đơn vị GB.
   * Dùng để sinh biến thể sản phẩm (ProductVariant) theo dung lượng.
   */
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => String)
  capacities: string[];

  /**
   * Danh sách số ngày sử dụng (ngày).
   * Dùng để sinh biến thể sản phẩm (ProductVariant) theo thời hạn sử dụng.
   */
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  durations: number[];
}
