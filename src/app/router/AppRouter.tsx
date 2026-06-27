import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ScaffoldReady } from '@/pages/ScaffoldReady';

/**
 * Phase 0 router. Real routes (auth, guards, app shell) arrive in Phase 1;
 * for now a single page proves the full stack is wired end-to-end.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScaffoldReady />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
