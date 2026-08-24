import { IsIn, IsString } from "class-validator";

export class SetRoleDto {
  @IsString()
  @IsIn(["customer", "admin"])
  role: "customer" | "admin";
}
