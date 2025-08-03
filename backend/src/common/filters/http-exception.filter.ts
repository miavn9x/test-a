// --- Import Thư Viện NestJS ---
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

interface HttpExceptionResponse {
  message?: string | string[];
  errorCode?: string;
}

// --- Định Nghĩa Bộ Lọc Lỗi Chuẩn Hóa Phản Hồi ---
@Catch(HttpException) // Bắt tất cả các lỗi HTTP (do throw new HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Xử lý lỗi HTTP và chuẩn hoá định dạng phản hồi lỗi
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // Lấy context HTTP từ host để truy cập request và response
    const ctx = host.switchToHttp();

    // Lấy đối tượng response từ context để gửi phản hồi lỗi
    const response = ctx.getResponse<Response>();

    // Lấy HTTP status code từ đối tượng exception (VD: 400, 404, 500...)
    const status = exception.getStatus();

    // Lấy nội dung chi tiết của lỗi từ exception (có thể là object, string hoặc mảng message)
    const exceptionResponse = exception.getResponse() as HttpExceptionResponse | string;

    // Xử lý message từ exception response:
    // - Nếu là mảng (thường từ class-validator): nối chuỗi bằng dấu phẩy
    // - Nếu là string: dùng trực tiếp làm message
    // - Nếu exception trả về string thay vì object: dùng làm message luôn
    let message = 'Lỗi không xác định';
    if (typeof exceptionResponse !== 'string' && Array.isArray(exceptionResponse.message)) {
      message = exceptionResponse.message.join(', ');
    } else if (
      typeof exceptionResponse !== 'string' &&
      typeof exceptionResponse.message === 'string'
    ) {
      message = exceptionResponse.message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    // Gán mã lỗi nếu có trong object exceptionResponse hoặc trong getResponse
    let errorCode = 'UNEXPECTED_ERROR';
    if (typeof exceptionResponse !== 'string' && exceptionResponse?.errorCode) {
      errorCode = exceptionResponse.errorCode;
    }

    // Gửi phản hồi lỗi chuẩn về phía client
    response.status(status).json({
      message, // Nội dung lỗi sẽ hiển thị
      data: null, // Không trả về dữ liệu khi có lỗi
      errorCode, // Mã lỗi rõ ràng để client xử lý (nếu có)
    });
  }
}
