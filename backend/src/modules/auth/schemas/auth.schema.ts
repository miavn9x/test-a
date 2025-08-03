// --- Import Thư Viện NestJS ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// --- Import Validator ---
import { IsEmailValidator } from 'src/common/validators/is-email.validator';

// --- Import Mongoose ---
import { Document, Types } from 'mongoose';

// --- Import Nội Bộ ---
import { BaseTimestampsSchema } from '../../../common/schemas/base-timestamps.schema';

// --- Định Nghĩa Interface Cho Phiên Đăng Nhập ---
export type AuthSessionDocument = AuthSession & Document;

// --- Định Nghĩa Schema ---
@Schema({
  timestamps: true,
  collection: 'auth_sessions',
})
export class AuthSession extends BaseTimestampsSchema {
  // --- Định Danh ---
  // Mã định danh duy nhất cho mỗi phiên đăng nhập
  @Prop({ required: true, unique: true })
  sessionId: string;

  // --- Người Dùng ---
  // Email của người dùng gắn với phiên đăng nhập này
  @Prop({
    required: true,
    validate: IsEmailValidator,
  })
  email: string;

  // Tham chiếu đến người dùng liên quan trong collection 'User'
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // --- Xác Thực ---
  // Refresh token được cấp khi đăng nhập, dùng để làm mới access token
  @Prop({ required: true, unique: true })
  refreshToken: string;

  // --- Thời Gian ---
  // Thời điểm người dùng đăng nhập
  @Prop({ required: true })
  loginAt: Date;

  // Thời điểm cuối cùng phiên này được refresh (làm mới accessToken từ refreshToken)
  @Prop()
  lastRefreshedAt: Date;

  // --- Trạng Thái Phiên ---
  // Đánh dấu phiên này đã hết hạn hay chưa
  @Prop({ default: false })
  isExpired: boolean;

  // Thời điểm phiên này hết hạn
  @Prop({ required: true })
  expiresAt: Date;
}

// --- Tạo Schema Mongoose ---
export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
