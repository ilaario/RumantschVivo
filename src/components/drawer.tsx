'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { withLocale } from '@/lib/i18n/path';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';

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

  const t = useI18n();

  // locale dall'URL tipo /it/qualcosa
  const segments = pathname.split('/');
  const locale = segments[1] || 'it';

  const hrefWithLocale = (path: string) => withLocale(locale, path);

  const isActive = (path: string) => pathname === hrefWithLocale(path);

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
      // torna alla home localizzata
      router.push(hrefWithLocale('/'));
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

        {/* Home locale */}
          <Link
            href={hrefWithLocale('/')}
            className="drawer-brand"
            onClick={onClose}
            aria-label="Home"
          >
            <img src="/images/logo2.png" alt="RumantschVivo" />
          </Link>
        </div>

        <nav className="drawer-nav" aria-label="Link menu">
          <Link
            href={hrefWithLocale('/')}
            onClick={onClose}
            className={isActive('/') ? 'active' : ''}
          >
            {t.nav.home}
          </Link>

          <Link
            href={hrefWithLocale('/learn')}
            onClick={onClose}
            className={isActive('/learn') ? 'active' : ''}
          >
            {t.nav.learn}
          </Link>

          <Link
            href={hrefWithLocale('/vocabulary')}
            onClick={onClose}
            className={isActive('/vocabulary') ? 'active' : ''}
          >
            {t.nav.vocab}
          </Link>

          <Link
            href={hrefWithLocale('/stories')}
            onClick={onClose}
            className={isActive('/stories') ? 'active' : ''}
          >
            {t.nav.stories}
          </Link>
        </nav>

        <div className="drawer-actions">
          {session ? (
            <>
              <Link
                href={hrefWithLocale('/account')}
                className="drawer-btn drawer-btn--secondary"
                onClick={onClose}
              >
                {t.nav.account}
              </Link>
              <button
                type="button"
                className="drawer-btn drawer-btn--danger"
                onClick={handleLogout}
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link
              href={hrefWithLocale('/login')}
              className="drawer-btn drawer-btn--primary"
              onClick={onClose}
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}