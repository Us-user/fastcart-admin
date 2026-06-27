import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

type RtkError = FetchBaseQueryError | SerializedError;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Best-effort extraction of a human-readable message from an RTK Query / axios
 * error, handling string bodies, `{ message | title | error }`, and ASP.NET
 * validation payloads (`{ errors: { field: [msg] } }`). Falls back to `fallback`
 * (a translated generic message) so the UI never shows a raw error object.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isObject(error)) {
    return fallback;
  }

  // RTK Query FetchBaseQueryError carries the body on `data`.
  const maybeFbqe = error as RtkError & { data?: unknown };
  const data = maybeFbqe.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (isObject(data)) {
    if (typeof data.message === 'string') return data.message;
    if (typeof data.title === 'string') return data.title;
    if (typeof data.error === 'string') return data.error;
    if (isObject(data.errors)) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && typeof first[0] === 'string') {
        return first[0];
      }
    }
  }

  if (typeof (error as SerializedError).message === 'string') {
    return (error as SerializedError).message as string;
  }

  return fallback;
}
