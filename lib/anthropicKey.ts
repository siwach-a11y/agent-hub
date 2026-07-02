// Client-side store for a visitor's own Anthropic API key.
//
// The key lives ONLY in the visitor's browser (localStorage) and is sent
// directly to api.anthropic.com from their browser. It is never uploaded to
// this site, committed, or stored on any server.

const STORAGE_KEY = "anthropic_api_key";
const CHANGE_EVENT = "anthropic-key-change";

/** Thrown when an AI action is attempted with no key configured. */
export const MISSING_KEY_ERROR = "MissingAnthropicKey";

export function getStoredKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredKey(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, key.trim());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearStoredKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function hasStoredKey(): boolean {
  return Boolean(getStoredKey());
}

/** Subscribe to key add/remove changes (same-tab custom event + cross-tab storage). */
export function onKeyChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
