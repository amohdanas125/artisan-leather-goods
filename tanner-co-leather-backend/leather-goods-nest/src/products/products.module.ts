import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { AdminProductsController } from "./admin-products.controller";
import { ProductsService } from "./products.service";
import { UploadModule } from "@/upload/upload.module";

@Module({
  imports: [UploadModule],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
