import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/jwt/guards/jwt.guard';
import { UserRole } from 'src/modules/users/constants/user-role.enum';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { FilterOrderQueryDto } from '../dtos/filter-order-query.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { OrderService } from '../services/order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // --- Public API: Tạo đơn hàng ---
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    const data = await this.orderService.createOrder(dto);
    return data;
  }

  // --- Admin: Lấy danh sách đơn hàng có phân trang ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getOrderList() {
    const data = await this.orderService.getOrderList();
    return data;
  }

  // --- Admin: Lấy chi tiết đơn hàng ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('/detail/:code')
  async getOrderDetail(@Param('code') code: string) {
    const data = await this.orderService.getOrderDetail(code);
    return data;
  }

  // --- Admin: Tìm đơn hàng theo mã ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('search')
  async searchOrdersByCode(@Query('code') code: string) {
    const data = await this.orderService.searchOrderByCode(code);
    return data;
  }

  // --- Admin: Cập nhật đơn hàng ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':code')
  async updateOrder(@Param('code') code: string, @Body() dto: UpdateOrderDto) {
    const data = await this.orderService.updateOrder(code, dto);
    return data;
  }

  // --- Admin: Xoá đơn hàng ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':code')
  async deleteOrder(@Param('code') code: string) {
    const data = await this.orderService.deleteOrder(code);
    return data;
  }

  // --- Admin: Lọc đơn hàng theo orderStatus hoặc paymentStatus ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('filter')
  async filterOrders(@Query() query: FilterOrderQueryDto) {
    const data = await this.orderService.filterOrders(query);
    return {
      message: 'Lọc đơn hàng thành công',
      data,
      errorCode: null,
    };
  }
}
