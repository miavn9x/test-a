export class AuthResponse {
  // --- JWT Access Token ---
  accessToken?: string;

  // --- JWT Refresh Token ---
  refreshToken?: string;

  // --- Gợi ý hành vi xoá cookie từ phía client ---
  shouldClearCookie?: boolean;
}
