import { config } from 'dotenv';
import { StandardResponse } from 'src/common/interfaces/response.interface';
config();

// --- Utility: Tính tổng tiền đơn hàng ---
/**
 * Tính tổng số tiền của đơn hàng dựa trên danh sách sản phẩm.
 * Mỗi sản phẩm bao gồm:
 * - quantity: số lượng
 * - finalPrice: giá cuối cùng sau chiết khấu
 *
 * @param products Danh sách sản phẩm trong đơn
 * @returns Tổng số tiền của đơn hàng (>= 0)
 */
export function calcTotalOrderPrice(
  products: { quantity: number; finalPrice: number }[],
  discountPercent: number = 0,
): number {
  if (!Array.isArray(products)) return 0;

  const total = products.reduce((sum, item) => {
    const qty = typeof item.quantity === 'number' ? item.quantity : 0;
    const price = typeof item.finalPrice === 'number' ? item.finalPrice : 0;
    return sum + qty * price;
  }, 0);

  const discount = (total * discountPercent) / 100;
  return Math.max(0, total - discount);
}

// --- Utility: Sinh URL ảnh QR thanh toán ---
/**
 * Sinh đường dẫn ảnh QR thanh toán VietQR dựa trên thông tin đơn hàng.
 * Ảnh QR bao gồm: mã đơn, tổng tiền, thông tin tài khoản nhận.
 *
 * Biến môi trường yêu cầu:
 * - VIETQR_BIN: mã ngân hàng
 * - VIETQR_ACCOUNT_NUMBER: số tài khoản
 * - VIETQR_ACCOUNT_NAME: tên tài khoản
 * - VIETQR_TEMPLATE_ID: template ảnh QR (mặc định: print)
 *
 * @param orderCode Mã đơn hàng (code)
 * @param totalPrice Tổng số tiền đơn hàng
 * @returns Đường dẫn ảnh QR thanh toán dạng JPG
 */
export function generateQrImageUrl(
  orderCode: string,
  totalPrice: number,
): StandardResponse<string> {
  const bin = process.env.VIETQR_BIN;
  const accountNo = process.env.VIETQR_ACCOUNT_NUMBER;
  const accountName = process.env.VIETQR_ACCOUNT_NAME;
  const template = process.env.VIETQR_TEMPLATE_ID;

  if (!bin || !accountNo || !accountName || !template) {
    return {
      message: 'Thiếu cấu hình môi trường VietQR',
      data: null,
      errorCode: 'VIETQR_ENV_MISSING',
    };
  }

  const params = new URLSearchParams({
    amount: totalPrice.toString(),
    addInfo: `Thanh toan cho ${orderCode}`,
    accountNo,
    accountName,
    acqId: bin,
    template,
  });

  return {
    message: 'Tạo URL ảnh QR thành công',
    data: `https://api.vietqr.io/image/${bin}-${accountNo}-${template}.jpg?${params.toString()}`,
    errorCode: null,
  };
}

// --- Utility: Sinh mã đơn hàng ---
/**
 * Tạo mã đơn hàng duy nhất theo format:
 * // OD + dd + MM + yy + 4 số random
 * Ví dụ: OD09072542
 *
 * @returns Mã đơn hàng (code)
 */
export function generateOrderCode(): string {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);

  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `OD${day}${month}${year}${randomPart}`;
}
