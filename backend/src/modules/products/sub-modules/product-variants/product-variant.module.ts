// --- [Imports] ---
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductRepository } from '../../repositories/product.repository';
import { Product, ProductSchema } from '../../schemas/product.schema';

import { ProductModule } from '../../product.module';
import { ProductVariantController } from './controllers/product-variant.controller';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductVariant, ProductVariantSchema } from './schemas/product-variant.schema';
import { ProductVariantService } from './services/product-variant.service';

// --- [ProductVariantModule] ---
@Module({
  // --- [Schema Mongoose] ---
  imports: [
    MongooseModule.forFeature([
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    forwardRef(() => ProductModule),
  ],

  // --- [Controllers] ---
  controllers: [ProductVariantController],

  // --- [Providers] ---
  providers: [ProductVariantService, ProductVariantRepository, ProductRepository],

  // --- [Exports] ---
  exports: [ProductVariantService, ProductVariantRepository],
})
export class ProductVariantModule {}
