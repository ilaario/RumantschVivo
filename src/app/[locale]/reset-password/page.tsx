'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isLocale, type Locale } from '@/lib/i18n/config';
import '../../stylesheets/login.css';

type UiText = {
  title: string;
  subtitle: string;
  passwordLabel: string;
  passwordConfirmLabel: string;
  passwordPlaceholder: string;
  submit: string;
  mismatch: string;
  success: string;
  genericError: string;
  noSession: string;
  backHome: string;
};

const UI_RESET: Record<Locale | 'default', UiText> = {
  it: {
    title: 'Imposta una nuova password',
    subtitle:
      'Inserisci una nuova password per il tuo account. Dopo il salvataggio verrai reindirizzato al tuo account.',
    passwordLabel: 'Nuova password',
    passwordConfirmLabel: 'Conferma password',
    passwordPlaceholder: 'Nuova password sicura',
    submit: 'Salva nuova password',
    mismatch: 'Le password non coincidono.',
    success: 'Password aggiornata con successo.',
    genericError:
      'Si è verificato un errore durante l’aggiornamento della password.',
    noSession:
      'Link non valido o scaduto. Richiedi di nuovo il reset della password.',
    backHome: 'Torna alla home',
  },
  en: {
    title: 'Set a new password',
    subtitle:
      'Enter a new password for your account. After saving, you will be redirected to your account.',
    passwordLabel: 'New password',
    passwordConfirmLabel: 'Confirm password',
    passwordPlaceholder: 'New secure password',
    submit: 'Save new password',
    mismatch: 'Passwords do not match.',
    success: 'Password successfully updated.',
    genericError: 'An error occurred while updating the password.',
    noSession:
      'Invalid or expired link. Please request a new password reset email.',
    backHome: 'Back to home',
  },
  default: {
    title: 'Imposta una nuova password',
    subtitle:
      'Inserisci una nuova password per il tuo account. Dopo il salvataggio verrai reindirizzato al tuo account.',
    passwordLabel: 'Nuova password',
    passwordConfirmLabel: 'Conferma password',
    passwordPlaceholder: 'Nuova password sicura',
    submit: 'Salva nuova password',
    mismatch: 'Le password non coincidono.',
    success: 'Password aggiornata con successo.',
    genericError:
      'Si è verificato un errore durante l’aggiornamento della password.',
    noSession:
      'Link non valido o scaduto. Richiedi di nuovo il reset della password.',
    backHome: 'Torna alla home',
  },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0])
    ? (segments[0] as Locale)
    : 'it';

  const text = UI_RESET[currentLocale] ?? UI_RESET.default;

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
    // Verifica che ci sia una sessione valida (il link di reset dovrebbe aver loggato l'utente)
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
        setError(text.genericError);
      } else {
        setInfo(text.success);

        // piccolo delay, poi manda all'account
        setTimeout(() => {
          router.push(linkHref('/account'));
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      console.error('[reset-password] unexpected error', err);
      setError(text.genericError);
    } finally {
      setLoading(false);
    }
  }

  // se abbiamo già capito che la sessione è rotta
  if (sessionOk === false) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-left">
            <div className="login-brand">
              <img
                className="login-logo"
                src="/images/logo2.png"
                alt="RumantschVivo"
              />
              <h1 className="login-title">{text.title}</h1>
            </div>

            <p className="login-subtitle">{text.noSession}</p>

            <div className="login-links" style={{ marginTop: '16px' }}>
              <Link className="link" href={linkHref('/forgot-password')}>
                {/* rimanda a rifare il reset */}
                {currentLocale === 'it'
                  ? 'Richiedi un nuovo link'
                  : 'Request a new reset link'}
              </Link>
              <span className="dot">·</span>
              <Link className="link" href={linkHref('/')}>
                {text.backHome}
              </Link>
            </div>
          </div>

          <aside className="login-right">
            <div className="login-right-inner">
              <h2>RumantschVivo</h2>
              <p>Il link potrebbe essere scaduto o già usato.</p>
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
            <img
              className="login-logo"
              src="/images/logo2.png"
              alt="RumantschVivo"
            />
            <h1 className="login-title">{text.title}</h1>
          </div>

          <p className="login-subtitle">{text.subtitle}</p>

          <form onSubmit={onSubmit} className="login-form">
            <div className="field">
              <label htmlFor="password">{text.passwordLabel}</label>
              <input
                id="password"
                type="password"
                placeholder={text.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="password2">{text.passwordConfirmLabel}</label>
              <input
                id="password2"
                type="password"
                placeholder={text.passwordPlaceholder}
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
                {text.backHome}
              </Link>
            </div>
          </form>
        </div>

        <aside className="login-right">
          <div className="login-right-inner">
            <h2>RumantschVivo</h2>
            <p>
              Una nuova password, stessa missione: sopravvivere al romancio
              Sursilvan.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}