import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { AdminCustomersService } from "./admin-customers.service";
import { SetBlockedDto } from "./dto/set-blocked.dto";
import { SetRoleDto } from "./dto/set-role.dto";

@Controller("admin/customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  async findAll(
    @Query("search") search?: string,
    @Query("role") role?: string,
  ) {
    return { customers: await this.customersService.findAll(search, role) };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(":id/block")
  async setBlocked(@Param("id") id: string, @Body() dto: SetBlockedDto) {
    return { customer: await this.customersService.setBlocked(id, dto.isBlocked) };
  }

  @Patch(":id/role")
  async setRole(@Param("id") id: string, @Body() dto: SetRoleDto) {
    return { customer: await this.customersService.setRole(id, dto.role) };
  }

  @Delete(":id")
  deleteCustomer(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.customersService.deleteCustomer(id, user.id);
  }
}
