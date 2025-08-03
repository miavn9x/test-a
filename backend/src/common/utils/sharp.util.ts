import { existsSync, promises as fs } from 'fs';
import { extname } from 'path';
import * as sharp from 'sharp';
import { SUPPORTED_IMAGE_FORMATS } from '../constants/sharp.constant';

/**
 * Nén ảnh nếu vượt quá giới hạn dung lượng.
 *
 * @param absPath Đường dẫn tuyệt đối tới file ảnh
 * @param maxSizeMB Giới hạn kích thước ảnh (MB), mặc định là 1MB
 * @param quality Chất lượng nén ảnh (0 - 100), mặc định là 80
 */
export async function compressImageIfNeeded(
  absPath: string,
  maxSizeMB = 1,
  quality = 80,
): Promise<boolean> {
  // Lấy thông tin file để kiểm tra dung lượng hiện tại
  const stats = await fs.stat(absPath);
  const sizeInMB = stats.size / (1024 * 1024);
  // Nếu file nhỏ hơn hoặc bằng giới hạn, không cần nén
  if (sizeInMB <= maxSizeMB) {
    return false;
  }

  // Lấy phần mở rộng định dạng file (ví dụ: jpg, png)
  const ext = extname(absPath).replace('.', '').toLowerCase();
  // Danh sách các định dạng ảnh được phép nén (whitelist)
  // const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
  // Nếu định dạng không nằm trong whitelist thì bỏ qua
  if (!SUPPORTED_IMAGE_FORMATS.includes(ext)) {
    return false;
  }

  // Kiểm tra xem thư viện sharp có hỗ trợ định dạng này không
  if (!sharp.format[ext]) {
    return false;
  }

  try {
    // Quy trình nén ảnh:
    // 1. Tạo đường dẫn file tạm để lưu ảnh đã nén
    // 2. Dùng sharp để đọc ảnh gốc, nén với chất lượng chỉ định, ghi ra file tạm
    // 3. Ghi đè file gốc bằng file tạm đã nén
    const tempPath = `${absPath}.tmp`;
    await sharp(absPath)
      .toFormat(ext as keyof sharp.FormatEnum, { quality })
      .toFile(tempPath);

    const beforeStats = await fs.stat(absPath);

    await fs.rename(tempPath, absPath);

    const afterStats = await fs.stat(absPath);

    return true;
  } catch (error) {
    const tempPath = `${absPath}.tmp`;
    if (existsSync(tempPath)) {
      await fs.unlink(tempPath);
    }
    return false;
  }
}
