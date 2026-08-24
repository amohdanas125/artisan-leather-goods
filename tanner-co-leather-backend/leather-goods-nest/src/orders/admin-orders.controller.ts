import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@Controller("admin/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Query("status") status?: string) {
    return { orders: await this.ordersService.findAllAdmin(status) };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return { order: await this.ordersService.findOneAdmin(id) };
  }

  @Patch(":id")
  async updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return { order: await this.ordersService.updateStatus(id, dto) };
  }
}
