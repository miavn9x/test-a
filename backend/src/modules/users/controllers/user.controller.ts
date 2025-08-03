// --- Import Thư Viện NestJS ---
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt/guards/jwt.guard';

// --- Import Nội Bộ ---
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { JwtPayload } from 'src/common/jwt/types/jwt.type';
import { UserErrorCode } from 'src/modules/users/constants/user-error-code.enum';

import { User } from '../schemas/user.schema';
import { UsersService } from '../services/user.service';

// --- Controller Người Dùng ---
@Controller('user')
export class UsersController {
  // --- Constructor ---
  // Inject UsersService để sử dụng các phương thức liên quan đến xử lý dữ liệu người dùng.
  constructor(private readonly usersService: UsersService) {}

  // --- API: Lấy hồ sơ người dùng ---
  /**
   * API lấy thông tin người dùng đang đăng nhập
   * Yêu cầu xác thực bằng Access Token (JWT)
   *
   * @param user Thông tin payload JWT của người dùng hiện tại
   * @returns Trả về đối tượng StandardResponse chứa dữ liệu người dùng hoặc lỗi tương ứng.
   *
   * Logic xử lý:
   * - Gọi service để lấy thông tin người dùng theo ID trong payload JWT.
   * - Nếu thành công, trả về dữ liệu người dùng kèm message và errorCode null.
   * - Nếu lỗi UnauthorizedError, trả về message không được phép truy cập và mã lỗi tương ứng.
   * - Nếu người dùng không tồn tại hoặc lỗi khác, trả về message lỗi và mã lỗi USER_NOT_FOUND.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<StandardResponse<User>> {
    try {
      const result = await this.usersService.findById(user.sub);

      if (!result.data) {
        return {
          message: 'Người dùng không tồn tại',
          data: null,
          errorCode: UserErrorCode.USER_NOT_FOUND,
        };
      }

      return {
        message: 'Lấy thông tin người dùng thành công',
        data: result.data,
        errorCode: null,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'UnauthorizedError') {
        return {
          message: 'Không được phép truy cập',
          data: null,
          errorCode: UserErrorCode.UNAUTHORIZED,
        };
      }

      return {
        message: 'Người dùng không tồn tại',
        data: null,
        errorCode: UserErrorCode.USER_NOT_FOUND,
      };
    }
  }
}
