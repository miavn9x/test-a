// src/common/guards/roles.guard.ts
// --- Import Thư Viện NestJS ---
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'src/common/jwt/types/jwt.type';

// --- Guard Kiểm Tra Phân Quyền Người Dùng ---
// Được sử dụng để kiểm tra xem người dùng hiện tại có vai trò phù hợp để truy cập route hay không.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // Phương thức chính được gọi khi request đến route được bảo vệ
  canActivate(context: ExecutionContext): boolean {
    // Lấy roles yêu cầu từ metadata
    // this.reflector.get(...) lấy metadata từ decorator `@Roles`
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    // if (!requiredRoles ...) nếu không yêu cầu vai trò nào, cho phép qua
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // const { user } ... lấy thông tin người dùng từ request
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: JwtPayload & { roles: string[] } }>();
    // Thông báo nếu người dùng không có thông tin hoặc không có vai trò phù hợp
    if (!user || !user.roles) {
      console.warn('[RolesGuard] ❌ Người dùng không có quyền truy cập tính năng này.');
      return false;
    }

    // return requiredRoles.some(...) kiểm tra user có ít nhất 1 role phù hợp
    return requiredRoles.some(role => user.roles.includes(role));
  }
}
