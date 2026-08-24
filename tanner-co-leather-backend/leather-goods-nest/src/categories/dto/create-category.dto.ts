import { IsOptional, IsString, IsUUID, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase, numbers, and hyphens only" })
  slug: string;

  @IsOptional()
  @IsString()
  blurb?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
