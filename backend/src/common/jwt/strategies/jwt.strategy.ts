// --- Import Thư Viện NestJS và Passport ---
// Injectable: Đánh dấu class có thể được inject
import { Injectable } from '@nestjs/common';
// PassportStrategy: Base class để định nghĩa chiến lược xác thực
import { PassportStrategy } from '@nestjs/passport';
// ExtractJwt, Strategy: Công cụ trích xuất và xử lý JWT từ request
import { ExtractJwt, Strategy } from 'passport-jwt';

// --- Import Kiểu Dữ Liệu Nội Bộ ---
// JwtPayload: Định nghĩa kiểu dữ liệu của payload JWT
import { JwtPayload } from '../types/jwt.type';

// --- Định Nghĩa Strategy Xác Thực JWT ---
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // --- Load biến môi trường JWT ---
    // Lấy các biến môi trường chứa secret và thời gian hết hạn của access token và refresh token
    const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
    const accessExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
    const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
    const refreshExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

    // --- Kiểm tra biến môi trường ---
    // Nếu thiếu bất kỳ biến môi trường nào cần thiết, ném lỗi để thông báo
    if (!accessSecret || !accessExpiresIn || !refreshSecret || !refreshExpiresIn) {
      throw new Error(
        `[JWT] [${new Date().toLocaleString()}] ❌ Thiếu biến môi trường JWT (ACCESS hoặc REFRESH). Vui lòng kiểm tra .env`,
      );
    }

    // --- Khởi tạo Passport JWT Strategy ---
    // Cấu hình chiến lược xác thực JWT:
    // - Ưu tiên lấy access token từ cookie HttpOnly (req.cookies.accessToken)
    // - Không bỏ qua expiration để đảm bảo token hết hạn sẽ bị từ chối
    // - Sử dụng secret từ biến môi trường để xác thực token
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request & { cookies?: { accessToken?: string } }) =>
          req?.cookies?.accessToken || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    });
  }

  // --- Validate Payload ---
  // Hàm này được gọi sau khi token được xác thực thành công, payload chứa thông tin decode từ token
  validate(payload: JwtPayload) {
    // Trả về thông tin người dùng được sử dụng trong request tiếp theo
    return payload;
  }
}
