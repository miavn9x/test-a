// --- [Imports] ---
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './repositories/product.repository';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductService } from './services/product.service';
import { ProductCategoryModule } from './sub-modules/product-categories/product-category.module';
import { ProductVariantModule } from './sub-modules/product-variants/product-variant.module';

// --- [Module Definition] ---
@Module({
  // --- [Schema Mongoose] ---
  imports: [
    forwardRef(() => ProductCategoryModule),
    forwardRef(() => ProductVariantModule),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],

  // --- [Controllers] ---
  controllers: [ProductController],

  // --- [Providers] ---
  providers: [ProductService, ProductRepository],

  // --- [Exports] ---
  exports: [ProductRepository, ProductService],
})
export class ProductModule {}
