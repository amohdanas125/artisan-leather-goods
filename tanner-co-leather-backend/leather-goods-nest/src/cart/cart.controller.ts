import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { OptionalJwtAuthGuard } from "@/common/guards/optional-jwt-auth.guard";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { CartSession } from "@/common/decorators/cart-session.decorator";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Controller("cart")
@UseGuards(OptionalJwtAuthGuard) // works for both guests and signed-in users
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthUser | null, @CartSession() sessionId?: string) {
    return this.cartService.getCart(user, sessionId);
  }

  @Post()
  async addItem(
    @CurrentUser() user: AuthUser | null,
    @CartSession() sessionId: string | undefined,
    @Body() dto: AddCartItemDto
  ) {
    return { item: await this.cartService.addItem(user, sessionId, dto) };
  }

  @Patch(":itemId")
  async updateItem(@Param("itemId") itemId: string, @Body() dto: UpdateCartItemDto) {
    return { item: await this.cartService.updateItem(itemId, dto.quantity) };
  }

  @Delete(":itemId")
  removeItem(@Param("itemId") itemId: string) {
    return this.cartService.removeItem(itemId);
  }
}
