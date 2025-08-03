import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';
import { ProductService } from 'src/modules/products/services/product.service';
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dtos/update-product-variant.dto';
import { ProductVariantRepository } from '../repositories/product-variant.repository';
import { ProductVariant, ProductVariantDocument } from '../schemas/product-variant.schema';
import { buildVariantPayload } from '../utils/product-variant.util';

// --- [Service ProductVariantService] ---
@Injectable()
export class ProductVariantService {
  // --- [Constructor] ---
  constructor(
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,

    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  // --- [Tạo biến thể - 1 biến thể] ---
  async create(productCode: string, dto: CreateProductVariantDto): Promise<StandardResponse> {
    const payload = buildVariantPayload(productCode, dto);
    const created = await this.productVariantRepository.create(payload);
    return { message: 'Tạo biến thể thành công', data: created, errorCode: null };
  }

  // --- [Tạo biến thể - Nhiều biến thể] ---
  async createMany(
    productCode: string,
    dtos: CreateProductVariantDto[],
  ): Promise<StandardResponse> {
    const payloads = dtos.map(dto => buildVariantPayload(productCode, dto));
    const created = await this.productVariantRepository.createMany(payloads);
    return { message: 'Tạo nhiều biến thể thành công', data: created, errorCode: null };
  }

  // --- [Update Variant] ---
  async updateOne(productCode: string, dto: UpdateProductVariantDto): Promise<StandardResponse> {
    // --- [Kiểm tra biến thể] ---
    const current = await this.productVariantRepository.findOneByCodeAndProductCode(
      dto.code,
      productCode,
    );
    if (!current) {
      return { message: 'Không tìm thấy biến thể', data: null, errorCode: 'NOT_FOUND' };
    }

    const updatePayload: Partial<ProductVariant> = {};

    // --- [Cập nhật giá VND] ---
    if (dto.vndOriginal !== undefined) {
      const percent = dto.vndDiscountPercent || 0;
      updatePayload.vndPrice = {
        original: dto.vndOriginal,
        discountPercent: percent,
        final: dto.vndOriginal * (1 - percent / 100),
      };
    }

    // --- [Cập nhật giá USD] ---
    if (dto.usdOriginal !== undefined) {
      const percent = dto.usdDiscountPercent || 0;
      updatePayload.usdPrice = {
        original: dto.usdOriginal,
        discountPercent: percent,
        final: dto.usdOriginal * (1 - percent / 100),
      };
    }

    // --- [Cập nhật trạng thái] ---
    if (dto.isActive !== undefined) {
      updatePayload.isActive = dto.isActive;
    }

    // --- [Cập nhật DB] ---
    const updated = await this.productVariantRepository.updateOneByCodeAndProductCode(
      dto.code,
      productCode,
      updatePayload,
    );

    // --- [Cập nhật khoảng giá cho sản phẩm] ---
    await this.productService.updateProduct(productCode, {});

    return { message: 'Cập nhật biến thể thành công', data: updated, errorCode: null };
  }

  // --- [Cập nhật nhiều biến thể] ---
  async updateMany(
    productCode: string,
    dtos: UpdateProductVariantDto[],
  ): Promise<StandardResponse> {
    const results = await Promise.all(dtos.map(dto => this.updateOne(productCode, dto)));

    // --- [Cập nhật khoảng giá cho sản phẩm sau khi cập nhật nhiều biến thể] ---
    await this.productService.updateProduct(productCode, {});

    return { message: 'Cập nhật nhiều biến thể thành công', data: results, errorCode: null };
  }

  // --- [Lấy danh sách biến thể cho user] ---
  async getListForUser(productCode: string): Promise<StandardResponse> {
    const list = await this.productVariantRepository.findByProductCodeAndIsActive(
      productCode,
      true,
    );
    return { message: 'Lấy danh sách biến thể cho user', data: list, errorCode: null };
  }

  // --- [Lấy danh sách biến thể cho admin] ---
  async getListForAdmin(productCode: string): Promise<StandardResponse> {
    const list = await this.productVariantRepository.findByProductCode(productCode);
    return { message: 'Lấy danh sách biến thể cho admin', data: list, errorCode: null };
  }

  // --- [Lấy danh sách số ngày theo dung lượng] ---
  async getDurationsByCapacity(productCode: string, capacity: number): Promise<StandardResponse> {
    const durations = await this.productVariantRepository.getDurationsByCapacityAndIsActive(
      productCode,
      capacity,
      true,
    );
    return { message: 'Lấy danh sách số ngày thành công', data: durations, errorCode: null };
  }

  // --- [Lấy giá theo dung lượng & thời hạn] ---
  async getPriceByCapacityAndDuration(
    productCode: string,
    capacity: number,
    duration: number,
  ): Promise<StandardResponse> {
    const variant = await this.productVariantRepository.getPriceByCapacityAndDurationAndIsActive(
      productCode,
      capacity,
      duration,
      true,
    );
    return { message: 'Lấy giá biến thể thành công', data: variant, errorCode: null };
  }

  // --- [Xoá 1 biến thể] ---
  async deleteOne(code: string): Promise<StandardResponse> {
    await this.productVariantRepository.deleteByCode(code);
    return { message: 'Xoá biến thể thành công', data: null, errorCode: null };
  }

  // --- [Xoá toàn bộ biến thể theo sản phẩm] ---
  async deleteAllByProductCode(productCode: string): Promise<StandardResponse> {
    await this.productVariantRepository.deleteAllByProductCode(productCode);
    return { message: 'Xoá toàn bộ biến thể thành công', data: null, errorCode: null };
  }
}
