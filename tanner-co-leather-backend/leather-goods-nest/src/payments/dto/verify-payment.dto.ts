import { IsOptional, IsString } from "class-validator";

export class VerifyPaymentDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}
