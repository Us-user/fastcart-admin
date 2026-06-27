import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/shared/api/baseApi';
import { storeRef } from '@/shared/api/storeRef';
import { authReducer } from '@/features/auth/authSlice';
import { themeReducer } from '@/features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Expose the store to the non-React API layer (token refresh) without import cycles.
storeRef.store = store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
