// --- Import Thư Viện ---
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// --- Import Nội Bộ ---
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';

// --- Repository Người Dùng ---
@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /**
   * Tìm người dùng theo ID và loại bỏ mật khẩu
   * @param userId - ID người dùng
   * @returns Thông tin người dùng (không bao gồm mật khẩu)
   */
  async findUserById(userId: string) {
    return this.userModel.findById(userId).select('-password').lean();
  }
}
