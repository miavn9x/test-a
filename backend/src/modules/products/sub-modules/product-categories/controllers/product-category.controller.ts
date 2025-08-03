// --- [Imports] ---
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
import { CreateProductCategoryDto } from '../dtos/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dtos/update-product-category.dto';
import { ProductCategoryService } from '../services/product-category.service';

// --- ProductCategoryController ---
@Controller('product-categories')
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  // --- [Admin API: Tạo danh mục] ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createProductCategory(@Body() dto: CreateProductCategoryDto) {
    return this.productCategoryService.create(dto);
  }

  // --- [Admin API: Cập nhật danh mục] ---
  @Patch(':code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProductCategory(@Param('code') code: string, @Body() dto: UpdateProductCategoryDto) {
    return this.productCategoryService.update(code, dto);
  }

  // --- [Admin API: Xoá danh mục] ---
  @Delete(':code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategory(@Param('code') code: string) {
    return this.productCategoryService.delete(code);
  }

  // --- [Admin API: Lấy danh sách danh mục] ---
  @Get('/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getListForAdmin(@Query('sortBy') sortBy?: string) {
    return this.productCategoryService.getListForAdmin(sortBy);
  }

  // --- [Public API: Lấy danh sách châu lục theo type] ---
  @Get('/continents')
  async getContinentsByType(@Query('type') type: string, @Query('sortBy') sortBy?: string) {
    return this.productCategoryService.getContinentsByType(type, sortBy);
  }

  // --- [Public API: Lấy danh sách quốc gia theo châu lục và type] ---
  @Get('/countries')
  async getCountriesByTypeAndContinent(
    @Query('type') type: string,
    @Query('continent') continent: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.productCategoryService.getCountriesByTypeAndContinent(type, continent, sortBy);
  }

  // --- [Public API: Lấy danh sách danh mục theo quốc gia, châu lục và type] ---
  @Get('/by-region')
  async getListByRegion(
    @Query('region') region: string,
    @Query('continent') continent?: string,
    @Query('type') type?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.productCategoryService.getListByRegion(region, continent, type, sortBy);
  }

  // --- [Public API: Lấy chi tiết danh mục] ---
  @Get(':code')
  async getCategoryDetail(@Param('code') code: string) {
    return this.productCategoryService.getDetail(code);
  }
}
