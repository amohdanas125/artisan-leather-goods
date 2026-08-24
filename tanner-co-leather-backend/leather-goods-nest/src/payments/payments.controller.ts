import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { PaymentsService } from "./payments.service";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("config")
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @Post("verify")
  @UseGuards(JwtAuthGuard)
  verifyPayment(@CurrentUser() user: AuthUser, @Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(user.id, dto);
  }
}
