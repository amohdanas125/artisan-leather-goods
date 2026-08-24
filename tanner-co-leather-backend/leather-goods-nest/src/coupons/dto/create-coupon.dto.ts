import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @IsIn(["percent", "flat"])
  discountType: "percent" | "flat";

  @Type(() => Number)
  @IsPositive()
  discountValue: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto extends CreateCouponDto {}
