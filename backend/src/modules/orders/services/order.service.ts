import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { MailService } from 'src/mail/send-mail.service';
import { Discount, DiscountDocument } from 'src/modules/discount/schemas/discount.schema';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { FilterOrderQueryDto } from '../dtos/filter-order-query.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { OrderRepository } from '../repositories/order.repository';
import { OrderDocument } from '../schemas/order.schema';
import { calcTotalOrderPrice, generateOrderCode, generateQrImageUrl } from '../utils/order.util';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    @InjectModel(Discount.name)
    private readonly discountModel: Model<DiscountDocument>,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const code = generateOrderCode();

    // --- [Xử lý giảm giá] ---
    let discountPercent = 0;
    if (dto.discountCode) {
      const discount = await this.discountModel.findOne({ code: dto.discountCode }).lean();
      if (discount) {
        discountPercent = discount.discountPercent;
      }
    }

    const totalPrice = calcTotalOrderPrice(dto.products, discountPercent);
    const qr = generateQrImageUrl(code, totalPrice);

    if (!qr.data) {
      throw new Error('Không thể tạo QR thanh toán cho đơn hàng');
    }

    const created = await this.orderRepository.create({
      ...dto,
      code,
      totalPrice,
      qrImageUrl: qr.data,
    });

    // await this.mailService.sendOrderNotification(created);

    return {
      message: 'Tạo đơn hàng thành công',
      data: created,
      errorCode: null,
    };
  }

  async getOrderList() {
    const [data, total] = await this.orderRepository.paginate();

    return {
      message: 'Lấy danh sách đơn hàng thành công',
      data: {
        items: data,
        total,
      },
      errorCode: null,
    };
  }

  async filterOrders(query: FilterOrderQueryDto) {
    const filter: FilterQuery<OrderDocument> = {};

    if (query.orderStatus) {
      filter.orderStatus = query.orderStatus;
    }

    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }
    const data = await this.orderRepository.findByFilter(filter);
    return data;
  }

  async getOrderDetail(code: string) {
    const order = await this.orderRepository.findByCode(code);
    if (!order) {
      return {
        message: 'Không tìm thấy đơn hàng',
        data: null,
        errorCode: 'ORDER_NOT_FOUND',
      };
    }

    return {
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
      errorCode: null,
    };
  }

  async searchOrderByCode(code: string) {
    const filter: FilterQuery<OrderDocument> = {};

    const isNumeric = /^\d+$/.test(code);

    if (isNumeric && code.length <= 4) {
      // Tìm gần đúng: 1-4 số cuối của mã đơn hàng
      filter.code = { $regex: `${code}$`, $options: 'i' };
    } else {
      // Tìm chính xác toàn bộ mã đơn hàng
      filter.code = code;
    }

    const order = await this.orderRepository.findOneByFilter(filter);

    if (!order) {
      return {
        message: 'Không tìm thấy đơn hàng',
        data: null,
        errorCode: 'ORDER_NOT_FOUND',
      };
    }

    return {
      message: 'Tìm đơn hàng thành công',
      data: order,
      errorCode: null,
    };
  }

  async updateOrder(code: string, dto: UpdateOrderDto) {
    const updatePayload: Partial<UpdateOrderDto> & { totalPrice?: number; qrImageUrl?: string } = {
      ...dto,
    };

    if (dto.products && dto.products.length > 0) {
      const totalPrice = calcTotalOrderPrice(dto.products);
      const qr = generateQrImageUrl(code, totalPrice);
      updatePayload.totalPrice = totalPrice;
      updatePayload.qrImageUrl = qr.data ?? '';
    }

    const updated = await this.orderRepository.updateByCode(code, updatePayload);

    if (!updated) {
      return {
        message: 'Không tìm thấy đơn hàng để cập nhật',
        data: null,
        errorCode: 'ORDER_NOT_FOUND',
      };
    }

    return {
      message: 'Cập nhật đơn hàng thành công',
      data: updated,
      errorCode: null,
    };
  }

  async deleteOrder(code: string) {
    const deleted = await this.orderRepository.deleteByCode(code);
    if (!deleted) {
      return {
        message: 'Không tìm thấy đơn hàng để xoá',
        data: null,
        errorCode: 'ORDER_NOT_FOUND',
      };
    }

    return {
      message: 'Xoá đơn hàng thành công',
      data: deleted,
      errorCode: null,
    };
  }
}
