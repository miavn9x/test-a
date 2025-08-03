// --- Import Thư Viện Cần Thiết ---
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/common/jwt/types/jwt.type';

// --- Custom Decorator: @CurrentUser() ---
// Trích xuất thông tin người dùng từ request sau khi đã xác thực JWT thành công
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
