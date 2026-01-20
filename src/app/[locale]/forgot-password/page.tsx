'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';
import '../../stylesheets/login.css';

export default function ForgotPasswordPage() {
  const pathname = usePathname();
  const t = useI18n();

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  const [email, setEmail] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function linkHref(path: string) {
    return `/${currentLocale}${path}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo(null);
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/${currentLocale}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        console.error('[forgot-password] reset error', resetError);
        setError(t.forgot_password.generic_error);
      } else {
        setInfo(t.forgot_password.info_sent);
      }
    } catch (err) {
      console.error('[forgot-password] unexpected error', err);
      setError(t.forgot_password.generic_error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <img className="login-logo" src="/images/logo2.png" alt="RumantschVivo" />
            <h1 className="login-title">{t.forgot_password.title}</h1>
          </div>

          <p className="login-subtitle">{t.forgot_password.subtitle}</p>

          <form onSubmit={onSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">{t.forgot_password.email_label}</label>
              <input
                id="email"
                type="email"
                placeholder={t.forgot_password.email_placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && <p className="alert alert-error">{error}</p>}
            {info && <p className="alert alert-info">{info}</p>}

            <button className="primary-btn" disabled={loading}>
              {loading ? '…' : t.forgot_password.submit}
            </button>

            <div className="login-links">
              <Link className="link" href={linkHref('/login')}>
                {t.forgot_password.back_to_login}
              </Link>
              <span className="dot">·</span>
              <Link className="link" href={linkHref('/')}>
                {t.forgot_password.back_home}
              </Link>
            </div>
          </form>
        </div>

        <aside className="login-right">
          <div className="login-right-inner">
            <h2>RumantschVivo</h2>
            <p>{t.forgot_password.side_text}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
