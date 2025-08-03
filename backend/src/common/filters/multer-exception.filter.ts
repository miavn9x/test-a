import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import { UploadErrorCode } from '../enums/upload-error-code.enum';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Lỗi upload file';
    let errorCode = UploadErrorCode.UPLOAD_ERROR;
    const status = HttpStatus.BAD_REQUEST;

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File vượt quá dung lượng cho phép';
        errorCode = UploadErrorCode.FILE_TOO_LARGE;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Số lượng file upload vượt quá giới hạn cho phép';
        errorCode = UploadErrorCode.FILE_COUNT_EXCEEDED;
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Số lượng phần (parts) vượt quá giới hạn cho phép';
        errorCode = UploadErrorCode.PART_COUNT_EXCEEDED;
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Tên trường (field key) vượt quá độ dài cho phép';
        errorCode = UploadErrorCode.FIELD_KEY_TOO_LONG;
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Giá trị trường (field value) vượt quá độ dài cho phép';
        errorCode = UploadErrorCode.FIELD_VALUE_TOO_LARGE;
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Số lượng trường (fields) vượt quá giới hạn cho phép';
        errorCode = UploadErrorCode.FIELD_COUNT_EXCEEDED;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Trường upload không hợp lệ';
        errorCode = UploadErrorCode.UNEXPECTED_FILE_FIELD;
        break;
      default:
        message = exception.message ?? 'Lỗi upload';
        break;
    }

    response.status(status).json({
      message,
      data: null,
      errorCode,
    });
  }
}
