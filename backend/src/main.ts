// --- Import Thư Viện và Module Chính ---
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
// --- Import Cấu Hình Ứng Dụng ---
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { validateEnv } from './configs/check-env.config';
import { connectToDatabase } from './configs/database.config';

// --- Hàm Khởi Động Ứng Dụng ---
async function bootstrap() {
  // Ghi log bắt đầu quá trình khởi tạo
  console.log('Đang khởi tạo ứng dụng...');

  // Gọi hàm kiểm tra biến môi trường bắt buộc
  validateEnv();

  // --- Kết Nối Cơ Sở Dữ Liệu ---
  await connectToDatabase();

  // Khởi tạo NestJS app với module gốc
  const app = await NestFactory.create(AppModule);

  // Đăng ký middleware cookie-parser để có thể đọc refreshToken từ HttpOnly Cookie
  app.use(cookieParser());

  // Bật CORS để cho phép frontend từ origin được chỉ định truy cập tài nguyên của backend
  app.enableCors({
    // origin: ['http://localhost:3232'],
    origin: [
      'https://test-bsim.vercel.app',
      'http://test-bsim.vercel.app',
      'https://test-bsim-git-main-mia-9xs-projects.vercel.app',
      'https://test-bsim-67l0jz6ak-mia-9xs-projects.vercel.app',
      'https://btestsim.netlify.app',
    ],
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Thiết lập tiền tố "/api" cho toàn bộ route, giúp tổ chức endpoint rõ ràng hơn
  app.setGlobalPrefix('api');

  // Đăng ký interceptor toàn cục để chuẩn hóa response
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Đăng ký filter toàn cục để chuẩn hóa lỗi
  app.useGlobalFilters(new HttpExceptionFilter());

  // Đăng ký filter cho lỗi Multer
  app.useGlobalFilters(new MulterExceptionFilter());

  // Đọc biến môi trường PORT
  const port = process.env.PORT;

  // Nếu không có PORT, log lỗi và thoát
  if (!port) {
    console.error(
      `[NEST] [${new Date().toLocaleString()}] ❌ Thiếu biến môi trường PORT. Vui lòng cấu hình trước khi khởi động ứng dụng.`,
    );
    process.exit(1);
  } else {
    console.log(
      `[NEST] [${new Date().toLocaleString()}] ✅ Biến môi trường PORT đã được cấu hình: ${port}`,
    );
  }

  // Lắng nghe cổng đã cấu hình
  await app.listen(port);

  // Ghi log khi ứng dụng đã sẵn sàng
  console.log(
    `[NEST] [${new Date().toLocaleString()}] 🚀 Ứng dụng Web Bán Sim đã khởi động thành công tại: http://localhost:${port}`,
  );
}
// --- Gọi Hàm Khởi Động Ứng Dụng ---
void bootstrap();
