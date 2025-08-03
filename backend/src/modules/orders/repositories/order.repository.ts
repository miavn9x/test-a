import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Order.name) private readonly model: Model<OrderDocument>) {}

  async create(data: Partial<Order>): Promise<Order> {
    return this.model.create(data);
  }

  async paginate(): Promise<[Order[], number]> {
    const [items, total] = await Promise.all([
      this.model.find().sort({ createdAt: -1 }).lean(),
      this.model.countDocuments(),
    ]);
    return [items, total];
  }

  async findByCode(code: string): Promise<Order | null> {
    return this.model.findOne({ code }).lean();
  }

  async updateByCode(code: string, update: Partial<Order>): Promise<Order | null> {
    return this.model.findOneAndUpdate({ code }, update, { new: true }).lean();
  }

  async deleteByCode(code: string): Promise<Order | null> {
    return this.model.findOneAndDelete({ code }).lean();
  }

  async findByFilter(filter: FilterQuery<OrderDocument>): Promise<Order[]> {
    return this.model.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findOneByFilter(filter: FilterQuery<OrderDocument>): Promise<Order | null> {
    return this.model.findOne(filter).lean();
  }
}
