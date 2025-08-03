import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { OrderDocument } from '../schemas/order.schema';

// --- Middleware: Kiểm tra sản phẩm & biến thể ---
export const checkProductAndVariant = async function (
  this: OrderDocument,
  next: (err?: Error) => void,
) {
  try {
    const db = mongoose.connection?.db;
    if (!db) {
      return next(
        new BadRequestException({
          message: 'Không thể kết nối tới database',
          data: null,
          errorCode: 'DB_NOT_CONNECTED',
        } satisfies StandardResponse),
      );
    }

    for (const item of this.products) {
      const product = await db.collection('products').findOne({ code: item.productCode });
      if (!product) {
        return next(
          new BadRequestException({
            message: `Sản phẩm với mã '${item.productCode}' không tồn tại`,
            data: null,
            errorCode: 'PRODUCT_NOT_FOUND',
          } satisfies StandardResponse),
        );
      }

      if (item.variantCode) {
        const variant = await db.collection('product-variants').findOne({ code: item.variantCode });
        if (!variant) {
          return next(
            new BadRequestException({
              message: `Biến thể với mã '${item.variantCode}' không tồn tại`,
              data: null,
              errorCode: 'VARIANT_NOT_FOUND',
            } satisfies StandardResponse),
          );
        }

        if (variant.productCode !== item.productCode) {
          return next(
            new BadRequestException({
              message: `Biến thể '${item.variantCode}' không thuộc sản phẩm '${item.productCode}'`,
              data: null,
              errorCode: 'VARIANT_PRODUCT_MISMATCH',
            } satisfies StandardResponse),
          );
        }
      }
    }

    next();
  } catch (err) {
    next(err as Error);
  }
};
