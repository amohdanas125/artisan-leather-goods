import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class AddImageDto {
  @IsOptional()
  @IsString()
  b2FileKey?: string;

  @IsString()
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
