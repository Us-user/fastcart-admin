import { useState } from 'react';
import { Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';

/**
 * Authenticated app shell (TRD §4): top bar + dark navy sidebar + content
 * surface. The sidebar is a permanent rail on md+ and an MUI Drawer on small
 * screens (TRD §11).
 */
export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-950">
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      <div className="flex flex-1">
        <aside className="sticky top-[70px] hidden h-[calc(100vh-70px)] w-64 shrink-0 overflow-y-auto bg-[#16243b] md:block">
          <SidebarNav />
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
          <Outlet />
        </main>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: { sx: { width: 256, backgroundColor: '#16243b', backgroundImage: 'none' } },
        }}
      >
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </div>
  );
}
