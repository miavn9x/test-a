// --- Import Thư Viện ---
import { Controller, Get } from '@nestjs/common';
// --- Import Nội Bộ ---
import { AppService } from './app.service';

// --- Định Nghĩa Controller Chính ---
// AppController là nơi xử lý các HTTP request gửi đến ứng dụng
@Controller()
// Controller xử lý các request đến root path
export class AppController {
  // Constructor dùng để inject AppService thông qua Dependency Injection
  constructor(private readonly appService: AppService) {}
  // Xử lý HTTP GET request đến path "/"
  // Gọi phương thức getHello() từ AppService để lấy dữ liệu trả về client
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
