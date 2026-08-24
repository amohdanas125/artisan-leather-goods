import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { WishlistService } from "./wishlist.service";
import { AddWishlistDto } from "./dto/add-wishlist.dto";

@Controller("wishlist")
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return { wishlist: await this.wishlistService.list(user.id) };
  }

  @Post()
  async add(@CurrentUser() user: AuthUser, @Body() dto: AddWishlistDto) {
    return { item: await this.wishlistService.add(user.id, dto.productId) };
  }

  @Delete(":productId")
  remove(@CurrentUser() user: AuthUser, @Param("productId") productId: string) {
    return this.wishlistService.remove(user.id, productId);
  }
}
