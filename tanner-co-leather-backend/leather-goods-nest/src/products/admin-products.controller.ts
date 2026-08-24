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
} from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { ProductsService } from "./products.service";
import { CreateProductDto, VariantInputDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AddImageDto } from "./dto/add-image.dto";

@Controller("admin/products")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query("search") search?: string) {
    return { products: await this.productsService.adminFindAll(search) };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return { product: await this.productsService.adminFindOne(id) };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return { product: await this.productsService.create(dto) };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return { product: await this.productsService.update(id, dto) };
  }

  @Delete(":id")
  archive(@Param("id") id: string) {
    return this.productsService.archive(id);
  }

  @Post(":id/images")
  async addImage(@Param("id") id: string, @Body() dto: AddImageDto) {
    return { image: await this.productsService.addImage(id, dto) };
  }

  @Delete(":id/images/:imageId")
  removeImage(@Param("imageId") imageId: string) {
    return this.productsService.removeImage(imageId);
  }

  @Post(":id/variants")
  async addVariant(@Param("id") id: string, @Body() dto: VariantInputDto) {
    return { variant: await this.productsService.addVariant(id, dto) };
  }
}
