// --- Import Thư Viện ---
import { Injectable } from '@nestjs/common';

// --- Import Nội Bộ ---
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { UserErrorCode } from 'src/modules/users/constants/user-error-code.enum';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../schemas/user.schema';

// --- Service Quản Lý Người Dùng ---
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Lấy thông tin người dùng theo ID (dùng cho controller /users/me)
   * @param userId - ID người dùng (sub trong JWT)
   * @returns Thông tin người dùng (không bao gồm mật khẩu)
   */
  async findById(userId: string): Promise<StandardResponse<User>> {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      return {
        message: 'Người dùng không tồn tại',
        data: null,
        errorCode: UserErrorCode.USER_NOT_FOUND,
      };
    }

    return {
      message: 'Lấy thông tin người dùng thành công',
      data: user,
      errorCode: null,
    };
  }
}
