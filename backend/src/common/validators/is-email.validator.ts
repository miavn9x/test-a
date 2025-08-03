import validator from 'validator';

// --- Validator kiểm tra email hợp lệ và không rỗng ---
export const IsEmailValidator = {
  // Hàm kiểm tra: đảm bảo không rỗng và đúng chuẩn định dạng email
  validator: (value: string) =>
    typeof value === 'string' && value.trim() !== '' && validator.isEmail(value),

  // Thông báo lỗi khi kiểm tra thất bại
  message: 'Email không hợp lệ hoặc bị bỏ trống',
};
