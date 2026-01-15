'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import '../../../stylesheets/account-edit.css';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';

export default function EditAccountPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const t = useI18n();

  const segments = pathname.split('/').filter(Boolean);
  const locale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

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
      setError(j?.error ?? t.account.edit.error_generic);
      return;
    }

    router.push(`/${locale}/account`);
    router.refresh();
  }

  function cancel() {
    router.push(`/${locale}/account`);
  }

  return (
    <main className="edit-page">
      <div className="edit-container">
        <h1 className="edit-title">{t.account.edit.title}</h1>
        <p className="edit-hint">{t.account.edit.subtitle}</p>

        <div className="edit-card">
          <form onSubmit={save}>
            <div className="form-row">
              <label className="label" htmlFor="display-name">
                {t.account.edit.label}
              </label>
              <input
                id="display-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.account.edit.placeholder}
              />
              <div className="help">
                {t.account.edit.help}
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? t.account.edit.saving : t.account.edit.save}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancel}
              >
                {t.account.edit.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}