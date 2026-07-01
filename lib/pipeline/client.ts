// Typed browser client for the operator pipeline API (Fando admin-api pattern):
// attaches the operator key, parses JSON errors into thrown Error messages.
import { DiscoveredOffer, PipelineStatus } from "./types";

const KEY_STORAGE = "operator_key";

export function getOperatorKey(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(KEY_STORAGE) ?? "";
}
export function setOperatorKey(key: string): void {
  window.sessionStorage.setItem(KEY_STORAGE, key.trim());
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-operator-key": getOperatorKey(),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const msg =
      (data as { error?: string })?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export interface QueueResponse {
  offers: DiscoveredOffer[];
  counts: Record<string, number>;
  total: number;
}

export function fetchQueue(status?: PipelineStatus): Promise<QueueResponse> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return api<QueueResponse>(`/api/queue${q}`);
}

export interface RunDiscoveryResponse {
  discovered: number;
  added: number;
  skipped: number;
  offers: DiscoveredOffer[];
}

export function runDiscovery(body: {
  rewardType: string;
  category: string;
  country: string;
}): Promise<RunDiscoveryResponse> {
  return api<RunDiscoveryResponse>("/api/discovery/run", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function actOnOffer(
  id: string,
  action: "approve" | "reject" | "publish"
): Promise<{ offer: DiscoveredOffer }> {
  return api<{ offer: DiscoveredOffer }>("/api/queue/action", {
    method: "POST",
    body: JSON.stringify({ id, action }),
  });
}
