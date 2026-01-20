'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/i18nprovider';
import '../../stylesheets/login.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useI18n();
  const text = t.reset_password;

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  function linkHref(path: string) {
    return `/${currentLocale}${path}`;
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          console.error('[reset-password] getUser error', error);
          setSessionOk(false);
        } else {
          setSessionOk(true);
        }
      } catch (err) {
        console.error('[reset-password] unexpected session error', err);
        setSessionOk(false);
      }
    };

    checkSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password !== password2) {
      setError(text.mismatch);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error('[reset-password] updateUser error', updateError);
        setError(text.generic_error);
      } else {
        setInfo(text.success);

        setTimeout(() => {
          router.push(linkHref('/account'));
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      console.error('[reset-password] unexpected error', err);
      setError(text.generic_error);
    } finally {
      setLoading(false);
    }
  }

  if (sessionOk === false) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-left">
            <div className="login-brand">
              <img className="login-logo" src="/images/logo2.png" alt="RumantschVivo" />
              <h1 className="login-title">{text.title}</h1>
            </div>

            <p className="login-subtitle">{text.no_session}</p>

            <div className="login-links" style={{ marginTop: '16px' }}>
              <Link className="link" href={linkHref('/forgot-password')}>
                {text.request_new_link}
              </Link>
              <span className="dot">·</span>
              <Link className="link" href={linkHref('/')}>
                {text.back_home}
              </Link>
            </div>
          </div>

          <aside className="login-right">
            <div className="login-right-inner">
              <h2>{text.right_title}</h2>
              <p>{text.right_body_session_expired}</p>
            </div>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <img className="login-logo" src="/images/logo2.png" alt="RumantschVivo" />
            <h1 className="login-title">{text.title}</h1>
          </div>

          <p className="login-subtitle">{text.subtitle}</p>

          <form onSubmit={onSubmit} className="login-form">
            <div className="field">
              <label htmlFor="password">{text.password_label}</label>
              <input
                id="password"
                type="password"
                placeholder={text.password_placeholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="password2">{text.password_confirm_label}</label>
              <input
                id="password2"
                type="password"
                placeholder={text.password_placeholder}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <p className="alert alert-error">{error}</p>}
            {info && <p className="alert alert-info">{info}</p>}

            <button className="primary-btn" disabled={loading || !sessionOk}>
              {loading ? '...' : text.submit}
            </button>

            <div className="login-links">
              <Link className="link" href={linkHref('/')}>
                {text.back_home}
              </Link>
            </div>
          </form>
        </div>

        <aside className="login-right">
          <div className="login-right-inner">
            <h2>{text.right_title}</h2>
            <p>{text.right_body_normal}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
