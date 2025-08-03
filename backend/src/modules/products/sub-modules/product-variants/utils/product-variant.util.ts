// --- [Build Variant Payload] ---
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { ProductVariant } from '../schemas/product-variant.schema';

export function buildVariantPayload(
  productCode: string,
  dto: CreateProductVariantDto,
): Partial<ProductVariant> {
  const vndDiscount = dto.vndDiscountPercent || 0;
  const usdDiscount = dto.usdDiscountPercent || 0;

  const vndFinal = dto.vndOriginal * (1 - vndDiscount / 100);
  const usdFinal = dto.usdOriginal * (1 - usdDiscount / 100);

  // --- [Kết quả trả về] ---
  return {
    code: `${productCode}-${dto.capacity}-${dto.duration}`,
    productCode,
    capacity: dto.capacity,
    duration: dto.duration,
    vndPrice: {
      original: dto.vndOriginal,
      discountPercent: vndDiscount,
      final: vndFinal,
    },
    usdPrice: {
      original: dto.usdOriginal,
      discountPercent: usdDiscount,
      final: usdFinal,
    },
  };
}
