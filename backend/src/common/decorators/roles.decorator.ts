// --- Import Thư Viện NestJS ---
import { SetMetadata } from '@nestjs/common';

// --- Định Nghĩa Decorator Phân Quyền ---
// Decorator @Roles cho phép gắn metadata "roles" vào route handler
// Metadata này sẽ được RolesGuard đọc và kiểm tra quyền truy cập
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
