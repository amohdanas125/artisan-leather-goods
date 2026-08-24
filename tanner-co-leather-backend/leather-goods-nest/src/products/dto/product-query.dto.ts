import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const toBool = ({ value }: { value: any }) =>
  value === "true" ? true : value === "false" ? false : value;

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug, e.g. "bags"

  @IsOptional()
  @IsString()
  color?: string; // filter by an available color, e.g. "Cognac"

  @IsOptional()
  @IsString()
  size?: string; // filter by an available size, e.g. "UK 9"

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  bestSeller?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsIn(["newest", "price_asc", "price_desc", "rating", "popularity"])
  sort: "newest" | "price_asc" | "price_desc" | "rating" | "popularity" = "newest";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
