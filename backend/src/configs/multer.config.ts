import * as fs from 'fs';
import { diskStorage, Options } from 'multer';
import { ALLOWED_MIME_TYPES } from '../common/constants/upload.constant';
import { FileMetadata } from '../common/interfaces/upload.interface';
import { generateFileName, generateUploadPath } from '../common/utils/upload.util';

export interface ExtendedMulterFile extends Express.Multer.File {
  metadata?: FileMetadata;
  customUploadInfo?: {
    fullName: string;
    slug: string;
    extension: string;
    absolutePath: string;
  };
}

/**
 * Cấu hình Multer để xử lý upload file trong NestJS.
 *
 * - storage:
 *   Lưu trữ file trong thư mục theo cấu trúc: ./uploads/yyyy/mm/dd.
 *   Tên file được tạo bằng UUID và giữ lại phần mở rộng gốc.
 *
 * - fileFilter:
 *   Chấp nhận ảnh (jpg, jpeg, png, gif, webp) và video mp4.
 *   Các định dạng khác sẽ bị từ chối.
 *
 * - limits:
 *   Không giới hạn kích thước video, ảnh giới hạn 1MB (được kiểm tra trong controller).
 *
 * - metadata:
 *   Ghi lại thông tin tên file gốc, định dạng và tên file được tạo để module media xử lý.
 */
export const multerConfig: Options = {
  storage: diskStorage({
    // destination xác định thư mục lưu file upload
    // Tạo đường dẫn theo cấu trúc ./uploads/yyyy/mm/dd dựa vào ngày hiện tại
    // Sử dụng process.cwd() để lấy thư mục gốc của project
    // Dùng fs.mkdirSync với recursive:true để tạo thư mục nếu chưa tồn tại
    destination: (req, _file, cb) => {
      const uploadPath = generateUploadPath();
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (err) {
        const error = err as unknown;
        if (error instanceof Error) {
          cb(error, uploadPath);
        } else {
          cb(new Error('Không xác định lỗi tạo thư mục upload'), uploadPath);
        }
        return;
      }
      req['uploadPath'] = uploadPath;
      cb(null, uploadPath);
    },
    // filename đặt tên file upload
    // Lấy phần mở rộng file gốc bằng extname
    // Tạo tên file mới bằng UUID để đảm bảo duy nhất
    // Giữ lại phần mở rộng gốc để nhận dạng định dạng file
    // Lưu metadata gồm tên gốc, mimeType và tên mới để sử dụng sau này
    filename: (_req, file, cb) => {
      const { fullName, slug, extension, absolutePath } = generateFileName(file);

      // Gán tạm thông tin để controller/service xử lý metadata sau
      (file as ExtendedMulterFile)['customUploadInfo'] = {
        fullName,
        slug,
        extension,
        absolutePath,
      };

      cb(null, fullName);
    },
  }),
  // fileFilter dùng để lọc file upload theo định dạng
  // Kiểm tra mimeType của file upload
  // Cho phép các định dạng ảnh: jpg, jpeg, png, gif, webp
  // Cho phép định dạng video: mp4
  // Nếu file không thuộc các định dạng trên thì từ chối upload (cb(null, false))
  // Nếu hợp lệ thì cho phép upload (cb(null, true))
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, false);
      return;
    }
    if (file.mimetype.startsWith('image/') && file.size > 1 * 1024 * 1024) {
      cb(null, false);
      return;
    }
    cb(null, true);
  },
};
