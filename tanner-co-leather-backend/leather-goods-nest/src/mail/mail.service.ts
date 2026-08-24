import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpClientService } from "@/common/http/http-client.service";

/**
 * Sends transactional email via the Resend API, called through the shared
 * wretch-based HttpClientService rather than Resend's own SDK — keeps every
 * outbound HTTP call in the project going through one consistent client.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey?: string;
  private readonly from: string;

  constructor(
    private readonly http: HttpClientService,
    private readonly config: ConfigService
  ) {
    this.apiKey = this.config.get<string>("RESEND_API_KEY");
    this.from =
      this.config.get<string>("RESEND_FROM_EMAIL") ?? "Tanner & Co. <no-reply@tannerandco.com>";
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const subject = "Reset your Tanner & Co. password";
    const html = `
      <p>Hi ${name || "there"},</p>
      <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;
    return this.send(to, subject, html);
  }

  async sendOrderConfirmationEmail(to: string, orderNumber: string, total: string) {
    const subject = `Your Tanner & Co. order ${orderNumber} is confirmed`;
    const html = `
      <p>Thank you for your order!</p>
      <p>Order <strong>${orderNumber}</strong> — total ₹${total}.</p>
      <p>We'll email you again once it ships.</p>
    `;
    return this.send(to, subject, html);
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.apiKey) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping email send. Would have sent "${subject}" to ${to}.`
      );
      return { skipped: true };
    }

    try {
      return await this.http.post<{ id: string }>(
        "https://api.resend.com/emails",
        { from: this.from, to, subject, html },
        { Authorization: `Bearer ${this.apiKey}` }
      );
    } catch (err) {
      // Don't let a flaky email provider break the request that triggered it
      // (registration, checkout, etc). Log and move on.
      this.logger.error(`Failed to send email to ${to}`, err as Error);
      return { skipped: true, error: true };
    }
  }
}
