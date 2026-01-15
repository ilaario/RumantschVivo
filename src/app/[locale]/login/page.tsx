'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';

import '../../stylesheets/login.css';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useI18n();

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  const linkHref = (path: string) => `/${currentLocale}${path}`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    const res =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    // Se Confirm email è ON, spesso non c'è sessione subito
    if (mode === 'signup' && !res.data.session) {
      setInfo(t.login.info_confirm_email);
      return;
    }

    router.push(linkHref('/account'));
    router.refresh();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <img className="login-logo" src="/images/logo2.png" alt="RumantschVivo" />
            <h1 className="login-title">
              {mode === 'login' ? t.login.title_login : t.login.title_signup}
            </h1>
          </div>

          <p className="login-subtitle">
            {mode === 'login' ? t.login.subtitle_login : t.login.subtitle_signup}
          </p>

          <form onSubmit={onSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">{t.login.email_label}</label>
              <input
                id="email"
                type="email"
                placeholder={t.login.email_placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">{t.login.password_label}</label>
              <input
                id="password"
                type="password"
                placeholder={t.login.password_placeholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="alert alert-error">{error}</p>}
            {info && <p className="alert alert-info">{info}</p>}

            <button className="primary-btn" disabled={loading}>
              {loading ? t.login.loading : mode === 'login' ? t.login.submit_login : t.login.submit_signup}
            </button>

            <div className="login-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                disabled={loading}
              >
                {mode === 'login' ? t.login.switch_to_signup : t.login.switch_to_login}
              </button>
            </div>

            <div className="login-links">
              <Link className="link" href={linkHref('/wip')}>
                {t.login.forgot_password}
              </Link>
              <span className="dot">·</span>
              <Link className="link" href={linkHref('/')}>
                {t.login.back_home}
              </Link>
            </div>
          </form>
        </div>

        <aside className="login-right">
          <div className="login-right-inner">
            <h2>{t.login.right_title}</h2>
            <p>{t.login.right_text}</p>

            <ul className="login-bullets">
              <li>{t.login.bullet_1}</li>
              <li>{t.login.bullet_2}</li>
              <li>{t.login.bullet_3}</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}