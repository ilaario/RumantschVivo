'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';

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
  const t = useI18n();

  // ------- LOCALE & PATH -------
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  // "/it" -> basePath = "/"
  // "/it/learn" -> basePath = "/learn"
  const basePath = '/' + (segments.slice(1).join('/') || '');

  const linkHref = (path: string) => `/${currentLocale}${path}`;
  const isActive = (href: string) => pathname === linkHref(href);

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === currentLocale) return;

    const newPath =
      '/' + nextLocale + (basePath === '/' ? '' : basePath);

    router.push(newPath);
    router.refresh();
  }

  // ------- SESSION SUPABASE -------
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
      router.push(linkHref('/'));
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
          <Link href={linkHref('/')} className="name">
            <img className="title" src="/images/logo2.png" alt="RumantschVivo" />
          </Link>
        </div>
      </div>

      {/* MENU DESKTOP */}
      <nav className="nav-menu" aria-label="Menu principale">
        <Link href={linkHref('/')} className={isActive('/') ? 'active' : ''}>
          {t.nav.home}
        </Link>
        <Link href={linkHref('/learn')} className={isActive('/learn') ? 'active' : ''}>
          {t.nav.learn}
        </Link>
        <Link href={linkHref('/vocabulary')} className={isActive('/vocabulary') ? 'active' : ''}>
          {t.nav.vocab}
        </Link>
        <Link href={linkHref('/stories')} className={isActive('/stories') ? 'active' : ''}>
          {t.nav.stories}
        </Link>
      </nav>

      {/* LANGUAGE SWITCH + BOTTONI DESTRA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language switcher */}
        <div className="lang-switch">
          <button
            type="button"
            className={`lang-btn ${currentLocale === 'it' ? 'lang-btn--active' : ''}`}
            onClick={() => changeLocale('it')}
            aria-label="Italiano"
          >
            🇮🇹
          </button>
          <button
            type="button"
            className={`lang-btn ${currentLocale === 'en' ? 'lang-btn--active' : ''}`}
            onClick={() => changeLocale('en')}
            aria-label="English"
          >
            🇬🇧
          </button>
        </div>

        {/* Bottoni account/login */}
        <div className="button-container">
          {session ? (
            <>
              <Link href={linkHref('/account')} className="top-right-button">
                {t.nav.account}
              </Link>
              <button type="button" className="top-right-button" onClick={handleLogout}>
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link href={linkHref('/login')} className="top-right-button">
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}