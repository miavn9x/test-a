/**
 * Enum UserRole
 *
 * Xác định vai trò của người dùng trong hệ thống.
 * Dùng để kiểm soát quyền truy cập vào các tính năng hoặc API.
 */
export enum UserRole {
  /**
   * Người dùng thông thường — có quyền truy cập hạn chế vào các chức năng cơ bản.
   */
  USER = 'user',

  /**
   * Quản trị viên — có toàn quyền quản lý hệ thống, bao gồm người dùng, đơn hàng, cài đặt,...
   */
  ADMIN = 'admin',
}
