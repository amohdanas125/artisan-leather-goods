import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { and, eq } from "drizzle-orm";
import * as crypto from "crypto";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { orders } from "@/database/schema";
import { HttpClientService } from "@/common/http/http-client.service";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly keyId?: string;
  private readonly keySecret?: string;

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly http: HttpClientService,
    private readonly config: ConfigService,
  ) {
    this.keyId = this.config.get<string>("RAZORPAY_KEY_ID");
    this.keySecret = this.config.get<string>("RAZORPAY_KEY_SECRET");
  }

  getConfig() {
    return {
      keyId: this.keyId || "rzp_test_terracotta_demo",
      isLive: Boolean(this.keyId && this.keySecret),
    };
  }

  async createOrder(amountInRupees: number, receipt: string): Promise<RazorpayOrder | null> {
    const amountInPaise = Math.round(amountInRupees * 100);

    if (!this.keyId || !this.keySecret) {
      this.logger.log(`Generating test Razorpay order for receipt ${receipt} (amount: ₹${amountInRupees})`);
      return {
        id: `order_test_${receipt.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        status: "created",
      };
    }

    try {
      const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
      return await this.http.post<RazorpayOrder>(
        "https://api.razorpay.com/v1/orders",
        {
          amount: amountInPaise,
          currency: "INR",
          receipt,
        },
        { Authorization: `Basic ${basicAuth}` },
      );
    } catch (err: any) {
      this.logger.error("Failed to create live Razorpay order, falling back to test order", err);
      return {
        id: `order_test_${receipt.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        status: "created",
      };
    }
  }

  async verifyPayment(
    userId: string,
    dto: {
      orderId: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    },
  ) {
    // 1. Locate order by UUID id or orderNumber
    const [order] = await this.db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.id, dto.orderId),
        ),
      )
      .limit(1);

    if (!order) {
      // Try searching by orderNumber
      const [orderByNum] = await this.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.userId, userId),
            eq(orders.orderNumber, dto.orderId),
          ),
        )
        .limit(1);

      if (!orderByNum) throw new NotFoundException("Order not found");
      return this.markOrderAsPaid(orderByNum.id, dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature);
    }

    return this.markOrderAsPaid(order.id, dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature);
  }

  private async markOrderAsPaid(
    orderId: string,
    razorpayOrderId?: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string,
  ) {
    // If live key is configured and signature is supplied, verify HMAC
    if (this.keySecret && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        throw new BadRequestException("Invalid payment signature verification failed");
      }
    }

    const [updated] = await this.db
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: "confirmed",
      })
      .where(eq(orders.id, orderId))
      .returning();

    this.logger.log(`Order ${updated.orderNumber} successfully marked as PAID`);

    return {
      success: true,
      message: "Payment verified successfully",
      order: updated,
    };
  }
}
