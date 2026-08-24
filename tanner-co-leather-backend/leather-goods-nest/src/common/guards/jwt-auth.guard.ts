import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Requires a valid Bearer JWT. Throws 401 if missing/invalid. */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
