import { Response } from 'express';

// --- 🍪 Thiết lập cookie chứa accessToken và refreshToken ---
export function setAuthCookies(
  res: Response,
  tokens: { accessToken?: string; refreshToken?: string },
  accessMaxAge: number,
  refreshMaxAge: number,
) {
  const isProd = process.env.NODE_ENV === 'production';
  if (tokens.refreshToken) {
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.simhubglobal.com' : undefined,
      maxAge: refreshMaxAge,
    });
  }

  if (tokens.accessToken) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: isProd ? '.simhubglobal.com' : undefined,
      maxAge: accessMaxAge,
    });
  }
}
