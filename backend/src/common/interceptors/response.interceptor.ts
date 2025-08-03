// --- Import Thư Viện NestJS và RxJS ---
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { StandardResponse } from '../interfaces/response.interface';

// --- Định Nghĩa Interceptor Chuẩn Hóa Phản Hồi ---
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  /**
   * Intercept toàn bộ response trước khi gửi về client.
   * Bọc dữ liệu gốc vào một định dạng chuẩn gồm: message, data, errorCode.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data: T): StandardResponse<T> => {
        // Nếu đã đúng chuẩn thì giữ nguyên
        if (
          data !== null &&
          typeof data === 'object' &&
          'message' in data &&
          'data' in data &&
          'errorCode' in data
        ) {
          return data as StandardResponse<T>;
        }

        // Nếu là string thì đưa vào message
        if (typeof data === 'string') {
          return { message: data, data: null, errorCode: null };
        }

        // Mặc định chuẩn hóa phản hồi
        return { message: 'Thành công', data, errorCode: null };
      }),
    );
  }
}
