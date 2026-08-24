import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
/** Usage: @Roles('admin') on top of a controller or route, paired with RolesGuard. */
export const Roles = (...roles: Array<"admin" | "customer">) =>
  SetMetadata(ROLES_KEY, roles);
