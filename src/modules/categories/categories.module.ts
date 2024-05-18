import { Category } from "@categories/infra/typeorm/entities/category";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IExceptionService } from "@shared/exceptions/exceptions.interface";
import { ExceptionsService } from "@shared/infra/exceptions/exceptions.service";

const basicCategoriesModuleMetadata = {
  providers: [
    {
      provide: IExceptionService,
      useClass: ExceptionsService,
    },
  ],
};

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  ...basicCategoriesModuleMetadata,
})
class CategoriesModule {}

export { CategoriesModule, basicCategoriesModuleMetadata };
