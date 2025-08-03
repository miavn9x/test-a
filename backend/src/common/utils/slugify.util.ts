import slugifyLib from 'slugify';

export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true, // bỏ hết ký tự đặc biệt
    locale: 'vi', // hỗ trợ tiếng Việt tốt hơn
  });
}
