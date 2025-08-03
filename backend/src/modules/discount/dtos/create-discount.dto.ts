// --- [Imports] ---
import { IsNumber, Max, Min } from 'class-validator';

// --- [CreateDiscountDto] ---
// DTO dùng để tạo mã giảm giá mới.
export class CreateDiscountDto {
  // --- [Phần trăm giảm giá] ---
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;
}
