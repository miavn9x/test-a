// --- Import Thư Viện và Thành Phần Cần Kiểm Thử ---
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Khối Test Controller Chính ---
describe('AppController', () => {
  let appController: AppController;

  // Khởi tạo module test và inject AppController
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // Kiểm thử route gốc "/" trả về nội dung mong đợi
  describe('root', () => {
    it('should return "Welcome to SimHub Global API!"', () => {
      // Mong đợi phương thức getHello() trả về đúng chuỗi
      expect(appController.getHello()).toBe('Welcome to SimHub Global API!');
    });
  });
});
