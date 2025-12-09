import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BrandHeader } from './BrandHeader';
import { DashboardTicker } from './DashboardTicker';
import { BottomNav } from './BottomNav';
import { NavigationDrawer } from './NavigationDrawer';

interface GlobalShellProps {
  children: ReactNode;
}

export function GlobalShell({ children }: GlobalShellProps) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const showTicker =
    location.pathname === '/' || location.pathname === '/personal';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <BrandHeader onMenuClick={() => setNavOpen(true)} />

      {showTicker && <DashboardTicker />}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-20 pt-6">
        {children}
      </main>

      <BottomNav />

      <NavigationDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </div>
  );
}
