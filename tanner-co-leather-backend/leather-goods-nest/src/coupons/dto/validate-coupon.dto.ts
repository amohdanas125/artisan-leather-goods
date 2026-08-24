import { Type } from "class-transformer";
import { IsPositive, IsString, MinLength } from "class-validator";

export class ValidateCouponDto {
  @IsString()
  @MinLength(3)
  code: string;

  @Type(() => Number)
  @IsPositive()
  subtotal: number;
}
