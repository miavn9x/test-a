// --- Import Thư Viện NestJS ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// --- Import Module Nội Bộ ---
import { JwtModule } from '../../common/jwt/jwt.module';

// --- Import Schema ---
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthSession, AuthSessionSchema } from './schemas/auth.schema';

// --- Import Controller ---
import { AuthController } from 'src/modules/auth/controllers/auth.controller';

// --- Import Repository & Service ---
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AuthService } from './services/auth.service';

// --- Định Nghĩa Module Xác Thực ---
@Module({
  // --- Import Các Module Cần Thiết ---
  imports: [
    // Cấu hình schema cho MongoDB
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuthSession.name, schema: AuthSessionSchema },
    ]),
    // Cấu hình JWT cho xác thực
    JwtModule,
  ],
  // --- Khai Báo Controller ---
  controllers: [AuthController],
  // --- Khai Báo Provider ---
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}
