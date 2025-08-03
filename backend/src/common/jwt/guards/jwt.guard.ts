// --- Import Thư Viện NestJS ---
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// --- Định Nghĩa Guard Xác Thực JWT ---

// Sử dụng chiến lược 'jwt' đã cấu hình trong JwtStrategy để bảo vệ route
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
