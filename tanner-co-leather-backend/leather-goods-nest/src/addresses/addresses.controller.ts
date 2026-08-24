import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { AddressesService } from "./addresses.service";
import { AddressDto, UpdateAddressDto } from "./dto/address.dto";

@Controller("account/addresses")
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.addressesService.list(user.id).then((addresses) => ({ addresses }));
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: AddressDto) {
    return this.addressesService.create(user.id, dto).then((address) => ({ address }));
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateAddressDto
  ) {
    return this.addressesService.update(user.id, id, dto).then((address) => ({ address }));
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.addressesService.remove(user.id, id);
  }
}
