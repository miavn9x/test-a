// --- [Imports] ---
import { Injectable } from '@nestjs/common';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { CreateProductDto } from 'src/modules/products/dtos/create-product.dto';
import { ProductCategoryRepository } from 'src/modules/products/sub-modules/product-categories/repositories/product-category.repository';
import { ProductVariantRepository } from 'src/modules/products/sub-modules/product-variants/repositories/product-variant.repository';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductRepository } from '../repositories/product.repository';
import {
  CONTINENTS,
  ContinentKey,
} from '../sub-modules/product-categories/constants/product-category.enum';
import { ProductVariantService } from '../sub-modules/product-variants/services/product-variant.service';
import { buildVariantPayload } from '../sub-modules/product-variants/utils/product-variant.util';
import {
  buildSortOption,
  generateProductCode,
  generateProductTokens,
} from '../utils/product.utils';

@Injectable()
export class ProductService {
  // --- [Khởi tạo Service] ---
  constructor(
    private productRepository: ProductRepository,
    private productCategoryRepository: ProductCategoryRepository,
    private productVariantRepository: ProductVariantRepository,
    private productVariantService: ProductVariantService,
  ) {}

  // --- [Create Product] ---
  async createProduct(dto: CreateProductDto): Promise<StandardResponse> {
    // --- [Kiểm tra danh mục] ---
    const category = await this.productCategoryRepository.findByCategoryCode(
      dto.productCategoryCode,
    );
    if (!category) {
      return {
        message: 'Danh mục sản phẩm không tồn tại',
        data: null,
        errorCode: 'PRODUCT_CATEGORY_NOT_FOUND',
      };
    }

    // --- [Sinh mã code & tokens] ---
    const code = generateProductCode(dto.name);
    const tokens = generateProductTokens(dto.name);

    // --- [Tạo sản phẩm trong DB] ---
    const product = await this.productRepository.create({
      code,
      name: dto.name,
      description: dto.description || { vi: '', en: '' },
      productCategoryCode: dto.productCategoryCode,
      capacities: dto.capacities,
      durations: dto.durations,
      cover: dto.cover,
      gallery: dto.gallery || [],
      tokens,
    });

    // --- [Tạo biến thể mặc định] ---
    if (dto.capacities && dto.durations) {
      const variants = dto.capacities.flatMap(capacity =>
        dto.durations.map(duration =>
          buildVariantPayload(code, {
            productCode: code,
            capacity,
            duration,
            vndOriginal: 0,
            vndDiscountPercent: 0,
            usdOriginal: 0,
            usdDiscountPercent: 0,
          }),
        ),
      );

      await this.productVariantRepository.createMany(variants);
    }

    // --- [Trả về kết quả] ---
    return {
      message: 'Tạo sản phẩm thành công',
      data: product,
      errorCode: null,
    };
  }

  // --- [Update Product] ---
  async updateProduct(code: string, dto: UpdateProductDto): Promise<StandardResponse> {
    // --- [Kiểm tra sản phẩm] ---
    const product = await this.productRepository.findByCode(code);
    if (!product) {
      return {
        message: 'Sản phẩm không tồn tại',
        data: null,
        errorCode: 'PRODUCT_NOT_FOUND',
      };
    }

    // --- [Kiểm tra danh mục nếu thay đổi] ---\
    if (dto.productCategoryCode) {
      const category = await this.productCategoryRepository.findByCategoryCode(
        dto.productCategoryCode,
      );
      if (!category) {
        return {
          message: 'Danh mục sản phẩm không tồn tại',
          data: null,
          errorCode: 'PRODUCT_CATEGORY_NOT_FOUND',
        };
      }
    }

    // --- [Sinh lại code & tokens nếu đổi tên] ---
    if (dto.name) {
      product.code = generateProductCode(dto.name);
      product.tokens = generateProductTokens(dto.name);
      product.name = dto.name;
      // --- [Cập nhật lại productCode cho các biến thể nếu đổi code] ---
      await this.productVariantRepository.updateProductCodeForVariants(code, product.code);
    }

    // --- [Cập nhật các trường khác] ---
    if (dto.description) product.description = dto.description;
    if (dto.productCategoryCode) product.productCategoryCode = dto.productCategoryCode;
    if (dto.cover) product.cover = dto.cover;
    if (dto.gallery) product.gallery = dto.gallery;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.capacities) product.capacities = dto.capacities;
    if (dto.durations) product.durations = dto.durations;

    // --- [Xử lý khoảng giá tự động từ biến thể] ---
    const variants = await this.productVariantRepository.findByProductCode(product.code);

    if (variants.length === 1) {
      const v = variants[0];
      product.priceRange = {
        vnd: { min: 0, max: v.vndPrice.final },
        usd: { min: 0, max: v.usdPrice.final },
      };
    } else if (variants.length > 1) {
      const vndPrices = variants.map(v => v.vndPrice.final);
      const usdPrices = variants.map(v => v.usdPrice.final);

      product.priceRange = {
        vnd: {
          min: Math.min(...vndPrices),
          max: Math.max(...vndPrices),
        },
        usd: {
          min: Math.min(...usdPrices),
          max: Math.max(...usdPrices),
        },
      };
    }

