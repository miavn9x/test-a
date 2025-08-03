import { Prop } from '@nestjs/mongoose';

/**
 * BaseTimestampsSchema
 *
 * Lớp trừu tượng dùng để mở rộng cho các schema khác trong hệ thống.
 * Tự động thêm thông tin thời gian tạo (createdAt) và thời gian cập nhật (updatedAt)
 * vào mọi bản ghi trong MongoDB khi dùng với @Schema({ timestamps: true }).
 */
export abstract class BaseTimestampsSchema {
  /**
   * Thời điểm tạo bản ghi.
   * Sẽ được Mongoose tự động gán khi tạo mới nếu dùng với timestamps: true.
   */
  @Prop({ default: () => new Date() })
  createdAt: Date;

  /**
   * Thời điểm bản ghi được cập nhật lần cuối.
   * Mongoose sẽ tự động cập nhật mỗi khi có thao tác update nếu dùng timestamps: true.
   */
  @Prop({ default: () => new Date() })
  updatedAt: Date;
}
