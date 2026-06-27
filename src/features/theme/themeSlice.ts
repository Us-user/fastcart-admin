import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'fastcart_theme';

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = { mode: getInitialMode() };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      localStorage.setItem(THEME_KEY, action.payload);
    },
    toggleThemeMode(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, state.mode);
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;

type ThemeSlicePart = { theme: ThemeState };
export const selectThemeMode = (state: ThemeSlicePart) => state.theme.mode;
