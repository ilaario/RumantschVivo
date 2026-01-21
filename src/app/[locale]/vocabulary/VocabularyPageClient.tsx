// src/app/[locale]/dictionary/DictionaryPageClient.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/i18nprovider';

type VocabEntry = {
  id: string;
  term: string;
  translation: string;
  notes: string | null;
  created_at: string;
};

type Props = {
  locale: Locale;
  userId: string;
};

type TabKey = 'all' | 'recent';

export function VocabularyPageClient({ locale, userId }: Props) {
  const t = useI18n();
  const text = (t as any).vocabulary_page ?? {};

  const labels = useMemo(() => {
    // fallback duro se ti manca qualcosa nelle i18n
    if (locale === 'it') {
      return {
        add_title: text.add_title ?? 'Aggiungi una voce',
        term_label: text.term_label ?? 'Parola / espressione',
        translation_label: text.translation_label ?? 'Traduzione',
        notes_label: text.notes_label ?? 'Note (opzionali)',
        add_button: text.add_button ?? 'Aggiungi al vocabolario',
        import_title: text.import_title ?? 'Importa da CSV o JSON',
        import_help:
          text.import_help ??
          'CSV con intestazione "term,translation,notes" oppure JSON con un array di oggetti { term, translation, notes }. Max ~500 righe per import.',
        import_button: text.import_button ?? 'Importa file',
        import_success: text.import_success ?? 'Import completato.',
        import_error: text.import_error ?? 'Errore durante l’import.',
        tab_all: text.tab_all ?? 'Tutte le voci',
        tab_recent: text.tab_recent ?? 'Aggiunte di recente',
        empty: text.empty ?? 'Non hai ancora aggiunto nessuna parola.',
        loading: text.loading ?? 'Caricamento…',
      };
    }
    if (locale === 'fr') {
      return {
        add_title: text.add_title ?? 'Ajouter une entrée',
        term_label: text.term_label ?? 'Mot / expression',
        translation_label: text.translation_label ?? 'Traduction',
        notes_label: text.notes_label ?? 'Notes (optionnel)',
        add_button: text.add_button ?? 'Ajouter au vocabulaire',
        import_title: text.import_title ?? 'Importer depuis CSV ou JSON',
        import_help:
          text.import_help ??
          'CSV avec en-tête "term,translation,notes" ou JSON avec un tableau d’objets { term, translation, notes }. Environ 500 lignes maximum par import.',
        import_button: text.import_button ?? 'Importer un fichier',
        import_success: text.import_success ?? 'Import terminé.',
        import_error: text.import_error ?? 'Erreur lors de l’import.',
        tab_all: text.tab_all ?? 'Toutes les entrées',
        tab_recent: text.tab_recent ?? 'Ajoutées récemment',
        empty: text.empty ?? 'Vous n’avez encore ajouté aucun mot.',
        loading: text.loading ?? 'Chargement…',
      };
    }
    if (locale === 'de') {
      return {
        add_title: text.add_title ?? 'Eintrag hinzufügen',
        term_label: text.term_label ?? 'Wort / Ausdruck',
        translation_label: text.translation_label ?? 'Übersetzung',
        notes_label: text.notes_label ?? 'Notizen (optional)',
        add_button: text.add_button ?? 'Zum Vokabular hinzufügen',
        import_title: text.import_title ?? 'Aus CSV oder JSON importieren',
        import_help:
          text.import_help ??
          'CSV mit Kopfzeile "term,translation,notes" oder JSON mit einem Array von Objekten { term, translation, notes }. Max. ca. 500 Zeilen pro Import.',
        import_button: text.import_button ?? 'Datei importieren',
        import_success: text.import_success ?? 'Import abgeschlossen.',
        import_error: text.import_error ?? 'Fehler beim Import.',
        tab_all: text.tab_all ?? 'Alle Einträge',
        tab_recent: text.tab_recent ?? 'Kürzlich hinzugefügt',
        empty: text.empty ?? 'Du hast noch keine Wörter hinzugefügt.',
        loading: text.loading ?? 'Laden…',
      };
    }
    // EN default
    return {
      add_title: text.add_title ?? 'Add an entry',
      term_label: text.term_label ?? 'Word / expression',
      translation_label: text.translation_label ?? 'Translation',
      notes_label: text.notes_label ?? 'Notes (optional)',
      add_button: text.add_button ?? 'Add to vocabulary',
      import_title: text.import_title ?? 'Import from CSV or JSON',
      import_help:
        text.import_help ??
        'CSV with header "term,translation,notes" or JSON with an array of { term, translation, notes }. Max ~500 rows per import.',
      import_button: text.import_button ?? 'Import file',
      import_success: text.import_success ?? 'Import completed.',
      import_error: text.import_error ?? 'Error during import.',
      tab_all: text.tab_all ?? 'All entries',
      tab_recent: text.tab_recent ?? 'Recently added',
      empty: text.empty ?? 'You have not added any words yet.',
      loading: text.loading ?? 'Loading…',
    };
  }, [locale, text]);

  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [notes, setNotes] = useState('');

  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const supabase: SupabaseClient | null = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('[DictionaryPageClient] Missing Supabase env vars');
      return null;
    }

    return createBrowserClient(url, key);
  }, []);

  // ---- load entries ----
  useEffect(() => {
    if (!supabase) return;

    let sb = supabase;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data, error } = await sb
          .from('vocab_entries')
          .select('id, term, translation, notes, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(500);

        if (cancelled) return;

        if (error) {
          console.error('[DictionaryPageClient] load error', error);
          setErrorMsg('Failed to load vocabulary.');
          setEntries([]);
        } else {
          setEntries((data ?? []) as VocabEntry[]);
        }
      } catch (e) {
        if (cancelled) return;
        console.error('[DictionaryPageClient] load exception', e);
        setErrorMsg('Unexpected error while loading vocabulary.');
        setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId, locale]);

  // ---- add single entry ----
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    const termTrim = term.trim();
    const transTrim = translation.trim();
    const notesTrim = notes.trim();

    if (!termTrim || !transTrim) return;

    try {
      const { data, error } = await supabase
        .from('vocab_entries')
        .insert({
          user_id: userId,
          locale,
          term: termTrim,
          translation: transTrim,
          notes: notesTrim || null,
        })
        .select('id, term, translation, notes, created_at')
        .single();

      if (error) {
        console.error('[DictionaryPageClient] insert error', error);
        setFeedback(null);
        setErrorMsg(labels.import_error);
        return;
      }

      setEntries((prev) => [data as VocabEntry, ...prev]);
      setTerm('');
      setTranslation('');
      setNotes('');
      setFeedback(null);
      setErrorMsg(null);
    } catch (e) {
      console.error('[DictionaryPageClient] insert exception', e);
      setFeedback(null);
      setErrorMsg(labels.import_error);
    }
  }

  // ---- import CSV / JSON ----
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setFeedback(null);
    setErrorMsg(null);

    try {
      const text = await file.text();

      let records: { term: string; translation: string; notes?: string }[] = [];

      if (file.name.toLowerCase().endsWith('.json')) {
        // JSON: array di oggetti { term, translation, notes? }
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          records = parsed
            .map((r) => ({
              term: String(r.term ?? '').trim(),
              translation: String(r.translation ?? '').trim(),
              notes: r.notes != null ? String(r.notes) : undefined,
            }))
            .filter((r) => r.term && r.translation);
        }
      } else {
        // CSV base: prima riga header, separatore ,
        // "term,translation,notes"
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length > 0) {
          const header = lines[0].split(',').map((h) => h.trim().toLowerCase());

          const termIdx = header.indexOf('term');
          const trIdx = header.indexOf('translation');
          const notesIdx = header.indexOf('notes');

          if (termIdx === -1 || trIdx === -1) {
            throw new Error('CSV must have at least term,translation columns');
          }

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            const term = (cols[termIdx] ?? '').trim();
            const translation = (cols[trIdx] ?? '').trim();
            const note =
              notesIdx >= 0 ? (cols[notesIdx] ?? '').trim() : undefined;

            if (term && translation) {
              records.push({ term, translation, notes: note });
            }
          }
        }
      }

      if (records.length === 0) {
        setErrorMsg(labels.import_error);
        return;
      }

      // limitino di sicurezza
      if (records.length > 500) {
        records = records.slice(0, 500);
      }

      const payload = records.map((r) => ({
        user_id: userId,
        locale,
        term: r.term,
        translation: r.translation,
        notes: r.notes && r.notes.trim().length > 0 ? r.notes : null,
      }));

      const { data, error } = await supabase
        .from('vocab_entries')
        .insert(payload)
        .select('id, term, translation, notes, created_at');

      if (error) {
        console.error('[DictionaryPageClient] bulk insert error', error);
        setErrorMsg(labels.import_error);
        return;
      }

      setEntries((prev) => ([...(data as VocabEntry[]), ...prev]));
      setFeedback(labels.import_success);
      setErrorMsg(null);
      e.target.value = ''; // reset input file
    } catch (err) {
      console.error('[DictionaryPageClient] import exception', err);
      setErrorMsg(labels.import_error);
      setFeedback(null);
    }
  }

  // ---- tab filtering ----
  const displayedEntries = useMemo(() => {
    if (activeTab === 'recent') {
      return entries.slice(0, 30); // tipo "ultime 30"
    }
    return entries;
  }, [entries, activeTab]);

  return (
    <div className="dict-layout">
      {/* Form aggiunta singola */}
      <section className="dict-panel">
        <h2 className="dict-panel-title">{labels.add_title}</h2>

        <form className="dict-form" onSubmit={handleAdd}>
          <div className="dict-field">
            <label className="dict-label">
              {labels.term_label}
              <input
                type="text"
                className="dict-input"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </label>
          </div>

          <div className="dict-field">
            <label className="dict-label">
              {labels.translation_label}
              <input
                type="text"
                className="dict-input"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
              />
            </label>
          </div>

          <div className="dict-field">
            <label className="dict-label">
              {labels.notes_label}
              <textarea
                className="dict-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            className="dict-submit-btn"
            disabled={!term.trim() || !translation.trim()}
          >
            {labels.add_button}
          </button>
        </form>
      </section>

      {/* Import */}
      <section className="dict-panel">
        <h2 className="dict-panel-title">{labels.import_title}</h2>
        <p className="dict-help">{labels.import_help}</p>
        <label className="dict-upload-btn">
          {labels.import_button}
          <input
            type="file"
            accept=".csv,application/json,text/csv,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      </section>

      {/* Feedback */}
      {(feedback || errorMsg) && (
        <section className="dict-feedback">
          {feedback && <p className="dict-feedback-ok">{feedback}</p>}
          {errorMsg && <p className="dict-feedback-error">{errorMsg}</p>}
        </section>
      )}

      {/* Tabs + lista */}
      <section className="dict-panel dict-panel--full">
        <div className="dict-tabs">
          <button
            type="button"
            className={`dict-tab ${activeTab === 'all' ? 'dict-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {labels.tab_all} <span className="dict-tab-count">{entries.length}</span>
          </button>
          <button
            type="button"
            className={`dict-tab ${
              activeTab === 'recent' ? 'dict-tab--active' : ''
            }`}
            onClick={() => setActiveTab('recent')}
          >
            {labels.tab_recent}
          </button>
        </div>

        {loading ? (
          <div className="dict-empty">{labels.loading}</div>
        ) : displayedEntries.length === 0 ? (
          <div className="dict-empty">{labels.empty}</div>
        ) : (
          <div className="dict-table-wrapper">
            <table className="dict-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Translation</th>
                  <th>Notes</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {displayedEntries.map((e) => (
                  <tr key={e.id}>
                    <td className="dict-term">{e.term}</td>
                    <td className="dict-translation">{e.translation}</td>
                    <td className="dict-notes">
                      {e.notes && e.notes.trim().length > 0 ? e.notes : '—'}
                    </td>
                    <td className="dict-date">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}