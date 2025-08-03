import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UploadErrorCode } from 'src/common/enums/upload-error-code.enum';
import { ExtendedMulterFile } from 'src/common/interfaces/upload.interface';
import { generateFileMetadata } from 'src/common/utils/upload.util';
import { multerConfig } from 'src/configs/multer.config';
import { MediaUsageEnum } from 'src/modules/media/enums/media-usage.enum';
import { MediaService } from 'src/modules/media/services/media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Controller xử lý các yêu cầu liên quan đến media, cụ thể ở đây là upload file.
   *
   * Phương thức uploadFile nhận file upload từ client, kiểm tra tính hợp lệ của file và metadata,
   * sau đó gọi service để xử lý lưu trữ file.
   *
   * @param file - File được upload, mở rộng từ Multer với metadata đi kèm.
   * @throws BadRequestException nếu file hoặc metadata không tồn tại.
   * @returns Kết quả xử lý upload file từ MediaService.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: ExtendedMulterFile, @Body('usage') usage: MediaUsageEnum) {
    // Kiểm tra usage có hợp lệ không
    if (!Object.values(MediaUsageEnum).includes(usage)) {
      throw new BadRequestException({
        message: 'Usage không hợp lệ',
        data: null,
        errorCode: UploadErrorCode.FILE_REQUIRED,
      });
    }

    const multerFile = file as ExtendedMulterFile & {
      customUploadInfo: {
        slug: string;
        extension: string;
        absolutePath: string;
      };
    };

    if (!multerFile?.customUploadInfo) {
      throw new BadRequestException({
        message: 'Thiếu thông tin upload tạm thời',
        data: null,
        errorCode: UploadErrorCode.FILE_REQUIRED,
      });
    }

    const { slug, extension, absolutePath } = multerFile.customUploadInfo;
    const metadata = generateFileMetadata(multerFile, slug, extension, absolutePath);
    multerFile.metadata = metadata;

    // Gọi service để xử lý upload file một cách chi tiết (lưu file, tạo record, v.v)
    const result = await this.mediaService.handleSingleUpload(multerFile.metadata, usage);
    return result;
  }

  /**
   * Upload nhiều files cùng lúc.
   * @param files - Danh sách files upload
   * @param usage - Mục đích sử dụng media
   */
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadMultipleFiles(
    @UploadedFiles() files: ExtendedMulterFile[],
    @Body('usage') usage: MediaUsageEnum,
  ) {
    if (!Object.values(MediaUsageEnum).includes(usage)) {
      throw new BadRequestException({
        message: 'Usage không hợp lệ',
        data: null,
        errorCode: UploadErrorCode.FILE_REQUIRED,
      });
    }

    const metadataList = files.map(file => {
      const multerFile = file as ExtendedMulterFile & {
        customUploadInfo: {
          slug: string;
          extension: string;
          absolutePath: string;
        };
      };

      if (!multerFile?.customUploadInfo) {
        throw new BadRequestException({
          message: 'Thiếu thông tin upload tạm thời',
          data: null,
          errorCode: UploadErrorCode.FILE_REQUIRED,
        });
      }

      const { slug, extension, absolutePath } = multerFile.customUploadInfo;
      const metadata = generateFileMetadata(multerFile, slug, extension, absolutePath);
      multerFile.metadata = metadata;
      return metadata;
    });

    const result = await this.mediaService.handleMultiUpload(metadataList, usage);
    return result;
  }

  /**
   * Xoá cứng 1 media:
   * - Xoá file khỏi thư mục uploads
   * - Xoá bản ghi trong MongoDB
   *
   * @param mediaCode - Mã code của media
   */
  @Delete(':mediaCode/hard-delete')
  async hardDeleteMedia(@Param('mediaCode') mediaCode: string) {
    const media = await this.mediaService.getByMediaCode(mediaCode);
    if (!media) {
      throw new BadRequestException({
        message: 'Media không tồn tại',
        data: null,
        errorCode: 'MEDIA_NOT_FOUND',
      });
    }

    try {
      await fs.unlink(path.join(process.cwd(), media.url));
    } catch {
      console.warn('[MediaController] Không thể xoá file vật lý:', media.url);
    }

    await this.mediaService.hardDeleteByMediaCode(mediaCode);

    return {
      message: 'Xoá media thành công',
      data: null,
      errorCode: null,
    };
  }
}
