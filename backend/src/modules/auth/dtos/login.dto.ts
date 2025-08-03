// --- Import Thư Viện ---
import { IsEmail, IsNotEmpty } from 'class-validator';

// --- DTO Đăng Nhập Người Dùng ---
export class LoginDto {
  /**
   * Địa chỉ email người dùng — bắt buộc, định dạng hợp lệ.
   */
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email: string;

  /**
   * Mật khẩu người dùng — bắt buộc, không được để trống.
   */
  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
  password: string;
}
