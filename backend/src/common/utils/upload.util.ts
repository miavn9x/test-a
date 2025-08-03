import { extension as getExtension } from 'mime-types';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from './slugify.util';

/**
 * Tạo đường dẫn thư mục để lưu trữ file upload dựa trên ngày hiện tại.
 * Cấu trúc đường dẫn: basePath/YYYY/MM/DD
 *
 * @param basePath - Thư mục gốc để lưu file (mặc định là 'uploads')
 * @returns Đường dẫn đầy đủ đến thư mục lưu trữ file
 */
export function generateUploadPath(basePath: string = 'uploads'): string {
  const now = new Date();
  return join(
    process.cwd(),
    basePath,
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, '0'),
    now.getDate().toString().padStart(2, '0'),
  );
}

/**
 * Lấy phần mở rộng file một cách an toàn từ MIME type sử dụng thư viện mime-types.
 * Trả về undefined nếu không xác định được phần mở rộng.
 *
 * @param mimeType - Chuỗi MIME type của file (ví dụ: 'image/jpeg')
 * @returns Phần mở rộng file tương ứng không có dấu chấm (ví dụ: 'jpg') hoặc undefined
 */
export function getSafeExtensionFromMime(mimeType: string): string | undefined {
  if (typeof getExtension === 'function') {
    const result = (getExtension as (mime: string) => string | false | undefined)(mimeType);
    return typeof result === 'string' ? result : undefined;
  }
  return undefined;
}

/**
 * Tạo metadata chi tiết về file dựa trên các tham số truyền vào.
 *
 * @param file - Đối tượng file từ Express.Multer.File
 * @param slug - Tên slug đã được tạo không bao gồm phần mở rộng
 * @param extension - Phần mở rộng file không có dấu chấm
 * @param absolutePath - Đường dẫn tuyệt đối đến file đã sinh ra
 * @returns Metadata chi tiết về file
 */
export function generateFileMetadata(
  file: Express.Multer.File,
  slug: string,
  extension: string,
  absolutePath: string,
) {
  let type: 'image' | 'video';
  if (file.mimetype.startsWith('image/')) {
    type = 'image';
  } else if (file.mimetype.startsWith('video/')) {
    type = 'video';
  } else {
    throw new Error(`MIME type không hợp lệ: ${file.mimetype}`);
  }

  if (typeof file.size !== 'number') {
    throw new Error('Kích thước file không xác định (missing size)');
  }

  const relativeUrl = absolutePath.replace(process.cwd(), '').replace(/\\/g, '/');

  return {
    mediaCode: `${type === 'image' ? 'media_image_' : 'media_video_'}${uuidv4()}`,
    originName: file.originalname,
    slug,
    type,
    mimeType: file.mimetype,
    extension,
    size: file.size,
    width: 'width' in file && typeof file.width === 'number' ? file.width : null,
    height: 'height' in file && typeof file.height === 'number' ? file.height : null,
    url: relativeUrl,
  };
}

/**
 * Tạo tên file an toàn, thân thiện với URL dựa trên đối tượng file Multer.
 * Sử dụng slugify để tạo slug từ tên gốc và timestamp, đảm bảo chữ thường và chỉ các ký tự hợp lệ.
 * Nếu slugify trả về chuỗi rỗng (ví dụ tên gốc không hợp lệ), sẽ dùng UUID làm tên thay thế.
 * Xác định phần mở rộng file dựa trên MIME type, nếu không có sẽ dùng phần mở rộng gốc của file.
 * Trả về tên file, slug, phần mở rộng, đường dẫn tuyệt đối và metadata chi tiết về file.
 *
 * @param file - Đối tượng file từ Express.Multer.File
 * @returns Một đối tượng chứa:
 *   - fullName: Tên file đầy đủ đã được tạo, bao gồm phần mở rộng
 *   - slug: Tên slug đã được tạo không bao gồm phần mở rộng
 *   - extension: Phần mở rộng file không có dấu chấm
 *   - absolutePath: Đường dẫn tuyệt đối đến file đã sinh ra
 *   - metadata: Thông tin chi tiết về file
 */
export function generateFileName(file: Express.Multer.File): {
  fullName: string;
  slug: string;
  extension: string;
  absolutePath: string;
} {
  const timestamp = Date.now();
  const originName = file.originalname;
  // Remove original extension from the original file name
  const nameWithoutExt = originName.replace(extname(originName), '');
  // Create a slug from the name and timestamp, ensuring lowercase and strict characters only
  let slug = slugify(`${nameWithoutExt}-${timestamp}`);
  // Fallback to UUID if slug is empty (slugify might return empty for invalid names)
  if (!slug) slug = uuidv4();

  // Determine extension from MIME type or fallback to original file extension without dot
  const ext = getSafeExtensionFromMime(file.mimetype) ?? extname(originName).replace('.', '');
  const fullName = `${slug}.${ext}`;

  const uploadPath = generateUploadPath();
  const absolutePath = join(uploadPath, fullName);

  return { fullName, slug, extension: ext, absolutePath };
}
