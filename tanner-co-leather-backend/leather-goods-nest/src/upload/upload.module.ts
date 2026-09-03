import { Module } from "@nestjs/common";
import { UploadController, MediaController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  controllers: [UploadController, MediaController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
