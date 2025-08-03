import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationParams } from 'src/common/dtos/pagination-params.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { JwtAuthGuard } from 'src/common/jwt/guards/jwt.guard';
import { UserRole } from 'src/modules/users/constants/user-role.enum';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductService } from '../services/product.service';

// --- ProductController ---
@Controller('products')
export class ProductController {
  // --- Constructor ---
  constructor(private readonly productService: ProductService) {}

  // --- Admin API: Tạo sản phẩm ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createProduct(@Body() dto: CreateProductDto): Promise<StandardResponse> {
    return this.productService.createProduct(dto);
  }

  // --- Admin API: Cập nhật sản phẩm ---
  @Patch(':code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateProduct(
    @Param('code') code: string,
    @Body() dto: UpdateProductDto,
  ): Promise<StandardResponse> {
    return this.productService.updateProduct(code, dto);
  }

  // --- Admin API: Xoá sản phẩm ---
  @Delete(':code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  deleteProduct(@Param('code') code: string): Promise<StandardResponse> {
    return this.productService.deleteProduct(code);
  }

  // --- Admin API: Lấy danh sách sản phẩm toàn bộ ---
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  getProductListForAdmin(@Query('sortBy') sortBy?: string): Promise<StandardResponse> {
    return this.productService.getProductListForAdmin(sortBy);
  }

  // --- Admin API: Lấy danh sách sản phẩm theo danh mục ---
  @Get('admin/category/:productCategoryCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  getProductsByCategoryForAdmin(
    @Param('productCategoryCode') productCategoryCode: string,
    @Query() pagination: PaginationParams,
    @Query('sortBy') sortBy?: string,
  ): Promise<StandardResponse> {
    return this.productService.getByCategoryForAdmin(productCategoryCode, pagination, sortBy);
  }

  // --- Public API: Lấy danh sách sản phẩm ---
  @Get()
  @HttpCode(HttpStatus.OK)
  getProductListForUser(
    @Query() pagination: PaginationParams,
    @Query('sortBy') sortBy?: string,
  ): Promise<StandardResponse> {
    return this.productService.getProductListForUser(pagination, sortBy);
  }

  // --- Public API: Lấy danh sách sản phẩm theo danh mục ---
  @Get('category/:productCategoryCode')
  @HttpCode(HttpStatus.OK)
  getProductsByCategory(
    @Param('productCategoryCode') productCategoryCode: string,
    @Query() pagination: PaginationParams,
    @Query('sortBy') sortBy?: string,
  ): Promise<StandardResponse> {
    return this.productService.getByCategory(productCategoryCode, pagination, sortBy);
  }

  // --- Public API: Tìm kiếm sản phẩm theo từ khoá ---
  @Get('search')
  @HttpCode(HttpStatus.OK)
  searchProducts(@Query('q') query: string): Promise<StandardResponse> {
    return this.productService.searchProducts(query);
  }

  // --- Public API: Lấy danh sách sản phẩm theo type của danh mục ---
  @Get('type/:categoryType')
  @HttpCode(HttpStatus.OK)
  getProductsByCategoryType(
    @Param('categoryType') categoryType: string,
    @Query() pagination: PaginationParams,
    @Query('sortBy') sortBy?: string,
  ): Promise<StandardResponse> {
    return this.productService.getByCategoryType(categoryType, pagination, sortBy);
  }

  // --- Public API: Lấy danh sách sản phẩm theo type và châu lục của danh mục ---
  @Get('type/:categoryType/continent/:continent')
  @HttpCode(HttpStatus.OK)
  getProductsByTypeAndContinent(
    @Param('categoryType') categoryType: string,
    @Param('continent') continent: string,
    @Query() pagination: PaginationParams,
    @Query('sortBy') sortBy?: string,
  ): Promise<StandardResponse> {
    return this.productService.getByTypeAndContinent(categoryType, continent, pagination, sortBy);
  }

  // --- Public API: Lấy danh sách sản phẩm theo type, châu lục và quốc gia của danh mục ---
  @Get('type/:categoryType/continent/:continent/country/:country')
  @HttpCode(HttpStatus.OK)
  getProductsByTypeContinentCountry(
    @Param('categoryType') categoryType: string,
    @Param('continent') continent: string,
    @Param('country') country: string,
    @Query() pagination: PaginationParams,
    @Query('sortBy') sortBy?: string,
  ): Promise<StandardResponse> {
    return this.productService.getByTypeContinentCountry(
      categoryType,
      continent,
      country,
      pagination,
      sortBy,
    );
  }

  // --- Public API: Lấy chi tiết sản phẩm ---
  @Get(':code')
  @HttpCode(HttpStatus.OK)
  getProductDetail(@Param('code') code: string): Promise<StandardResponse> {
    return this.productService.getProductDetail(code);
  }
}
