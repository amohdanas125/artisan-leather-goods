import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/** Reads the `x-cart-session` header a guest client sends to identify its cart. */
export const CartSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["x-cart-session"];
  }
);