    // --- [Lưu vào DB] ---
    const updated = await this.productRepository.updateByCode(code, product);

    // --- [Trả về kết quả] ---
    return {
      message: 'Cập nhật sản phẩm thành công',
      data: updated,
      errorCode: null,
    };
  }

  // --- [Delete Product] ---
  async deleteProduct(code: string): Promise<StandardResponse> {
    // --- [Kiểm tra sản phẩm] ---
    const product = await this.productRepository.findByCode(code);
    if (!product) {
      return {
        message: 'Sản phẩm không tồn tại',
        data: null,
        errorCode: 'PRODUCT_NOT_FOUND',
      };
    }

    // --- [Xoá biến thể liên quan] ---
    await this.productVariantRepository.deleteAllByProductCode(code);

    // --- [Xoá sản phẩm] ---
    await this.productRepository.deleteByCode(code);

    // --- [Trả về kết quả] ---
    return {
      message: 'Xoá sản phẩm thành công',
      data: null,
      errorCode: null,
    };
  }

  // --- [Get Product List For Admin] ---
  async getProductListForAdmin(sortBy?: string): Promise<StandardResponse> {
    // --- [Xác định tiêu chí sắp xếp] ---
    const sortOption = buildSortOption(sortBy);

    // --- [Lấy danh sách từ DB] ---
    const { data, total } = await this.productRepository.findAllForAdmin(sortOption);

    // --- [Trả về kết quả] ---
    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        items: data.map(item => ({
          code: item.code,
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
      },
      errorCode: null,
    };
  }

  // --- [Get Product List By Category For Admin] ---
  async getByCategoryForAdmin(
    productCategoryCode: string,
    pagination: { page: number; limit: number },
    sortBy?: string,
  ): Promise<StandardResponse> {
    // --- [Kiểm tra danh mục] ---
    const category = await this.productCategoryRepository.findByCategoryCode(productCategoryCode);
    if (!category) {
      return {
        message: 'Danh mục sản phẩm không tồn tại',
        data: null,
        errorCode: 'PRODUCT_CATEGORY_NOT_FOUND',
      };
    }

    // --- [Xác định tiêu chí sắp xếp] ---
    const sortOption = buildSortOption(sortBy);

    // --- [Lấy danh sách từ DB] ---
    const { data, total } = await this.productRepository.findByCategoryForAdmin(
      productCategoryCode,
      pagination.page,
      pagination.limit,
      sortOption,
    );

    // --- [Trả về kết quả] ---
    return {
      message: 'Lấy danh sách sản phẩm theo danh mục thành công',
      data: {
        items: data.map(item => ({
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
      errorCode: null,
    };
  }

  // --- [Get Product List For User] ---
  async getProductListForUser(
    pagination: { page: number; limit: number },
    sortBy?: string,
  ): Promise<StandardResponse> {
    // --- [Xác định tiêu chí sắp xếp] ---
    const sortOption = buildSortOption(sortBy);

    // --- [Lấy danh sách từ DB] ---
    const { data, total } = await this.productRepository.findAllPublic(
      pagination.page,
      pagination.limit,
      sortOption,
    );

    // --- [Trả về kết quả] ---
    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        items: data.map(item => ({
          code: item.code,
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
      errorCode: null,
    };
  }

  // --- [Get Product List By Category For User] ---
  async getByCategory(
    productCategoryCode: string,
    pagination: { page: number; limit: number },
    sortBy?: string,
  ): Promise<StandardResponse> {
    // --- [Kiểm tra danh mục] ---
    const category = await this.productCategoryRepository.findByCategoryCode(productCategoryCode);
    if (!category) {
      return {
        message: 'Danh mục sản phẩm không tồn tại',
        data: null,
        errorCode: 'PRODUCT_CATEGORY_NOT_FOUND',
      };
    }

    // --- [Xác định tiêu chí sắp xếp] ---
    const sortOption = buildSortOption(sortBy);

    // --- [Lấy danh sách từ DB] ---
    const { data, total } = await this.productRepository.findByCategoryPublic(
      productCategoryCode,
      pagination.page,
      pagination.limit,
      sortOption,
    );

    // --- [Trả về kết quả] ---
    return {
      message: 'Lấy danh sách sản phẩm theo danh mục thành công',
      data: {
        items: data.map(item => ({
          code: item.code,
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
      errorCode: null,
    };
  }

  // --- [Get Product List By Category Type For User] ---
  async getByCategoryType(
    categoryType: string,
    pagination: { page: number; limit: number },
    sortBy?: string,
  ): Promise<StandardResponse> {
    // --- [Lấy danh sách danh mục có type tương ứng] ---
    const categories = await this.productCategoryRepository.findCodesByType(categoryType);
    if (!categories || categories.length === 0) {
      return {
        message: 'Không tìm thấy danh mục nào cho type này',
        data: [],
        errorCode: null,
      };
    }

    const categoryCodes = categories;

    // --- [Xác định tiêu chí sắp xếp] ---
    const sortOption = buildSortOption(sortBy);

    // --- [Lấy danh sách sản phẩm thuộc các danh mục] ---
    const { data, total } = await this.productRepository.findByCategoryCodesPublic(
      categoryCodes,
      pagination.page,
      pagination.limit,
      sortOption,
    );

    // --- [Trả về kết quả] ---
    return {
      message: 'Lấy danh sách sản phẩm theo type thành công',
      data: {
        items: data.map(item => ({
          code: item.code,
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
      errorCode: null,
    };
  }

  // --- [Get Product Detail] ---
  async getProductDetail(code: string): Promise<StandardResponse> {
    // --- [Lấy sản phẩm] ---
    const product = await this.productRepository.findByCode(code);
    if (!product) {
      return {
        message: 'Sản phẩm không tồn tại',
        data: null,
        errorCode: 'PRODUCT_NOT_FOUND',
      };
    }

    // --- [Lấy danh mục] ---
    const category = await this.productCategoryRepository.findByCategoryCode(
      product.productCategoryCode,
    );

    // --- [Lấy biến thể] ---
    const variants = await this.productVariantRepository.findByProductCode(code);

    // --- [Trả về kết quả] ---
    return {
      message: 'Lấy chi tiết sản phẩm thành công',
      data: {
        product,
        category,
        variants,
      },
      errorCode: null,
    };
  }

  // --- [Get Product List By Category Type & Continent For User] ---
  async getByTypeAndContinent(
    categoryType: string,
    continent: string,
    pagination: { page: number; limit: number },
    sortBy?: string,
  ): Promise<StandardResponse> {
    // --- [Chuẩn hóa continent về key] ---
    const continentKey = Object.keys(CONTINENTS).find(
      key =>
        CONTINENTS[key as ContinentKey].vi === continent ||
        CONTINENTS[key as ContinentKey].en === continent ||
        key === continent,
    ) as ContinentKey | undefined;

    if (!continentKey) {
      return {
        message: `Continent '${continent}' không hợp lệ`,
        data: [],
        errorCode: 'INVALID_CONTINENT',
      };
    }

    // --- [Lấy danh mục theo type và continent] ---
    const categories = await this.productCategoryRepository.findCodesByTypeAndContinent(
      categoryType,
      continentKey, // truyền vào key đã chuẩn hóa
    );

    if (!categories.length) {
      return {
        message: 'Không tìm thấy danh mục nào cho type và continent này',
        data: [],
        errorCode: null,
      };
    }

    const sortOption = buildSortOption(sortBy);

    const { data, total } = await this.productRepository.findByCategoryCodesPublic(
      categories,
      pagination.page,
      pagination.limit,
      sortOption,
    );

    return {
      message: 'Lấy danh sách sản phẩm theo type và continent thành công',
      data: {
        items: data.map(item => ({
          code: item.code,
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
      errorCode: null,
    };
  }

  // --- [Get Product List By Category Type, Continent & Country For User] ---
  async getByTypeContinentCountry(
    categoryType: string,
    continent: string,
    country: string,
    pagination: { page: number; limit: number },
    sortBy?: string,
  ): Promise<StandardResponse> {
    // --- [Chuẩn hóa continent về key] ---
    const continentKey = Object.keys(CONTINENTS).find(
      key =>
        CONTINENTS[key as ContinentKey].vi === continent ||
        CONTINENTS[key as ContinentKey].en === continent ||
        key === continent,
    ) as ContinentKey | undefined;

    if (!continentKey) {
      return {
        message: `Continent '${continent}' không hợp lệ`,
        data: [],
        errorCode: 'INVALID_CONTINENT',
      };
    }

    // --- [Lấy danh mục theo type, continent và country] ---
    const categories = await this.productCategoryRepository.findCodesByTypeContinentCountry(
      categoryType,
      continentKey,
      country,
    );

    if (!categories.length) {
      return {
        message: 'Không tìm thấy danh mục nào cho type, continent và country này',
        data: [],
        errorCode: null,
      };
    }

    const sortOption = buildSortOption(sortBy);

    const { data, total } = await this.productRepository.findByCategoryCodesPublic(
      categories,
      pagination.page,
      pagination.limit,
      sortOption,
    );

    return {
      message: 'Lấy danh sách sản phẩm theo type, continent và country thành công',
      data: {
        items: data.map(item => ({
          code: item.code,
          cover: item.cover,
          name: item.name,
          priceRange: item.priceRange,
        })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
      errorCode: null,
    };
  }

  // --- [Search Products By Query Tokens] ---
  async searchProducts(query: string, sortBy?: string): Promise<StandardResponse> {
    if (!query || query.trim().length === 0) {
      return {
        message: 'Thiếu từ khoá tìm kiếm',
        data: [],
        errorCode: 'MISSING_QUERY',
      };
    }

    const queryTokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.trim().length > 0);

    const sortOption = buildSortOption(sortBy);

    const products = await this.productRepository.searchByTokens(queryTokens, sortOption);

    return {
      message: 'Tìm kiếm sản phẩm thành công',
      data: products.map(item => ({
        code: item.code,
        cover: item.cover,
        name: item.name,
        priceRange: item.priceRange,
      })),
      errorCode: null,
    };
  }
}
