import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { ReviewsService } from "./reviews.service";
import { ModerateReviewDto } from "./dto/moderate-review.dto";

@Controller("admin/reviews")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(@Query("status") status?: "pending" | "approved") {
    return { reviews: await this.reviewsService.findAllAdmin(status) };
  }

  @Patch(":id")
  async moderate(@Param("id") id: string, @Body() dto: ModerateReviewDto) {
    return { review: await this.reviewsService.moderate(id, dto.isApproved) };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.reviewsService.remove(id);
  }
}
