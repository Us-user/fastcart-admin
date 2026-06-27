import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  /** Bumped on each show so re-firing the same message re-triggers the snackbar. */
  key: number;
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  key: 0,
};

/** Client-only UI state (TRD §4.1): the single global snackbar queue. */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSnackbar(state, action: PayloadAction<{ message: string; severity?: SnackbarSeverity }>) {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity ?? 'info';
      state.key += 1;
    },
    hideSnackbar(state) {
      state.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

type UiSlicePart = { ui: SnackbarState };
export const selectSnackbar = (state: UiSlicePart) => state.ui;
