// --- Import Thư Viện ---
import { Injectable } from '@nestjs/common';

// --- Định Nghĩa Service Chính ---
// Đánh dấu class có thể được NestJS inject vào nơi khác
@Injectable()
// AppService chứa các phương thức xử lý logic nghiệp vụ và được inject vào các thành phần khác như controller
export class AppService {
  // Phương thức mẫu trả về chuỗi đơn giản
  // Có thể dùng để kiểm tra hệ thống hoạt động hoặc test route
  getHello(): string {
    return 'Welcome to SimHub Global API!';
  }
}
