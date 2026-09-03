import { Module } from "@nestjs/common";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";
import { PaymentsModule } from "@/payments/payments.module";
import { MailModule } from "@/mail/mail.module";
import { CartModule } from "@/cart/cart.module";

@Module({
  imports: [PaymentsModule, MailModule, CartModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
