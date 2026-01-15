'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function Drawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  const isActive = (href: string) => pathname === href;

  // chiudi con ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // session
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      onClose();
      router.push('/');
      router.refresh();
    }
  }

  return (
    <>
      {/* Overlay grigio dietro */}
      <div
        className={`drawer-overlay ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer pill */}
      <aside
        id="app-drawer"
        className={`drawer ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
        aria-label="Menu"
      >
        <div className="drawer-top">
          <button
            type="button"
            className="drawer-toggle"
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            onClick={onClose}
          >
            <span className="drawer-icon" aria-hidden="true" />
          </button>

          <Link href="/" className="drawer-brand" onClick={onClose} aria-label="Home">
            <img src="/images/logo2.png" alt="RumantschVivo" />
          </Link>
        </div>

        <nav className="drawer-nav" aria-label="Link menu">
          <Link href="/" onClick={onClose} className={isActive('/') ? 'active' : ''}>
            HOME
          </Link>
          <Link href="/learn" onClick={onClose} className={isActive('/learn') ? 'active' : ''}>
            IMPARA
          </Link>
          <Link href="/wip" onClick={onClose} className={isActive('/wip') ? 'active' : ''}>
            VOCABOLARIO
          </Link>
          <Link href="/wip" onClick={onClose} className={isActive('/wip') ? 'active' : ''}>
            STORIE
          </Link>
        </nav>

        <div className="drawer-actions">
          {session ? (
            <>
              <Link href="/account" className="drawer-btn drawer-btn--secondary" onClick={onClose}>
                Account
              </Link>
              <button type="button" className="drawer-btn drawer-btn--danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="drawer-btn drawer-btn--primary" onClick={onClose}>
              Login / Sign Up
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}