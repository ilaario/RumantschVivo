'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isLocale, type Locale } from '@/lib/i18n/config';
import '../../stylesheets/login.css';

type UiText = {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  backToLogin: string;
  backHome: string;
  infoSent: string;
  genericError: string;
};

const UI: Record<Locale | 'default', UiText> = {
  it: {
    title: 'Password dimenticata',
    subtitle:
      'Inserisci la tua email. Se esiste un account associato, ti invieremo un link per reimpostare la password.',
    emailLabel: 'Email',
    emailPlaceholder: 'nome@esempio.com',
    submit: 'Invia link di reset',
    backToLogin: 'Torna al login',
    backHome: 'Torna alla home',
    infoSent:
      'Se esiste un account con questa email, è stato inviato un link per reimpostare la password.',
    genericError:
      'Si è verificato un errore durante l’invio del link. Riprova tra qualche minuto.',
  },
  en: {
    title: 'Forgot your password?',
    subtitle:
      'Enter your email. If there is an account associated with it, we will send you a reset link.',
    emailLabel: 'Email',
    emailPlaceholder: 'name@example.com',
    submit: 'Send reset link',
    backToLogin: 'Back to login',
    backHome: 'Back to home',
    infoSent:
      'If an account with this email exists, a password reset link has been sent.',
    genericError:
      'An error occurred while sending the reset link. Please try again later.',
  },
  default: {
    title: 'Password dimenticata',
    subtitle:
      'Inserisci la tua email. Se esiste un account associato, ti invieremo un link per reimpostare la password.',
    emailLabel: 'Email',
    emailPlaceholder: 'nome@esempio.com',
    submit: 'Invia link di reset',
    backToLogin: 'Torna al login',
    backHome: 'Torna alla home',
    infoSent:
      'Se esiste un account con questa email, è stato inviato un link per reimpostare la password.',
    genericError:
      'Si è verificato un errore durante l’invio del link. Riprova tra qualche minuto.',
  },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0])
    ? (segments[0] as Locale)
    : 'it';

  const text = UI[currentLocale] ?? UI.default;

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

      // redirectTo: pagina dove l’utente atterrerà dopo aver cliccato il link
      const redirectTo = `${window.location.origin}/${currentLocale}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo },
      );

      if (resetError) {
        console.error('[forgot-password] resetPasswordForEmail error', resetError);
        setError(text.genericError);
      } else {
        setInfo(text.infoSent);
      }
    } catch (err) {
      console.error('[forgot-password] unexpected error', err);
      setError(text.genericError);
    } finally {
      setLoading(false);
    }
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
              <label htmlFor="email">{text.emailLabel}</label>
              <input
                id="email"
                type="email"
                placeholder={text.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && <p className="alert alert-error">{error}</p>}
            {info && <p className="alert alert-info">{info}</p>}

            <button className="primary-btn" disabled={loading}>
              {loading ? '...' : text.submit}
            </button>

            <div className="login-links">
              <Link className="link" href={linkHref('/login')}>
                {text.backToLogin}
              </Link>
              <span className="dot">·</span>
              <Link className="link" href={linkHref('/')}>
                {text.backHome}
              </Link>
            </div>
          </form>
        </div>

        <aside className="login-right">
          <div className="login-right-inner">
            {/* Puoi riusare il testo della right column o lasciarlo vuoto / breve */}
            <h2>RumantschVivo</h2>
            <p>
              Reimposta la password e torna a studiare romancio invece di
              bloccare il cervello sul login.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}