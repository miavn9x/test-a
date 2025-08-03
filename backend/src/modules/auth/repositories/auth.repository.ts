// --- Import Mongoose ---
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// --- Import Hashing ---
import * as argon2 from 'argon2';
// --- Import Services ---
import { JwtService } from 'src/common/jwt/services/jwt.service';
// --- Import DTOs ---
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
// --- Import Schemas ---
import { AuthErrorCode } from 'src/modules/auth/constants/auth-error-code.enum';
import { AuthSession, AuthSessionDocument } from 'src/modules/auth/schemas/auth.schema';
import { createTokenAndSession } from 'src/modules/auth/utils/token-session.util';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';

// --- AUTH REPOSITORY ---
export class AuthRepository {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: Model<AuthSessionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // --- ĐĂNG KÝ NGƯỜI DÙNG ---
  /**
   * Xử lý đăng ký người dùng
   * 1. Mã hoá mật khẩu bằng argon2id để đảm bảo an toàn
   * 2. Tạo mới một bản ghi người dùng với thông tin đã mã hoá và các thuộc tính mặc định
   * 3. Cập nhật thời điểm đăng nhập cuối cùng (lastLoginAt) cho người dùng mới
   * 4. Tạo sessionId ngẫu nhiên để quản lý phiên đăng nhập
   * 5. Tạo payload chứa thông tin cần thiết cho token JWT
   * 6. Sinh access token và refresh token dựa trên payload
   * 7. Tạo mới phiên đăng nhập trong cơ sở dữ liệu với thời hạn 7 ngày
   * 8. Trả về access token và refresh token cho client
   * @param dto - Dữ liệu đăng ký người dùng (email, password)
   * @returns Thông báo thành công cùng access token và refresh token
   */
  async handleRegister(dto: RegisterDto) {
    const { email, password } = dto;

    // 1. Mã hoá mật khẩu bằng argon2id
    const hashed = await argon2.hash(password, { type: argon2.argon2id });

    // 2. Tạo người dùng mới
    const user = await this.userModel.create({
      email,
      password: hashed,
      roles: ['user'],
      isEmailVerified: false,
      loyaltyPoints: 0,
      membershipTier: 'Bronze',
    });

    //3. Cập nhật lastLoginAt vào bảng user và tạo sessionId
    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = await createTokenAndSession({
      user,
      jwtService: this.jwtService,
      authSessionModel: this.authSessionModel,
    });

    return {
      message: 'Đăng ký thành công',
      data: {
        accessToken,
        refreshToken,
      },
      errorCode: null,
    };
  }

  // --- ĐĂNG NHẬP NGƯỜI DÙNG ---
  /**
   * Xử lý đăng nhập người dùng
   * 1. Xác thực mật khẩu bằng argon2id
   * 2. Cập nhật thời điểm đăng nhập cuối
   * 3. Tạo sessionId mới cho phiên
   * 4. Sinh payload chứa thông tin xác thực
   * 5. Tạo access token và refresh token
   * 6. Tạo bản ghi phiên đăng nhập
   * 7. Nếu vượt quá 3 phiên, xoá phiên cũ nhất
   * 8. Trả về token và thông báo kết quả
   * @param user - Document người dùng MongoDB đã tìm thấy
   * @param password - Mật khẩu người dùng gửi lên để xác thực
   * @returns Access Token + Refresh Token nếu thành công, lỗi nếu thất bại
   */
  async handleLogin(user: UserDocument, password: string) {
    // 1. Kiểm tra mật khẩu
    const userWithPassword = await this.userModel.findById(user._id).select('+password');

    const isPasswordValid =
      userWithPassword && (await argon2.verify(userWithPassword.password, password));
    if (!isPasswordValid) {
      return {
        message: 'Email hoặc mật khẩu không chính xác',
        data: null,
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    // 2. Cập nhật thời điểm đăng nhập
    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = await createTokenAndSession({
      user,
      jwtService: this.jwtService,
      authSessionModel: this.authSessionModel,
    });

    // 7. Giới hạn tối đa 3 phiên hoạt động
    const activeSessions = await this.authSessionModel
      .find({ userId: user._id, isExpired: false })
      .sort({ loginAt: 1 });
    if (activeSessions.length >= 4) {
      const oldest = activeSessions[0];
      await this.authSessionModel.updateOne(
        { _id: oldest._id },
        { isExpired: true, expiresAt: new Date() },
      );
    }

    // 8. Trả về kết quả thành công
    return {
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        refreshToken,
      },
      errorCode: null,
    };
  }

  // --- ĐĂNG XUẤT NGƯỜI DÙNG ---

  /**
   * Đăng xuất người dùng bằng cách xoá phiên tương ứng
   * 1. Tìm và xoá phiên theo sessionId
   * 2. Nếu không tìm thấy → trả lỗi SESSION_NOT_FOUND
   * 3. Nếu thành công → yêu cầu xoá cookie refreshToken phía client
   * @param sessionId - Mã định danh phiên đăng nhập (lấy từ access token)
   * @returns Phản hồi thành công hoặc lỗi nếu không tìm thấy phiên
   */
  async logout(sessionId: string) {
    const result = await this.authSessionModel.updateOne(
      { sessionId },
      { isExpired: true, expiresAt: new Date() },
    );

    if (!result || result.modifiedCount === 0) {
      return {
        message: 'Phiên đăng nhập không tồn tại hoặc đã hết hạn',
        data: null,
        errorCode: AuthErrorCode.SESSION_NOT_FOUND,
      };
    }

    return {
      message: 'Đăng xuất thành công',
      data: { shouldClearCookie: true },
      errorCode: null,
    };
  }

  // --- LÀM MỚI ACCESS TOKEN ---
  /**
   * Làm mới access token và refresh token
   * 1. Tìm phiên hợp lệ theo sessionId + refreshToken
   * 2. Nếu không hợp lệ → trả lỗi SESSION_NOT_FOUND hoặc INVALID_REFRESH_TOKEN
   * 3. Nếu hợp lệ:
   *   - Tạo access token và refresh token mới
   *   - Cập nhật refreshToken và thời gian lastRefreshedAt trong DB
   * @param sessionId - Mã định danh phiên hiện tại (từ access token)
   * @param oldRefreshToken - Refresh token cũ để kiểm tra
   * @returns Token mới hoặc lỗi
   */
  async refreshTokens(sessionId: string) {
    const session = await this.authSessionModel.findOne({
      sessionId,
    });
    if (!session || session.expiresAt < new Date()) {
      return {
        message: session
          ? 'Refresh Token không hợp lệ hoặc đã hết hạn'
          : 'Phiên đăng nhập không tồn tại hoặc đã bị thu hồi',
        data: null,
        errorCode: session ? AuthErrorCode.INVALID_REFRESH_TOKEN : AuthErrorCode.SESSION_NOT_FOUND,
      };
    }

    const user = await this.userModel.findById(session.userId);
    if (!user) {
      return {
        message: 'Người dùng không tồn tại',
        data: null,
        errorCode: AuthErrorCode.USER_NOT_FOUND,
      };
    }

    const payload = {
      sub: (user._id as Types.ObjectId).toString(),
      sessionId,
      email: user.email,
      roles: user.roles,
    };

    const { accessToken, refreshToken: newRefreshToken } = this.jwtService.signTokens(payload);

    session.refreshToken = newRefreshToken;
    session.lastRefreshedAt = new Date();
    await session.save();

    return {
      message: 'Làm mới token thành công',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
      errorCode: null,
    };
  }
}
