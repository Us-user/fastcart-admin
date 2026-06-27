import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/app/layout/AppShell';
import { PublicOnly, RequireAdmin, RequireAuth } from '@/features/auth/guards';
import { InsufficientPermissionsPage } from '@/pages/InsufficientPermissionsPage';
import { OtherPage } from '@/pages/OtherPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ProductsListPage } from '@/pages/ProductsListPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

/**
 * Route guards (TRD §3.3): unauthenticated → /login; authenticated non-admin →
 * /no-access; admin → the full app shell. Auth screens are off-limits once
 * logged in.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth screens */}
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Authenticated */}
        <Route element={<RequireAuth />}>
          <Route path="/no-access" element={<InsufficientPermissionsPage />} />

          {/* Admin-only app shell */}
          <Route element={<RequireAdmin />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<PlaceholderPage titleKey="nav.dashboard" />} />
              <Route path="/orders" element={<PlaceholderPage titleKey="nav.orders" />} />
              <Route path="/products" element={<ProductsListPage />} />
              <Route
                path="/products/new"
                element={<PlaceholderPage titleKey="products.addProduct" />}
              />
              <Route
                path="/products/:id/edit"
                element={<PlaceholderPage titleKey="products.editProduct" />}
              />
              <Route path="/other" element={<OtherPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
