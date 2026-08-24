import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { HttpClientModule } from "./common/http/http-client.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AddressesModule } from "./addresses/addresses.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { CartModule } from "./cart/cart.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { CouponsModule } from "./coupons/coupons.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { OrdersModule } from "./orders/orders.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UploadModule } from "./upload/upload.module";
import { AdminCustomersModule } from "./admin/customers/admin-customers.module";
import { AdminDashboardModule } from "./admin/dashboard/admin-dashboard.module";
import { MailModule } from "./mail/mail.module";
import { PaymentsModule } from "./payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HttpClientModule,
    MailModule,
    PaymentsModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    CheckoutModule,
    OrdersModule,
    ReviewsModule,
    UploadModule,
    AdminCustomersModule,
    AdminDashboardModule,
  ],
})
export class AppModule {}
