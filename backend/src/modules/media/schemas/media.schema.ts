import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaMimeTypeEnum } from 'src/modules/media/enums/media-mime-type.enum';
import { MediaStorageTypeEnum } from 'src/modules/media/enums/media-storage-type.enum';
import { MediaUsageEnum } from 'src/modules/media/enums/media-usage.enum';
import { MediaExtensionEnum } from '../enums/media-extension.enum';

@Schema({ versionKey: false, timestamps: true, collection: 'medias' })
export class Media {
  // --- Định danh & Thông tin cơ bản ---
  /**
   * Mã định danh duy nhất cho media.
   * Có prefix "media_image_" cho ảnh, "media_video_" cho video.
   * Sinh bởi backend, không nhận từ frontend.
   */
  @Prop({ required: true, unique: true })
  mediaCode: string;

  /**
   * Tên gốc của file khi upload.
   */
  @Prop({ required: true })
  originalName: string;

  /**
   * Slug tự động sinh từ originalName + timestamp.
   * Định dạng lowercase, không dấu, không nhận từ frontend.
   */
  @Prop({ required: true, unique: true })
  slug: string;

  /**
   * Mục đích sử dụng media (product, post, user,...).
   * Bắt buộc phải thuộc enum MediaUsageEnum.
   */
  @Prop({ enum: MediaUsageEnum, required: true })
  usage: MediaUsageEnum;

  // --- Nội dung & Định dạng ---
  /**
   * Loại media: "image" hoặc "video".
   */
  @Prop({ enum: ['image', 'video'], required: true })
  type: 'image' | 'video';

  /**
   * MIME type chuẩn của file, theo MediaMimeTypeEnum.
   */
  @Prop({ enum: MediaMimeTypeEnum, required: true })
  mimeType: MediaMimeTypeEnum;

  /**
   * Phần mở rộng file (jpg, png, mp4,...), theo MediaExtensionEnum.
   */
  @Prop({ enum: MediaExtensionEnum, required: true })
  extension: MediaExtensionEnum;

  /**
   * Kích thước file (byte).
   */
  @Prop({ required: true })
  size: number;

  /**
   * Chiều rộng media (nếu có).
   * Nếu không có dữ liệu, mặc định null.
   */
  @Prop({ type: Number, default: null })
  width: number | null;

  /**
   * Chiều cao media (nếu có).
   * Nếu không có dữ liệu, mặc định null.
   */
  @Prop({ type: Number, default: null })
  height: number | null;

  // --- Lưu trữ & Đường dẫn ---
  /**
   * Đường dẫn file (có thể là URL CDN/S3 hoặc local path).
   */
  @Prop({ required: true })
  url: string;

  /**
   * Loại nguồn lưu trữ file, theo MediaStorageTypeEnum.
   */
  @Prop({ enum: MediaStorageTypeEnum, required: true })
  storageType: MediaStorageTypeEnum;

  // --- Trạng thái & Xoá mềm ---
  /**
   * Trạng thái hoạt động của media.
   * Mặc định true (đang hoạt động).
   */
  @Prop({ default: true })
  isActive: boolean;

  /**
   * Trạng thái xóa mềm.
   * Mặc định false (chưa bị xóa).
   */
  @Prop({ default: false })
  isDeleted: boolean;

  /**
   * Thời điểm xóa mềm.
   * Null nếu chưa bị xóa.
   */
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  // --- Thời gian hệ thống ---
  /**
   * Thời gian tạo và cập nhật tự động kế thừa từ BaseTimestampsSchema:
   * - createdAt
   * - updatedAt
   */
  createdAt: Date;

  updatedAt: Date;
}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ type: 1 });
MediaSchema.index({ usage: 1 });
MediaSchema.index({ storageType: 1 });
MediaSchema.index({ isDeleted: 1, isActive: 1 });
MediaSchema.index({ createdAt: -1 });
