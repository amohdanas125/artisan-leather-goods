import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { CouponsService } from "./coupons.service";
import { CreateCouponDto, UpdateCouponDto } from "./dto/create-coupon.dto";

@Controller("admin/coupons")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  async list() {
    return { coupons: await this.couponsService.list() };
  }

  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return { coupon: await this.couponsService.create(dto) };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCouponDto) {
    return { coupon: await this.couponsService.update(id, dto) };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.couponsService.remove(id);
  }
}
