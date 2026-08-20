type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Params[];
  }
}

const KEY = "terracotta.events.v1";

export type TrackedEvent = { event: string; params: Params; ts: number };

/**
 * Lightweight conversion tracking. Pushes to window.dataLayer (picked up by
 * GTM / GA4 / Meta pixel when a tag manager is installed) and keeps a local
 * ring buffer so events are inspectable without a third-party script.
 */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const payload: TrackedEvent = { event, params, ts: Date.now() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: TrackedEvent[] = raw ? JSON.parse(raw) : [];
    list.push(payload);
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-100)));
  } catch {
    /* storage unavailable */
  }
  if (import.meta.env.DEV) console.info("[track]", event, params);
}

export function readEvents(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
