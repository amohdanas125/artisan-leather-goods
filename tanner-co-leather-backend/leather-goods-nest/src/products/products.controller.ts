import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductQueryDto } from "./dto/product-query.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    const product = await this.productsService.findBySlug(slug);
    return { product };
  }
}
