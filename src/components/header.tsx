'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Chiudi menu con ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Blocca scroll pagina quando menu è aperto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Sessione Supabase (client)
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

  const isActive = (href: string) => pathname === href;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header className={`nav ${open ? 'openNav' : ''}`} id="navbar-container">
      <div className="navName">
        <button
          type="button"
          className="navOpenBtn"
          aria-label="Apri menu"
          aria-controls="nav-links"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div className="container-name" onClick={() => setOpen(false)}>
          <Link href="/" className="name">
            <img className="title" src="/images/logo2.png" alt="RumantschVivo" />
          </Link>
        </div>

        <ul className="nav-links" id="nav-links">
          <button
            type="button"
            className="navCloseBtn"
            aria-label="Chiudi menu"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">✕</span>
          </button>

          <li>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={isActive('/') ? 'active' : ''}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              <strong>HOME</strong>
            </Link>
          </li>

          <li>
            <Link
              href="/learn"
              onClick={() => setOpen(false)}
              className={isActive('/learn') ? 'active' : ''}
              aria-current={isActive('/learn') ? 'page' : undefined}
            >
              IMPARA
            </Link>
          </li>

          <li>
            <Link
              href="/wip"
              onClick={() => setOpen(false)}
              className={isActive('/wip') ? 'active' : ''}
              aria-current={isActive('/wip') ? 'page' : undefined}
            >
              VOCABOLARIO
            </Link>
          </li>

          <li>
            <Link
              href="/wip"
              onClick={() => setOpen(false)}
              className={isActive('/wip') ? 'active' : ''}
              aria-current={isActive('/wip') ? 'page' : undefined}
            >
              STORIE
            </Link>
          </li>
        </ul>
      </div>

      <div className="button-container">
        {session ? (
          <>
            <Link href="/account" className="top-right-button" onClick={() => setOpen(false)}>
              Account
            </Link>

            <button type="button" className="top-right-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="top-right-button" onClick={() => setOpen(false)}>
            Login / Sign Up
          </Link>
        )}
      </div>

      {open && <div className="nav-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}
    </header>
  );
}