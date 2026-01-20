'use client';

import '../../stylesheets/contributors.css';
import { useI18n } from '@/lib/i18n/i18nprovider';

export default function ContributePage() {
  const t = useI18n();

  return (
    <main className="contributors">
      <section className="contributors__hero">
        <div className="contributors__container">
          <div className="contributors__badge">{t.contributors.badge}</div>

          <div className="contributors__hero-grid">
            <div className="contributors__hero-left">
              <h1 className="contributors__title">{t.contributors.title}</h1>
              <p className="contributors__lead">{t.contributors.lead}</p>

              <div className="contributors__highlights">
                <div className="contributors__highlight">
                  <div className="contributors__highlight-k">{t.contributors.h1_k}</div>
                  <div className="contributors__highlight-v">{t.contributors.h1_v}</div>
                </div>
                <div className="contributors__highlight">
                  <div className="contributors__highlight-k">{t.contributors.h2_k}</div>
                  <div className="contributors__highlight-v">{t.contributors.h2_v}</div>
                </div>
                <div className="contributors__highlight">
                  <div className="contributors__highlight-k">{t.contributors.h3_k}</div>
                  <div className="contributors__highlight-v">{t.contributors.h3_v}</div>
                </div>
              </div>
            </div>

            <aside className="contributors__hero-right">
              <div className="contributors__panel">
                <h2 className="contributors__panel-title">{t.contributors.panel_title}</h2>
                <p className="contributors__panel-text">{t.contributors.panel_text}</p>

                <div className="contributors__panel-note">
                  <div className="contributors__panel-note-title">
                    {t.contributors.panel_note_title}
                  </div>
                  <div className="contributors__panel-note-text">
                    {t.contributors.panel_note_text}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="contributors__section">
        <div className="contributors__container">
          <h2 className="contributors__section-title">{t.contributors.who_title}</h2>
          <p className="contributors__section-subtitle">{t.contributors.who_subtitle}</p>

          <ul className="contributors__list">
            <li className="contributors__list-item">
              <span className="contributors__dot" />
              <span>{t.contributors.who_1}</span>
            </li>
            <li className="contributors__list-item">
              <span className="contributors__dot" />
              <span>{t.contributors.who_2}</span>
            </li>
            <li className="contributors__list-item">
              <span className="contributors__dot" />
              <span>{t.contributors.who_3}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="contributors__section contributors__section--alt">
        <div className="contributors__container">
          <h2 className="contributors__section-title">{t.contributors.how_title}</h2>
          <p className="contributors__section-subtitle">{t.contributors.how_subtitle}</p>

          <div className="contributors__steps">
            <article className="contributors__step">
              <div className="contributors__step-n">1</div>
              <div>
                <h3 className="contributors__step-title">{t.contributors.how_1_t}</h3>
                <p className="contributors__step-text">{t.contributors.how_1_p}</p>
              </div>
            </article>

            <article className="contributors__step">
              <div className="contributors__step-n">2</div>
              <div>
                <h3 className="contributors__step-title">{t.contributors.how_2_t}</h3>
                <p className="contributors__step-text">{t.contributors.how_2_p}</p>
              </div>
            </article>

            <article className="contributors__step">
              <div className="contributors__step-n">3</div>
              <div>
                <h3 className="contributors__step-title">{t.contributors.how_3_t}</h3>
                <p className="contributors__step-text">{t.contributors.how_3_p}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="contributors__section">
        <div className="contributors__container contributors__two-col">
          <div className="contributors__col">
            <h2 className="contributors__section-title">{t.contributors.expect_title}</h2>
            <p className="contributors__section-subtitle">{t.contributors.expect_subtitle}</p>

            <ul className="contributors__list">
              <li className="contributors__list-item">
                <span className="contributors__dot" />
                <span>{t.contributors.expect_1}</span>
              </li>
              <li className="contributors__list-item">
                <span className="contributors__dot" />
                <span>{t.contributors.expect_2}</span>
              </li>
              <li className="contributors__list-item">
                <span className="contributors__dot" />
                <span>{t.contributors.expect_3}</span>
              </li>
              <li className="contributors__list-item">
                <span className="contributors__dot" />
                <span>{t.contributors.expect_4}</span>
              </li>
            </ul>
          </div>

          <div className="contributors__col">
            <h2 className="contributors__section-title">{t.contributors.offer_title}</h2>
            <p className="contributors__section-subtitle">{t.contributors.offer_subtitle}</p>

            <ul className="contributors__list">
              <li className="contributors__list-item">
                <span className="contributors__dot contributors__dot--good" />
                <span>{t.contributors.offer_1}</span>
              </li>
              <li className="contributors__list-item">
                <span className="contributors__dot contributors__dot--good" />
                <span>{t.contributors.offer_2}</span>
              </li>
              <li className="contributors__list-item">
                <span className="contributors__dot contributors__dot--good" />
                <span>{t.contributors.offer_3}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="contributors__footer">
        <div className="contributors__container">
          <div className="contributors__warning">
            <h2 className="contributors__warning-title">{t.contributors.warning_title}</h2>
            <p className="contributors__warning-text">{t.contributors.warning_text}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
