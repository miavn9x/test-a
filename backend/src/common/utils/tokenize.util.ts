// --- Remove Vietnamese accents ---
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD') // Chuyển thành Unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, '') // Xoá dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// --- tokenize: Tách từ để tìm kiếm ---
export const tokenize = (str: string): string[] => {
  return removeAccents(str)
    .toLowerCase()
    .split(/\s+/) // Tách theo khoảng trắng
    .filter(Boolean); // Bỏ token rỗng
};
