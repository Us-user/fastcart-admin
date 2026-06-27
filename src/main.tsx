import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import './index.css';
import '@/app/i18n';
import { store } from '@/app/store';
import { AppThemeProvider } from '@/app/providers/AppThemeProvider';
import { AppRouter } from '@/app/router/AppRouter';
import { GlobalSnackbar } from '@/shared/ui/GlobalSnackbar';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <AppRouter />
        <GlobalSnackbar />
      </AppThemeProvider>
    </Provider>
  </StrictMode>,
);
