import type { Store } from '@reduxjs/toolkit';

/**
 * Holds a reference to the Redux store so the non-React API layer (token
 * refresh, interceptors) can dispatch without importing the store directly,
 * which would create a circular dependency (store → baseApi → tokenRefresh).
 * Populated once in `app/store.ts` right after the store is created.
 */
export const storeRef: { store: Store | null } = { store: null };
