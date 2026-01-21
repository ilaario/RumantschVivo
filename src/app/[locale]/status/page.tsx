// src/app/[locale]/status/page.tsx

import type { Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { StatusPageClient } from './StatusPageClient';
import { listRoadmapTasks, type RoadmapTask, type TaskStatus } from '@/lib/content/task';
import '../../stylesheets/status.css';

type StatusPageParams = {
  locale: Locale;
};

type Props = {
  params: Promise<StatusPageParams>;
};

function statusLabel(status: TaskStatus, locale: Locale): string {
  if (locale === 'it') {
    switch (status) {
      case 'todo':
        return 'Da fare';
      case 'in_progress':
        return 'In corso';
      case 'done':
        return 'Completato';
      case 'blocked':
        return 'Bloccato';
    }
  }

  // fallback inglese
  switch (status) {
    case 'todo':
      return 'To do';
    case 'in_progress':
      return 'In progress';
    case 'done':
      return 'Done';
    case 'blocked':
      return 'Blocked';
  }
}

export default async function StatusPage({ params }: Props) {
  const { locale } = await params;
  const t = getMessages(locale);
  const text = t.status_page;

  // Supabase user (per idea board)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tasks da Sanity
  const tasks: RoadmapTask[] = await listRoadmapTasks();

  // Facciamo tre colonne: "In corso", "Prossimo", "Completato"
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const todo = tasks.filter((t) => t.status === 'todo');
  const done = tasks.filter((t) => t.status === 'done');
  const blocked = tasks.filter((t) => t.status === 'blocked');

  return (
    <main className="status-page">
      <header className="status-header">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </header>

      {/* ===== ROADMAP / STATO ===== */}
      <section className="status-section">
        <h2 className="status-section-title">{text.section_status_title}</h2>

        {tasks.length === 0 ? (
          <p className="status-empty">
            {locale === 'it'
              ? 'Ancora nessuna task configurata su Sanity.'
              : 'No tasks configured in Sanity yet.'}
          </p>
        ) : (
          <div className="status-columns">
            <div className="status-column">
              <h3 className="status-column-title">
                {locale === 'it' ? 'In corso' : 'In progress'}
              </h3>
              <ul className="status-task-list">
                {inProgress.map((task) => (
                  <li key={task.id} className="status-task status-task--in-progress">
                    <div className="status-task-header">
                      <span className="status-task-chip">
                        {statusLabel(task.status, locale)}
                      </span>
                      <h4 className="status-task-title">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="status-task-desc">{task.description}</p>
                    )}
                  </li>
                ))}
                {inProgress.length === 0 && (
                  <li className="status-task-empty">
                    {locale === 'it'
                      ? 'Niente in corso al momento.'
                      : 'Nothing in progress right now.'}
                  </li>
                )}
              </ul>
            </div>

            <div className="status-column">
              <h3 className="status-column-title">
                {locale === 'it' ? 'Prossimo' : 'Next up'}
              </h3>
              <ul className="status-task-list">
                {todo.map((task) => (
                  <li key={task.id} className="status-task status-task--todo">
                    <div className="status-task-header">
                      <span className="status-task-chip">
                        {statusLabel(task.status, locale)}
                      </span>
                      <h4 className="status-task-title">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="status-task-desc">{task.description}</p>
                    )}
                  </li>
                ))}
                {todo.length === 0 && (
                  <li className="status-task-empty">
                    {locale === 'it'
                      ? 'Per ora non ci sono task pianificate.'
                      : 'No upcoming tasks right now.'}
                  </li>
                )}
              </ul>
            </div>

            <div className="status-column">
              <h3 className="status-column-title">
                {locale === 'it' ? 'Completato' : 'Completed'}
              </h3>
              <ul className="status-task-list">
                {done.map((task) => (
                  <li key={task.id} className="status-task status-task--done">
                    <div className="status-task-header">
                      <span className="status-task-chip">
                        {statusLabel(task.status, locale)}
                      </span>
                      <h4 className="status-task-title">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="status-task-desc">{task.description}</p>
                    )}
                  </li>
                ))}
                {done.length === 0 && (
                  <li className="status-task-empty">
                    {locale === 'it'
                      ? 'Ancora nessuna task completata in questa roadmap (o non le hai segnate).'
                      : 'No completed tasks yet (or you have not marked them).'}
                  </li>
                )}
              </ul>

              {blocked.length > 0 && (
                <>
                  <h3 className="status-column-title status-column-title--blocked">
                    {locale === 'it' ? 'Bloccato' : 'Blocked'}
                  </h3>
                  <ul className="status-task-list">
                    {blocked.map((task) => (
                      <li key={task.id} className="status-task status-task--blocked">
                        <div className="status-task-header">
                          <span className="status-task-chip">
                            {statusLabel(task.status, locale)}
                          </span>
                          <h4 className="status-task-title">{task.title}</h4>
                        </div>
                        {task.description && (
                          <p className="status-task-desc">{task.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ===== IDEE COMMUNITY ===== */}
      <section className="status-section status-section--ideas">
        <h2 className="status-section-title">{text.section_ideas_title}</h2>
        <StatusPageClient locale={locale} userId={user?.id ?? null} />
      </section>
    </main>
  );
}