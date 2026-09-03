import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { AddressDto } from "@/addresses/dto/address.dto";

export class CheckoutDto {
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  newAddress?: AddressDto;

  @IsIn(["online", "cod"])
  paymentMethod: "online" | "cod";

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsArray()
  items?: Array<{
    productId?: string;
    slug?: string;
    variantId?: string;
    color?: string;
    size?: string;
    quantity: number;
  }>;
}
