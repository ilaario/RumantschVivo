'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../stylesheets/account-edit.css';

export default function EditAccountPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name }),
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error ?? 'Errore nel salvataggio');
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <main className="edit-page">
      <div className="edit-container">
        <h1 className="edit-title">Modifica profilo</h1>
        <p className="edit-hint">
          Imposta il nome che verrà mostrato nel tuo account.
        </p>

        <div className="edit-card">
          <form onSubmit={save}>
            <div className="form-row">
              <label className="label" htmlFor="display-name">
                Nome visualizzato
              </label>
              <input
                id="display-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es: Dario"
              />
              <div className="help">
                Puoi cambiarlo in qualsiasi momento.
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Salvataggio…' : 'Salva'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push('/account')}
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}