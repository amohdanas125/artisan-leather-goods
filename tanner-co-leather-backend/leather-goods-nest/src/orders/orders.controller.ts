import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return { orders: await this.ordersService.findAllForUser(user.id) };
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return { order: await this.ordersService.findOne(id, user) };
  }
}
