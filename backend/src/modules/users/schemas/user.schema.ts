// --- Thư Viện Cần Thiết ---
// Import các decorator và class hỗ trợ định nghĩa schema từ NestJS và Mongoose
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- Enum & Hằng Số ---
// Import enum UserRole để định nghĩa các vai trò người dùng
import { UserRole } from '../constants/user-role.enum';

// --- Kiểu Dữ Liệu ---
// Định nghĩa kiểu UserDocument để sử dụng trong các thao tác MongoDB (CRUD, query, ...)
export type UserDocument = User & Document;

// --- Định Nghĩa Schema ---
// Lớp User định nghĩa cấu trúc và quy tắc lưu trữ tài liệu người dùng trong MongoDB
/**
 * Schema Mongoose định nghĩa cấu trúc tài liệu của người dùng trong MongoDB.
 * Bao gồm các thông tin hồ sơ, bảo mật, phân quyền, trạng thái và các liên kết hệ thống khác.
 */
@Schema({ timestamps: true, collection: 'users' })
export class User {
  // --- Phân Quyền ---
  // Các vai trò người dùng, xác định quyền truy cập và chức năng trong hệ thống
  // Sử dụng enum để giới hạn các giá trị hợp lệ, đồng thời index để tăng tốc truy vấn theo roles
  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER], index: true })
  roles: UserRole[];

  // --- Hồ Sơ Cơ Bản ---
  // Email là trường duy nhất để định danh người dùng, do đó cần unique và index để đảm bảo tính duy nhất và truy vấn nhanh
  @Prop({ required: true, unique: true, index: true })
  email: string;

  // --- Xác Thực & Truy Cập ---
  // Các trường liên quan đến xác thực tài khoản và hoạt động đăng nhập

  @Prop({ default: null })
  lastLoginAt: Date;

  // --- Bảo Mật ---
  // Mật khẩu được mã hóa để bảo vệ tài khoản người dùng
  // select: false để không trả về trường này trong các truy vấn mặc định, tăng cường bảo mật
  @Prop({ required: true })
  password: string;

  // --- Thời Gian Tạo & Cập Nhật ---
  // Các trường này được tự động quản lý bởi Mongoose khi sử dụng timestamps: true
  createdAt: Date;

  updatedAt: Date;
}

// --- Khởi Tạo Schema ---
// Tạo UserSchema từ class User để sử dụng trong module Mongoose
export const UserSchema = SchemaFactory.createForClass(User);
