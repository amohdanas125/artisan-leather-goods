import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "@/common/decorators/current-user.decorator";
import { UploadService } from "./upload.service";
import { PresignUploadDto } from "./dto/presign-upload.dto";

@Controller("upload")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Any signed-in user can request a presigned URL for their own avatar;
   * only admins may request one for the "products"/"categories" folders.
   * The client then does:
   *   fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": contentType } })
   */
  @Post("presign")
  async presign(@Body() dto: PresignUploadDto, @CurrentUser() user: AuthUser) {
    if (dto.folder !== "avatars" && user.role !== "admin") {
      throw new ForbiddenException("Only admins can upload to this folder");
    }
    return this.uploadService.getPresignedUploadUrl(dto);
  }
}

@Controller("media")
export class MediaController {
  constructor(private readonly uploadService: UploadService) {}

  @Get("*")
  async getMedia(@Req() req: any, @Res() res: any) {
    const key = req.params[0] || req.path.replace(/^\/media\/?/, "");
    await this.uploadService.streamMedia(key, res);
  }
}
