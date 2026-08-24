import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"])
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

  @IsOptional()
  @IsIn(["pending", "paid", "failed", "refunded"])
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}
