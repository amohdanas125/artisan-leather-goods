import { IsIn, IsString, Matches } from "class-validator";

export class PresignUploadDto {
  @IsIn(["products", "avatars", "categories"])
  folder: "products" | "avatars" | "categories";

  @IsString()
  fileName: string;

  @Matches(/^image\//, { message: "Only image uploads are allowed" })
  contentType: string;
}
