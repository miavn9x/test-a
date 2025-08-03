// --- [Imports] ---
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { LocalizedStringDto } from 'src/common/dtos/localized-string.dto';
import { CONTINENTS, ContinentKey, ProductCategoryType } from '../constants/product-category.enum';

// --- [CreateProductCategoryDto] ---
export class CreateProductCategoryDto {
  // --- [Nhà mạng áp dụng] ---
  @IsString()
  @Type(() => LocalizedStringDto)
  networkName: LocalizedStringDto[];

  // --- [Châu lục áp dụng] ---
  @IsArray()
  @IsEnum(Object.keys(CONTINENTS), { each: true })
  continent: ContinentKey[];

  // --- [Quốc gia/Vùng áp dụng] ---
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalizedStringDto)
  country: LocalizedStringDto[];

  // --- [Loại sản phẩm] ---
  @IsEnum(ProductCategoryType)
  type: ProductCategoryType;
}
