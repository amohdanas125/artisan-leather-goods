import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

/**
 * Backblaze B2 exposes an S3-compatible API. Presigned-URL generation is a
 * local signing operation (no network round trip), so this uses the AWS S3
 * SDK rather than wretch — wretch is reserved for actual outbound HTTP
 * calls (Resend, Razorpay). The signed URL it returns is what the client
 * then PUTs the file to directly.
 */
@Injectable()
export class UploadService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrlBase: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>("B2_BUCKET_NAME")!;
    this.publicUrlBase = this.config.get<string>("B2_PUBLIC_URL_BASE")!;
    this.client = new S3Client({
      region: this.config.get<string>("B2_REGION") ?? "us-east-005",
      endpoint: this.config.get<string>("B2_ENDPOINT"),
      credentials: {
        accessKeyId: this.config.get<string>("B2_APPLICATION_KEY_ID")!,
        secretAccessKey: this.config.get<string>("B2_APPLICATION_KEY")!,
      },
    });
  }

  async getPresignedUploadUrl(opts: {
    folder: "products" | "avatars" | "categories";
    fileName: string;
    contentType: string;
  }) {
    const ext = opts.fileName.split(".").pop();
    const key = `${opts.folder}/${nanoid(12)}${ext ? `.${ext}` : ""}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: opts.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
    const publicUrl = `${this.publicUrlBase}/${key}`;

    return { uploadUrl, publicUrl, key };
  }

  async deleteObject(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
