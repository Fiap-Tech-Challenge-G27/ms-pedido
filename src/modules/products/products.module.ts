import { Category } from "@categories/infra/typeorm/entities/category";
import { Module, Provider } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "@products/infra/typeorm/entities/product";
import { ProductImage } from "@products/infra/typeorm/entities/productImage";
import { ProductRepository } from "@products/infra/typeorm/repositories/product.repository";
import { ExceptionsService } from "@shared/infra/exceptions/exceptions.service";
import { IExceptionService } from "../../shared/exceptions/exceptions.interface";
import { IProductRepository } from "./core/product-repository.abstract";

const basicProductsModuleMetadata = {
  providers: [
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
    {
      provide: IExceptionService,
      useClass: ExceptionsService,
    },
  ] as Array<Provider>,
};

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Category])],
  ...basicProductsModuleMetadata,
})
class ProductsModule {}

export { ProductsModule, basicProductsModuleMetadata };
