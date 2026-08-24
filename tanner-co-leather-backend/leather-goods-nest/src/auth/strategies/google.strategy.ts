import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") || "google-oauth-not-configured",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") || "google-oauth-not-configured",
      callbackURL: config.get<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    const { name, emails, photos } = profile;
    done(null, {
      email: emails?.[0]?.value,
      name: `${name?.givenName ?? ""} ${name?.familyName ?? ""}`.trim(),
      picture: photos?.[0]?.value,
    });
  }
}
