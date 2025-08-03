import { IsNotEmpty, IsString } from 'class-validator';

// --- DTO: Chuỗi đa ngôn ngữ ---
// Dùng cho các trường cần hỗ trợ tiếng Việt và tiếng Anh
export class LocalizedStringDto {
  @IsNotEmpty()
  @IsString()
  vi: string;

  @IsNotEmpty()
  @IsString()
  en: string;
}
