// src/app/[locale]/status/StatusPageClient.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/i18nprovider';

type IdeaStatus = 'open' | 'planned' | 'done' | 'rejected';

type Idea = {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  score: number;
  created_at: string;
};

type Comment = {
  id: string;
  idea_id: string;
  body: string;
  created_at: string;
};

type Props = {
  locale: Locale;
  userId: string | null;
};

export function StatusPageClient({ locale, userId }: Props) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  // i18n
  const t = useI18n();
  // se non esiste ancora nelle messages, t.status_page_ideas sarà undefined
  const txt = useMemo(() => {
    const base = (t as any).status_page_ideas ?? {};

    // fallback di sicurezza basati sul locale,
    // così non esplode mentre sistemi i messages
    const fallback =
      locale === 'it'
        ? {
            need_login:
              'Devi essere loggato per proporre idee, votare e commentare.',
            placeholder_title: 'Titolo dell’idea',
            placeholder_desc: 'Descrivi brevemente la tua idea…',
            add_idea: 'Invia idea',
            ideas_empty: 'Ancora nessuna idea. Sii il primo a proporne una!',
            upvote: 'Voto positivo',
            downvote: 'Voto negativo',
            comments_label: 'Commenti',
            placeholder_comment: 'Scrivi un commento…',
            add_comment: 'Invia commento',
            loading: 'Caricamento…',
            no_comments: 'Ancora nessun commento.',
          }
        : locale === 'fr'
          ? {
              need_login:
                'Vous devez être connecté pour proposer des idées, voter et commenter.',
              placeholder_title: 'Titre de l’idée',
              placeholder_desc: 'Décrivez brièvement votre idée…',
              add_idea: 'Envoyer l’idée',
              ideas_empty:
                'Aucune idée pour le moment. Soyez le premier à en proposer une !',
              upvote: 'Vote positif',
              downvote: 'Vote négatif',
              comments_label: 'Commentaires',
              placeholder_comment: 'Écrivez un commentaire…',
              add_comment: 'Envoyer le commentaire',
              loading: 'Chargement…',
              no_comments: 'Pas encore de commentaires.',
            }
          : locale === 'de'
            ? {
                need_login:
                  'Du musst eingeloggt sein, um Ideen vorzuschlagen, abzustimmen und zu kommentieren.',
                placeholder_title: 'Titel der Idee',
                placeholder_desc: 'Beschreibe deine Idee kurz…',
                add_idea: 'Idee senden',
                ideas_empty:
                  'Noch keine Ideen. Sei der Erste, der eine vorschlägt!',
                upvote: 'Positiv bewerten',
                downvote: 'Negativ bewerten',
                comments_label: 'Kommentare',
                placeholder_comment: 'Schreibe einen Kommentar…',
                add_comment: 'Kommentar senden',
                loading: 'Laden…',
                no_comments: 'Noch keine Kommentare.',
              }
            : {
                need_login:
                  'You need to be logged in to submit ideas, vote, and comment.',
                placeholder_title: 'Idea title',
                placeholder_desc: 'Briefly describe your idea…',
                add_idea: 'Submit idea',
                ideas_empty:
                  'No ideas yet. Be the first to suggest one!',
                upvote: 'Upvote',
                downvote: 'Downvote',
                comments_label: 'Comments',
                placeholder_comment: 'Write a comment…',
                add_comment: 'Post comment',
                loading: 'Loading…',
                no_comments: 'No comments yet.',
              };

    return { ...fallback, ...base };
  }, [t, locale]);

  const supabase: SupabaseClient | null = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('[StatusPageClient] Missing Supabase env vars');
      return null;
    }

    return createBrowserClient(url, key);
  }, []);

  // ---- load ideas + user votes ----

  useEffect(() => {
    if (!supabase) return;

    const sb = supabase; // <- alias NON null per TypeScript


    async function loadAll() {
      setLoading(true);
      setErrorMsg(null);

      try {
        // idee ordinate per score desc, poi data
        const { data: ideaRows, error: ideaErr } = await sb
          .from('ideas')
          .select('*')
          .order('score', { ascending: false })
          .order('created_at', { ascending: false });

        if (ideaErr) {
          console.error('[StatusPageClient] ideas error', ideaErr);
          setErrorMsg('Failed to load ideas.');
          setLoading(false);
          return;
        }

        setIdeas((ideaRows ?? []) as Idea[]);

        // voti dell'utente (se loggato)
        if (userId) {
          const { data: voteRows, error: voteErr } = await sb
            .from('idea_votes')
            .select('idea_id, vote')
            .eq('user_id', userId);

          if (!voteErr && Array.isArray(voteRows)) {
            const map: Record<string, number> = {};
            for (const r of voteRows as any[]) {
              map[r.idea_id] = r.vote ?? 0;
            }
            setUserVotes(map);
          }
        }
      } catch (e) {
        console.error('[StatusPageClient] loadAll exception', e);
        setErrorMsg('Unexpected error while loading ideas.');
      } finally {
        setLoading(false);
      }
    }

    void loadAll();
  }, [supabase, userId]);

  // ---- create idea ----

  async function handleSubmitIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !userId) return;

    const title = newTitle.trim();
    const description = newDescription.trim();
    if (!title || !description) return;

    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert({
          title,
          description,
          user_id: userId,
        })
        .select('*')
        .single();

      if (error) {
        console.error('[StatusPageClient] insert idea error', error);
        return;
      }

      setIdeas((prev) => [data as Idea, ...prev]);
      setNewTitle('');
      setNewDescription('');
    } catch (e) {
      console.error('[StatusPageClient] insert idea exception', e);
    }
  }

  // ---- voting ----

  async function handleVote(ideaId: string, direction: 1 | -1) {
    if (!supabase || !userId) return;

    const prevVote = userVotes[ideaId] ?? 0;
    const newVote = prevVote === direction ? 0 : direction;
    const delta = newVote - prevVote;

    // ottimismo
    setUserVotes((prev) => ({ ...prev, [ideaId]: newVote }));
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, score: idea.score + delta } : idea,
      ),
    );

    try {
      if (newVote === 0) {
        // elimina voto
        const { error } = await supabase
          .from('idea_votes')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', userId);

        if (error) {
          console.error('[StatusPageClient] delete vote error', error);
        }
      } else {
        // upsert voto
        const { error } = await supabase.from('idea_votes').upsert(
          {
            idea_id: ideaId,
            user_id: userId,
            vote: newVote,
          },
          {
            onConflict: 'idea_id,user_id',
          },
        );

        if (error) {
          console.error('[StatusPageClient] upsert vote error', error);
        }
      }

      // Per l'MVP non aggiorniamo score sul DB:
      // l'ordinamento lato client usa lo state aggiornato.
    } catch (e) {
      console.error('[StatusPageClient] vote exception', e);
    }
  }

  // ---- comments ----

  async function toggleComments(ideaId: string) {
    if (!supabase) return;

    if (openCommentsFor === ideaId) {
      setOpenCommentsFor(null);
      return;
    }

    setOpenCommentsFor(ideaId);

    if (!comments[ideaId]) {
      setLoadingComments((prev) => ({ ...prev, [ideaId]: true }));
      try {
        const { data, error } = await supabase
          .from('idea_comments')
          .select('*')
          .eq('idea_id', ideaId)
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(data)) {
          setComments((prev) => ({ ...prev, [ideaId]: data as Comment[] }));
        }
      } catch (e) {
        console.error('[StatusPageClient] load comments exception', e);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [ideaId]: false }));
      }
    }
  }

  async function handleSubmitComment(ideaId: string) {
    if (!supabase || !userId) return;

    const text = (newComment[ideaId] ?? '').trim();
    if (!text) return;

    try {
      const { data, error } = await supabase
        .from('idea_comments')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          body: text,
        })
        .select('*')
        .single();

      if (!error && data) {
        setComments((prev) => ({
          ...prev,
          [ideaId]: [...(prev[ideaId] ?? []), data as Comment],
        }));
        setNewComment((prev) => ({ ...prev, [ideaId]: '' }));
      }
    } catch (e) {
      console.error('[StatusPageClient] insert comment exception', e);
    }
  }

  // ---- render ----

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="idea-board">
      {!userId && <div className="idea-alert">{txt.need_login}</div>}

      {/* Nuova idea */}
      <form className="idea-new-form" onSubmit={handleSubmitIdea}>
        <input
          type="text"
          className="idea-input"
          placeholder={txt.placeholder_title}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={!userId}
        />
        <textarea
          className="idea-textarea"
          rows={3}
          placeholder={txt.placeholder_desc}
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={!userId}
        />
        <button
          type="submit"
          className="idea-submit-btn"
          disabled={!userId || !newTitle.trim() || !newDescription.trim()}
        >
          {txt.add_idea}
        </button>
      </form>

      {/* Lista idee */}
      {loading ? (
        <div className="idea-empty">{txt.loading}</div>
      ) : errorMsg ? (
        <div className="idea-empty">{errorMsg}</div>
      ) : sortedIdeas.length === 0 ? (
        <div className="idea-empty">{txt.ideas_empty}</div>
      ) : (
        <ul className="idea-list">
          {sortedIdeas.map((idea) => {
            const vote = userVotes[idea.id] ?? 0;
            const isCommentsOpen = openCommentsFor === idea.id;
            const ideaComments = comments[idea.id] ?? [];
            const isCommentsLoading = loadingComments[idea.id] ?? false;

            return (
              <li key={idea.id} className="idea-card">
                <div className="idea-main">
                  <div className="idea-votes">
                    <button
                      type="button"
                      className={`idea-vote-btn ${
                        vote === 1 ? 'idea-vote-btn--active-up' : ''
                      }`}
                      onClick={() => handleVote(idea.id, 1)}
                      disabled={!userId}
                      aria-label={txt.upvote}
                    >
                      ▲
                    </button>
                    <div className="idea-score">{idea.score}</div>
                    <button
                      type="button"
                      className={`idea-vote-btn ${
                        vote === -1 ? 'idea-vote-btn--active-down' : ''
                      }`}
                      onClick={() => handleVote(idea.id, -1)}
                      disabled={!userId}
                      aria-label={txt.downvote}
                    >
                      ▼
                    </button>
                  </div>

                  <div className="idea-content">
                    <h3 className="idea-title">{idea.title}</h3>
                    <p className="idea-description">{idea.description}</p>
                  </div>
                </div>

                <div className="idea-footer">
                  <button
                    type="button"
                    className="idea-comments-toggle"
                    onClick={() => void toggleComments(idea.id)}
                  >
                    {txt.comments_label}{' '}
                    {ideaComments.length > 0 ? `(${ideaComments.length})` : ''}
                    {isCommentsOpen ? ' ▴' : ' ▾'}
                  </button>
                </div>

                {isCommentsOpen && (
                  <div className="idea-comments">
                    {isCommentsLoading ? (
                      <p className="idea-comments-empty">{txt.loading}</p>
                    ) : ideaComments.length === 0 ? (
                      <p className="idea-comments-empty">
                        {txt.no_comments}
                      </p>
                    ) : (
                      <ul className="idea-comments-list">
                        {ideaComments.map((c) => (
                          <li key={c.id} className="idea-comment">
                            <p>{c.body}</p>
                            <span className="idea-comment-meta">
                              {new Date(c.created_at).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="idea-comment-form">
                      <textarea
                        className="idea-comment-input"
                        rows={2}
                        placeholder={txt.placeholder_comment}
                        value={newComment[idea.id] ?? ''}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [idea.id]: e.target.value,
                          }))
                        }
                        disabled={!userId}
                      />
                      <button
                        type="button"
                        className="idea-comment-btn"
                        disabled={!userId || !(newComment[idea.id] ?? '').trim()}
                        onClick={() => void handleSubmitComment(idea.id)}
                      >
                        {txt.add_comment}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}