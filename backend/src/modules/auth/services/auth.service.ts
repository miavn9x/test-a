// --- Nhập Thư Viện NestJS ---
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthErrorCode } from '../constants/auth-error-code.enum';

// --- Nhập Các Dịch Vụ Nội Bộ ---
import { JwtService } from '../../../common/jwt/services/jwt.service';
import { setAuthCookies } from '../utils/set-cookie.util';

// --- Nhập Repository ---
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';

// --- Nhập DTOs ---
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

// --- Nhập Mongoose và Schema ---
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '../../../common/jwt/types/jwt.type';
import { User, UserDocument } from '../../users/schemas/user.schema';

// --- Định Nghĩa Auth Service ---
// Xử lý nghiệp vụ xác thực, phân quyền và quản lý phiên đăng nhập
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository, // Xử lý nghiệp vụ xác thực và phiên
    private readonly jwtService: JwtService, // Tạo và xác thực token
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>, // Truy cập bảng người dùng
  ) {}

  // --- Đăng Ký Người Dùng ---
  /**
   * Xử lý đăng ký tài khoản mới cho người dùng
   */
  async register(dto: RegisterDto) {
    const { email, password } = dto;

    // Kiểm tra định dạng email và kiểm tra trùng
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !email ||
      email.trim() === '' ||
      !emailRegex.test(email) ||
      (await this.userModel.findOne({ email }))
    ) {
      return {
        message: 'Email không hợp lệ hoặc đã tồn tại.',
        data: null,
        errorCode: AuthErrorCode.EMAIL_ALREADY_REGISTERED,
      };
    }

    // Kiểm tra độ mạnh của mật khẩu
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password || password.trim() === '' || !passwordRegex.test(password)) {
      return {
        message: 'Mật khẩu không hợp lệ.',
        data: null,
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    // Uỷ quyền repository xử lý đăng ký
    return this.authRepo.handleRegister(dto);
  }

  // --- Đăng Nhập Người Dùng ---
  /**
   * Xử lý đăng nhập người dùng và sinh token
   */
  async login(dto: LoginDto) {
    const { email, password } = dto;

    // Kiểm tra định dạng email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === '' || !emailRegex.test(email)) {
      return {
        message: 'Email không hợp lệ',
        data: null,
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    // Kiểm tra mật khẩu không được rỗng
    if (!password || password.trim() === '') {
      return {
        message: 'Mật khẩu không hợp lệ',
        data: null,
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    // Tìm người dùng theo email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return {
        message: 'Email chưa được đăng ký',
        data: null,
        errorCode: AuthErrorCode.USER_NOT_FOUND,
      };
    }

    // Uỷ quyền repository xử lý đăng nhập
    return this.authRepo.handleLogin(user, password);
  }

  // --- Đăng Xuất Người Dùng ---
  /**
   * Xử lý đăng xuất bằng cách đánh dấu phiên là hết hạn (isExpired = true)
   */
  async logout(sessionId: string) {
    if (typeof sessionId !== 'string' || sessionId.trim() === '') {
      return {
        message: 'Access Token không hợp lệ hoặc không được cung cấp',
        data: null,
        errorCode: AuthErrorCode.UNAUTHORIZED,
      };
    }

    // Uỷ quyền repository cập nhật trạng thái phiên (isExpired = true, expiresAt = now)
    return this.authRepo.logout(sessionId);
  }

  // --- Làm Mới Access Token ---
  /**
   * Xác thực refresh token và cấp lại access token mới, không cần access token
   */
  async refreshAccessToken(refreshToken: string, res: Response) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      return {
        message: 'Refresh Token không được cung cấp hoặc không hợp lệ',
        data: null,
        errorCode: AuthErrorCode.INVALID_REFRESH_TOKEN,
      };
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch {
      return {
        message: 'Refresh Token không hợp lệ hoặc đã hết hạn',
        data: null,
        errorCode: AuthErrorCode.INVALID_REFRESH_TOKEN,
      };
    }

    const sessionId = payload.sessionId;
    if (!sessionId) {
      return {
        message: 'Phiên đăng nhập không tồn tại hoặc đã bị thu hồi',
        data: null,
        errorCode: AuthErrorCode.SESSION_NOT_FOUND,
      };
    }

    const result = await this.authRepo.refreshTokens(sessionId);

    if (result.data) {
      const tokens = result.data as { accessToken?: string; refreshToken?: string };
      const accessMaxAge = this.jwtService.getAccessExpiresInMs();
      const refreshMaxAge = this.jwtService.getRefreshExpiresInMs();
      setAuthCookies(res, tokens, accessMaxAge, refreshMaxAge);
    }

    return result;
  }
}
