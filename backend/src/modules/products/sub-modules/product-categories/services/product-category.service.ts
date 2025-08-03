// --- [Imports] ---
import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';
import {
  buildSortOption,
  generateCodeFromName,
  generateDisplayName,
} from 'src/modules/products/sub-modules/product-categories/utils/product-category.util';
import {
  ContinentKey,
  CONTINENTS,
  ContinentValue,
  ProductCategoryType,
} from '../constants/product-category.enum';
import { CreateProductCategoryDto } from '../dtos/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dtos/update-product-category.dto';
import { ProductCategoryRepository } from '../repositories/product-category.repository';

// --- [Service ProductCategoryService] ---
@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  // --- [Tạo danh mục sản phẩm] ---
  async create(dto: CreateProductCategoryDto) {
    // Bước 1: Sinh displayName từ networkName
    const displayName = generateDisplayName(dto.type, dto.networkName);

    // Bước 2: Sinh code tự động từ displayName + ddMMyy
    const code = generateCodeFromName(displayName);

    // Bước 3: Map continent key thành object { vi, en }
    const continentData = dto.continent.map(key => ({
      vi: CONTINENTS[key].vi,
      en: CONTINENTS[key].en,
    }));

    // Bước 4: Lưu danh mục vào DB
    const created = await this.productCategoryRepository.create({
      code,
      type: dto.type,
      continent: continentData,
      country: dto.country,
      networkName: dto.networkName,
      displayName,
    });

    return {
      message: 'Tạo danh mục thành công',
      data: created,
      errorCode: null,
    };
  }

  // --- [Cập nhật danh mục sản phẩm] ---
  async update(code: string, dto: UpdateProductCategoryDto) {
    // Bước 1: Tìm danh mục theo code
    const category = await this.productCategoryRepository.findByCode(code);
    if (!category) {
      return {
        message: 'Danh mục không tồn tại',
        data: null,
        errorCode: 'CATEGORY_NOT_FOUND',
      };
    }

    // Bước 2: Cập nhật các trường nếu có
    if (dto.networkName) {
      category.networkName = dto.networkName;

      category.displayName = generateDisplayName(dto.type || category.type, dto.networkName);
      // category.code = generateCodeFromName(category.displayName);
    }

    if (dto.continent) {
      category.continent = dto.continent.map(key => ({
        vi: CONTINENTS[key].vi,
        en: CONTINENTS[key].en,
      }));
    }

    if (dto.country) {
      category.country = dto.country;
    }

    if (dto.type) {
      category.type = dto.type;
      if (!dto.networkName) {
        category.displayName = generateDisplayName(dto.type, category.networkName);
      }
    }

    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    // Bước 3: Gọi repository để cập nhật theo code
    await this.productCategoryRepository.updateByCode(code, category);

    return {
      message: 'Cập nhật danh mục thành công',
      data: category,
      errorCode: null,
    };
  }

  // --- [Xoá danh mục sản phẩm] ---
  async delete(code: string) {
    // Bước 1: Kiểm tra danh mục có tồn tại không
    const category = await this.productCategoryRepository.findByCode(code);
    if (!category) {
      return {
        message: 'Danh mục không tồn tại',
        data: null,
        errorCode: 'CATEGORY_NOT_FOUND',
      };
    }

    // Bước 2: Xoá tất cả sản phẩm thuộc danh mục này
    await this.productRepository.deleteByCategoryCode(code);

    // Bước 3: Gọi repository để xoá danh mục theo code
    await this.productCategoryRepository.deleteByCode(code);

    // Bước 4: Trả về kết quả
    return {
      message: 'Xoá danh mục và sản phẩm liên quan thành công',
      data: null,
      errorCode: null,
    };
  }

  // --- [Lấy danh sách danh mục cho admin] ---
  async getListForAdmin(sortBy?: string) {
    // Bước 1: Xác định tiêu chí sắp xếp
    const sortOption = buildSortOption(sortBy);

    // Bước 2: Gọi repository để lấy toàn bộ danh mục, không lọc isActive
    const categories = await this.productCategoryRepository.findAll(sortOption);

    // Bước 3: Trả về kết quả
    return {
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
      errorCode: null,
    };
  }

  // --- [Lấy danh sách châu lục theo type] ---
  async getContinentsByType(type: string, sortBy?: string) {
    // Bước 1: Xác định tiêu chí sắp xếp
    const sortOption = buildSortOption(sortBy);

    // Bước 2: Lấy danh sách danh mục theo type và isActive = true
    const categories = await this.productCategoryRepository.findByType(type, sortOption);

    // Bước 3: Lấy danh sách châu lục duy nhất
    const continentMap = new Map<string, { vi: string; en: string }>();

    categories.forEach(cat => {
      cat.continent.forEach(c => {
        const key = `${c.vi}-${c.en}`;
        if (!continentMap.has(key)) {
          continentMap.set(key, c);
        }
      });
    });

    const continents = Array.from(continentMap.values());

    // Bước 4: Trả về kết quả
    return {
      message: 'Lấy danh sách châu lục thành công',
      data: continents,
      errorCode: null,
    };
  }

  // // --- [Lấy danh sách quốc gia theo châu lục và type] ---
  // async getCountriesByTypeAndContinent(type: string, continent: string, sortBy?: string) {
  //   // Bước 1: Xác định tiêu chí sắp xếp
  //   const sortOption = buildSortOption(sortBy);

  //   // Bước 2: Lấy danh mục theo type và isActive = true
  //   const categories = await this.productCategoryRepository.findByType(type, sortOption);

  //   // Bước 3: Lọc quốc gia theo continent truyền vào
  //   const countryMap = new Map<string, { vi: string; en: string }>();

  //   categories.forEach(cat => {
  //     const hasContinent = cat.continent.some(c => c.vi === continent || c.en === continent);
  //     if (hasContinent) {
  //       cat.country.forEach(c => {
  //         const key = `${c.vi}-${c.en}`;
  //         if (!countryMap.has(key)) {
  //           countryMap.set(key, c);
  //         }
  //       });
  //     }
  //   });

  //   const countries = Array.from(countryMap.values());

  //   // Bước 4: Trả về kết quả
  //   return {
  //     message: 'Lấy danh sách quốc gia thành công',
  //     data: countries,
  //     errorCode: null,
  //   };
  // }

  // --- [Lấy danh sách quốc gia theo châu lục và type] ---
  async getCountriesByTypeAndContinent(type: string, continent: string, sortBy?: string) {
    // Bước 1: Xác định tiêu chí sắp xếp
    const sortOption = buildSortOption(sortBy);

    // Bước 2: Lấy danh mục theo type và isActive = true
    const categories = await this.productCategoryRepository.findByType(type, sortOption);

    // Bước 3: Chuẩn hóa continent truyền vào
    const continentObj = CONTINENTS[continent as ContinentKey] as ContinentValue;
    if (!continentObj) {
      return {
        message: 'Continent không hợp lệ',
        data: [],
        errorCode: 'INVALID_CONTINENT',
      };
    }

    // Bước 4: Lọc quốc gia theo continent đã chuẩn hóa
    const countryMap = new Map<string, { vi: string; en: string }>();

    categories.forEach(cat => {
      const hasContinent = cat.continent.some(
        c => c.vi === continentObj.vi || c.en === continentObj.en,
      );

      if (hasContinent) {
        cat.country.forEach(c => {
          const key = `${c.vi}-${c.en}`;
          if (!countryMap.has(key)) {
            countryMap.set(key, c);
          }
        });
      }
    });

    const countries = Array.from(countryMap.values());

    // Bước 5: Trả về kết quả
    return {
      message: 'Lấy danh sách quốc gia thành công',
      data: countries,
      errorCode: null,
    };
  }

  // --- [Lấy danh sách danh mục theo quốc gia, châu lục và type] ---\
  async getListByRegion(region: string, continent?: string, type?: string, sortBy?: string) {
    // Bước 1: Xác định tiêu chí sắp xếp
    const sortOption = buildSortOption(sortBy);

    // Bước 2: Lấy toàn bộ danh mục isActive = true
    const categories = await this.productCategoryRepository.findAllActive(sortOption);

    // Bước 3: Lọc theo điều kiện
    const filtered = categories.filter(cat => {
      const matchRegion =
        Array.isArray(cat.country) && cat.country.some(c => c.vi === region || c.en === region);
      const matchContinent = continent
        ? cat.continent.some(c => c.vi === continent || c.en === continent)
        : true;
      const matchType = type ? cat.type === (type as ProductCategoryType) : true;

      return matchRegion && matchContinent && matchType;
    });

    // Bước 4: Trả về kết quả
    return {
      message: 'Lấy danh sách danh mục theo khu vực thành công',
      data: filtered,
      errorCode: null,
    };
  }

  // --- [Lấy chi tiết danh mục theo code] ---
  async getDetail(code: string) {
    const category = await this.productCategoryRepository.findByCode(code);

    if (!category) {
      return {
        message: 'Danh mục không tồn tại',
        data: null,
        errorCode: 'CATEGORY_NOT_FOUND',
      };
    }

    return {
      message: 'Lấy chi tiết danh mục thành công',
      data: category,
      errorCode: null,
    };
  }
}
