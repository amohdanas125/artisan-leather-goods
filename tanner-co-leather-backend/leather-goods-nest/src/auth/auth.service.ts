import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { users, passwordResetTokens } from "@/database/schema";
import { RegisterDto } from "./dto/register.dto";
import { MailService } from "@/mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing) throw new ConflictException("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await this.db
      .insert(users)
      .values({ name: dto.name, email, passwordHash, phone: dto.phone })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    return { user, ...this.issueToken(user) };
  }

  async validateUser(email: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.passwordHash) return null;
    if (user.isBlocked) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException("Invalid email or password");

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...this.issueToken(user),
    };
  }

  /** Called from the Google OAuth callback route with the verified profile. */
  async loginWithGoogle(profile: { email: string; name: string; picture?: string }) {
    let [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, profile.email.toLowerCase()))
      .limit(1);

    if (!user) {
      [user] = await this.db
        .insert(users)
        .values({
          name: profile.name || profile.email,
          email: profile.email.toLowerCase(),
          image: profile.picture,
        })
        .returning();
    }

    if (user.isBlocked) throw new UnauthorizedException("This account has been blocked.");

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...this.issueToken(user),
    };
  }

  async forgotPassword(email: string) {
    const [user] = await this.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always respond the same way whether or not the email exists, so we
    // don't leak which addresses are registered.
    if (!user) {
      return { message: "If an account exists for that email, a reset link has been sent." };
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await this.db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

    const resetUrl = `${this.config.get("FRONTEND_URL")}/reset-password?token=${token}`;
    await this.mail.sendPasswordResetEmail(email, user.name, resetUrl);

    return { message: "If an account exists for that email, a reset link has been sent." };
  }

  async resetPassword(token: string, password: string) {
    const [record] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!record) throw new UnauthorizedException("This reset link is invalid or has expired.");

    const passwordHash = await bcrypt.hash(password, 10);
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));

    return { message: "Password updated. You can now log in." };
  }

  private issueToken(user: { id: string; email: string; name: string; role: string }) {
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return { accessToken: this.jwt.sign(payload) };
  }
}
