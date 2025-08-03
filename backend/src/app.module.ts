// --- Import Thư Viện Bên Thứ Ba ---
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { JwtModule } from './common/jwt/jwt.module';

// --- Import Module Nội Bộ ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DiscountModule } from './modules/discount/discount.module';
import { MediaModule } from './modules/media/media.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductModule } from './modules/products/product.module';
import { UsersModule } from './modules/users/user.module';

// --- Cấu Hình Module Gốc AppModule ---
@Module({
  // --- Module Con ---
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // --- Cấu Hình Biến Môi Trường ---
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // --- Kết Nối CSDL MongoDB ---
    MongooseModule.forRoot(process.env.MONGO_URI || '', {}),

    // --- Cấu Hình Bảo Mật (JWT) ---
    JwtModule,

    // --- Module Ứng Dụng Chính ---
    AuthModule,
    UsersModule,
    ProductModule,
    MediaModule,
    OrdersModule,
    DiscountModule,
  ],
  // --- Controller ---
  controllers: [AppController],
  // --- Service hoặc Provider ---
  providers: [AppService],
})
export class AppModule {}
