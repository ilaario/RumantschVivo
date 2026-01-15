'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import '../stylesheets/login.css';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

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
      setInfo('Ti ho inviato una mail di conferma. Aprila e poi fai login.');
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <img className="login-logo" src="/images/logo2.png" alt="RumantschVivo" />
            <h1 className="login-title">{mode === 'login' ? 'Login' : 'Crea account'}</h1>
          </div>

          <p className="login-subtitle">
            {mode === 'login'
              ? 'Accedi per salvare progressi, lezioni e preferenze.'
              : 'Crea un account per tenere traccia dei tuoi progressi.'}
          </p>

          <form onSubmit={onSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="alert alert-error">{error}</p>}
            {info && <p className="alert alert-info">{info}</p>}

            <button className="primary-btn" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Entra' : 'Registrati'}
            </button>

            <div className="login-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                disabled={loading}
              >
                {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Login'}
              </button>
            </div>

            <div className="login-links">
              <Link className="link" href="/wip">
                Password dimenticata?
              </Link>
              <span className="dot">·</span>
              <Link className="link" href="/">
                Torna alla home
              </Link>
            </div>
          </form>
        </div>

        <aside className="login-right">
          <div className="login-right-inner">
            <h2>RumantschVivo</h2>
            <p>
              Lezioni brevi, esempi reali, e un posto dove il romancio non finisce dimenticato in un cassetto.
            </p>

            <ul className="login-bullets">
              <li>Salva progressi</li>
              <li>Vocabolario personale</li>
              <li>Contenuti per varianti (Sursilvan…)</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}