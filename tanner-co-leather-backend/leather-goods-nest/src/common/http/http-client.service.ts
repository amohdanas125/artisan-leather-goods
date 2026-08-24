import { HttpException, Injectable, Logger } from "@nestjs/common";
import wretch from "wretch";

/**
 * Thin wrapper around wretch for every outbound call this backend makes
 * to third-party APIs (Razorpay, Resend, etc). Internal data access still
 * goes through Drizzle — this is only for talking to the outside world.
 */
@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  /** Returns a configured wretch instance for cases needing more control
   *  (custom auth schemes, non-JSON bodies, etc.) than the helpers below. */
  client(baseUrl: string, headers: Record<string, string> = {}) {
    return wretch(baseUrl).headers({ "Content-Type": "application/json", ...headers });
  }

  async get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    try {
      return await wretch(url).headers(headers).get().json<T>();
    } catch (err) {
      throw this.toHttpException(err, url);
    }
  }

  async post<T>(
    url: string,
    body: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    try {
      return await wretch(url)
        .headers({ "Content-Type": "application/json", ...headers })
        .post(body)
        .json<T>();
    } catch (err) {
      throw this.toHttpException(err, url);
    }
  }

  async patch<T>(
    url: string,
    body: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    try {
      return await wretch(url)
        .headers({ "Content-Type": "application/json", ...headers })
        .patch(body)
        .json<T>();
    } catch (err) {
      throw this.toHttpException(err, url);
    }
  }

  private toHttpException(err: any, url: string) {
    // wretch rejects with a WretchError exposing `.status`, `.text`, `.json`
    const status = err?.status ?? 502;
    const message =
      err?.json?.error?.description ??
      err?.json?.message ??
      err?.text ??
      err?.message ??
      "Upstream request failed";

    this.logger.warn(`Outbound call to ${url} failed (${status}): ${message}`);
    return new HttpException(message, status >= 400 && status < 600 ? status : 502);
  }
}
