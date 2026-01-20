'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';

type LangItem = {
  locale: Locale;
  label: string;
  flag: string;
};

export default function Header({
  drawerOpen,
  onToggleDrawer,
}: {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const t = useI18n();

  const langRef = useRef<HTMLDivElement | null>(null);

  // ------- LOCALE & PATH -------
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';
  const basePath = '/' + (segments.slice(1).join('/') || '');

  const linkHref = (path: string) => `/${currentLocale}${path}`;
  const isActive = (href: string) => pathname === linkHref(href);

  const languages: LangItem[] = useMemo(
    () => [
      { locale: 'it', label: 'Italiano', flag: '🇮🇹' },
      { locale: 'en', label: 'English', flag: '🇬🇧' },
      { locale: 'fr', label: 'Français', flag: '🇫🇷' },
      { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
    ],
    [],
  );

  const currentLang = useMemo(
    () => languages.find((l) => l.locale === currentLocale) ?? languages[0],
    [languages, currentLocale],
  );

  const orderedLanguages = useMemo(() => {
    const rest = languages.filter((l) => l.locale !== currentLocale);
    return [currentLang, ...rest];
  }, [languages, currentLocale, currentLang]);

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === currentLocale) {
      setLangOpen(false);
      return;
    }

    const newPath = '/' + nextLocale + (basePath === '/' ? '' : basePath);
    setLangOpen(false);
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

  // ------- CLOSE DROPDOWN ON OUTSIDE CLICK / ESC -------
  useEffect(() => {
    if (!langOpen) return;

    function onDocMouseDown(e: MouseEvent) {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target as Node)) setLangOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLangOpen(false);
    }

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [langOpen]);

  return (
    <header className={`nav ${drawerOpen ? 'nav--drawerOpen' : ''}`} id="navbar-container">
      <div className="navLeft">
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

      <div className="navRight">
        {/* DESKTOP: 4 bottoni come prima */}
        <div className="lang-switch lang-switch--desktop" aria-label="Language switcher (desktop)">
          {languages.map((l) => (
            <button
              key={l.locale}
              type="button"
              className={`lang-btn ${currentLocale === l.locale ? 'lang-btn--active' : ''}`}
              onClick={() => changeLocale(l.locale)}
              aria-label={l.label}
              title={l.label}
            >
              {l.flag}
            </button>
          ))}
        </div>

        {/* MOBILE: dropdown */}
        <div className="lang-switch lang-switch--mobile" ref={langRef}>
          <button
            type="button"
            className={`lang-current ${langOpen ? 'is-open' : ''}`}
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            aria-haspopup="menu"
            aria-label={`Lingua: ${currentLang.label}`}
          >
            <span className="lang-flag">{currentLang.flag}</span>
            <span className="lang-caret" aria-hidden="true" />
          </button>

          <div className={`lang-menu ${langOpen ? 'is-open' : ''}`} role="menu">
            {orderedLanguages.map((l) => {
              const active = l.locale === currentLocale;
              return (
                <button
                  key={l.locale}
                  type="button"
                  role="menuitem"
                  className={`lang-item ${active ? 'is-active' : ''}`}
                  onClick={() => changeLocale(l.locale)}
                >
                  <span className="lang-item-flag">{l.flag}</span>
                  <span className="lang-item-label">{l.label}</span>
                  {active && <span className="lang-item-pill">Current</span>}
                </button>
              );
            })}
          </div>
        </div>

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
