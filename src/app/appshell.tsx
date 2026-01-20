'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Drawer from '@/components/drawer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // chiudi drawer quando cambi pagina
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // blocca scroll quando aperto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <Header drawerOpen={drawerOpen} onToggleDrawer={() => setDrawerOpen((v) => !v)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {children}
    </>
  );
}
