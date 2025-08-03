// --- Import Thư Viện NestJS ---
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/jwt.type';

// --- Import Kiểu Dữ Liệu Nội Bộ ---
import * as ms from 'ms';

// --- Service Quản Lý JWT ---
// Đóng gói logic tạo, xác thực JWT và quản lý thời gian hết hạn
@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  // --- ✅ Tạo Access Token & Refresh Token ---
  // Tạo accessToken và refreshToken từ payload người dùng
  signTokens(payload: JwtPayload): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  // --- ✅ Xác Thực Access Token ---
  // Xác thực accessToken và giải mã thông tin người dùng từ token
  verify(token: string): JwtPayload {
    return this.jwt.verify(token, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  // --- ✅ Xác Thực Refresh Token ---
  // Xác thực refreshToken và giải mã thông tin người dùng từ token
  verifyRefreshToken(token: string): JwtPayload {
    return this.jwt.verify(token, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  // --- ✅ Trả Về Thời Gian Hết Hạn Access Token ---
  // Đọc từ biến môi trường và chuyển về milliseconds
  getAccessExpiresInMs(): number {
    const raw: string | undefined = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
    if (!raw) {
      throw new Error('❌ Thiếu JWT_ACCESS_TOKEN_EXPIRES_IN trong biến môi trường');
    }

    if (typeof ms !== 'function') {
      throw new Error('❌ ms is not a function');
    }
    const msResult: number = (ms as (val: string) => number)(raw);
    if (typeof msResult !== 'number') {
      throw new Error('❌ JWT_ACCESS_TOKEN_EXPIRES_IN phải có định dạng như "15m", "1h"...');
    }
    const msValue: number = msResult;

    return msValue;
  }

  // --- ✅ Trả Về Thời Gian Hết Hạn Refresh Token ---
  // Đọc từ biến môi trường và chuyển về milliseconds
  getRefreshExpiresInMs(): number {
    const raw: string | undefined = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;
    if (!raw) {
      throw new Error('❌ Thiếu JWT_REFRESH_TOKEN_EXPIRES_IN trong biến môi trường');
    }

    const msResult: number = (ms as (val: string) => number)(raw);
    if (typeof msResult !== 'number') {
      throw new Error('❌ JWT_REFRESH_TOKEN_EXPIRES_IN phải có định dạng như "7d", "30d"...');
    }

    return msResult;
  }
}
