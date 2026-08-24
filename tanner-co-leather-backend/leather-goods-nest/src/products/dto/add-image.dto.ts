import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class AddImageDto {
  @IsString()
  b2FileKey: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
