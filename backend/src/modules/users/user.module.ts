// --- Import Thư Viện NestJS ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// --- Import Schema ---
import { User, UserSchema } from './schemas/user.schema';

// --- Import Controller ---
import { UsersController } from './controllers/user.controller';

// --- Import Repository & Service ---
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/user.service';

// --- Định Nghĩa Module Người Dùng ---
@Module({
  // --- Import Các Module Cần Thiết ---
  imports: [
    // Cấu hình schema cho MongoDB
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  // --- Khai Báo Controller ---
  controllers: [UsersController],
  // --- Khai Báo Provider ---
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
