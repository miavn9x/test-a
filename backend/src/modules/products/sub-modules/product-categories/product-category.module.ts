// --- [Imports] ---
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductModule } from '../../product.module';
import { ProductCategoryController } from './controllers/product-category.controller';
import { ProductCategoryRepository } from './repositories/product-category.repository';
import { ProductCategory, ProductCategorySchema } from './schemas/product-category.schema';
import { ProductCategoryService } from './services/product-category.service';

// --- [Module Declaration] ---
@Module({
  // --- [Schema Mongoose] ---
  imports: [
    MongooseModule.forFeature([{ name: ProductCategory.name, schema: ProductCategorySchema }]),
    forwardRef(() => ProductModule),
  ],

  // --- [Controllers] ---
  controllers: [ProductCategoryController],

  // --- [Providers] ---
  providers: [ProductCategoryService, ProductCategoryRepository],

  // --- [Exports] ---
  exports: [ProductCategoryService, ProductCategoryRepository],
})
export class ProductCategoryModule {}
