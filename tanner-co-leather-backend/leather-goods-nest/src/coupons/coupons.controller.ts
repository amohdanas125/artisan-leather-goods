import { Body, Controller, Post } from "@nestjs/common";
import { CouponsService } from "./coupons.service";
import { ValidateCouponDto } from "./dto/validate-coupon.dto";

@Controller("coupons")
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post("validate")
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto.code, dto.subtotal);
  }
}
