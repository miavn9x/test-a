import { v4 as uuidv4 } from 'uuid';

/**
 * Tạo sessionId duy nhất cho mỗi phiên đăng nhập.
 * @returns Chuỗi sessionId
 */
export function generateSessionId(): string {
  return `sess_${uuidv4()}`;
}
