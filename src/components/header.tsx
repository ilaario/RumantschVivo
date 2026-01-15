'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function Header({
  drawerOpen,
  onToggleDrawer,
}: {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      router.push('/');
      router.refresh();
    }
  }

  return (
    <header className={`nav ${drawerOpen ? 'nav--drawerOpen' : ''}`} id="navbar-container">
      <div className="navLeft">
        {/* Hamburger: visibile < 1200 */}
        <button
          type="button"
          className={`navOpenBtn ${drawerOpen ? 'is-open' : ''}`}
          aria-label={drawerOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={drawerOpen}
          aria-controls="app-drawer"
          onClick={onToggleDrawer}
        >
          <span className="navIcon" aria-hidden="true" />
        </button>

        <div className="container-name">
          <Link href="/" className="name">
            <img className="title" src="/images/logo2.png" alt="RumantschVivo" />
          </Link>
        </div>
      </div>

      {/* MENU DESKTOP: visibile >= 1200 */}
      <nav className="nav-menu" aria-label="Menu principale">
        <Link href="/" className={isActive('/') ? 'active' : ''} aria-current={isActive('/') ? 'page' : undefined}>
          HOME
        </Link>
        <Link
          href="/learn"
          className={isActive('/learn') ? 'active' : ''}
          aria-current={isActive('/learn') ? 'page' : undefined}
        >
          IMPARA
        </Link>
        <Link href="/wip" className={isActive('/wip') ? 'active' : ''} aria-current={isActive('/wip') ? 'page' : undefined}>
          VOCABOLARIO
        </Link>
        <Link href="/wip" className={isActive('/wip') ? 'active' : ''} aria-current={isActive('/wip') ? 'page' : undefined}>
          STORIE
        </Link>
      </nav>

      {/* BOTTONI DESTRA: visibili >= 900 */}
      <div className="button-container">
        {session ? (
          <>
            <Link href="/account" className="top-right-button">
              Account
            </Link>
            <button type="button" className="top-right-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="top-right-button">
            Login / Sign Up
          </Link>
        )}
      </div>
    </header>
  );
}