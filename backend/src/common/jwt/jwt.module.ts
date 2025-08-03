// --- Import Thư Viện NestJS ---
import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
// --- Import Nội Bộ ---
import { JwtService } from './services/jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// --- Định Nghĩa Module JWT ---
@Module({
  // --- Cấu Hình Module Con ---
  imports: [
    // Cấu hình cho Access Token: dùng secret và thời gian sống từ .env
    // Tách riêng access token để đảm bảo bảo mật và dễ dàng quản lý thời gian sống token
    NestJwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
        const expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;

        if (!secret || !expiresIn) {
          throw new Error(
            `[JWT] [${new Date().toLocaleString()}] ❌ Thiếu JWT_ACCESS_TOKEN_SECRET hoặc JWT_ACCESS_TOKEN_EXPIRES_IN trong .env`,
          );
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  // --- Đăng Ký Các Provider Sử Dụng Trong Module ---
  providers: [
    // JwtService: cung cấp các phương thức tạo và xác thực token, giúp tách biệt logic xử lý JWT khỏi các thành phần khác
    JwtService,
    // JwtStrategy: chiến lược xác thực token dùng trong guard, giúp bảo vệ các route cần xác thực
    JwtStrategy,
    // Cấu hình cho Refresh Token: cung cấp dưới dạng provider để inject vào các service cần thiết
    // Việc tách riêng refresh token giúp kiểm soát tốt hơn vòng đời token và tăng cường bảo mật
    {
      provide: 'JWT_REFRESH_TOKEN_OPTIONS',
      useFactory: () => {
        const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
        const expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

        if (!secret || !expiresIn) {
          throw new Error(
            `[JWT] [${new Date().toLocaleString()}] ❌ Thiếu JWT_REFRESH_TOKEN_SECRET hoặc JWT_REFRESH_TOKEN_EXPIRES_IN trong .env`,
          );
        }

        return { secret, expiresIn };
      },
    },
  ],
  // --- Các Thành Phần Được Export Ra Ngoài ---
  exports: [
    // Export JwtService để các module khác có thể sử dụng các phương thức tạo và xác thực token
    JwtService,
    // Export cấu hình refresh token để các service bên ngoài có thể inject và sử dụng khi xử lý refresh token
    'JWT_REFRESH_TOKEN_OPTIONS',
  ],
})
export class JwtModule {}
