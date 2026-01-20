'use client';

import '../../stylesheets/methodology.css';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { usePathname } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';

export default function MethodologyPage() {
  const t = useI18n();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  // Se vuoi anche /metodologia in italiano:
  // crea una route separata oppure un redirect. Qui lasciamo solo /methodology
  // (così non devi impazzire con doppie pagine).

  return (
    <main className="methodology">
      <section className="methodology__hero">
        <div className="methodology__container">
          <div className="methodology__badge">{t.methodology.badge}</div>

          <div className="methodology__hero-grid">
            <div className="methodology__hero-left">
              <h1 className="methodology__title">{t.methodology.title}</h1>
              <p className="methodology__lead">{t.methodology.lead}</p>

              <div className="methodology__quick">
                <div className="methodology__quick-item">
                  <div className="methodology__quick-k">{t.methodology.quick_1_k}</div>
                  <div className="methodology__quick-v">{t.methodology.quick_1_v}</div>
                </div>
                <div className="methodology__quick-item">
                  <div className="methodology__quick-k">{t.methodology.quick_2_k}</div>
                  <div className="methodology__quick-v">{t.methodology.quick_2_v}</div>
                </div>
                <div className="methodology__quick-item">
                  <div className="methodology__quick-k">{t.methodology.quick_3_k}</div>
                  <div className="methodology__quick-v">{t.methodology.quick_3_v}</div>
                </div>
              </div>
            </div>

            <aside className="methodology__hero-right">
              <div className="methodology__panel">
                <h2 className="methodology__panel-title">{t.methodology.panel_title}</h2>
                <p className="methodology__panel-text">{t.methodology.panel_text}</p>

                <ul className="methodology__panel-list">
                  <li>{t.methodology.panel_bullet_1}</li>
                  <li>{t.methodology.panel_bullet_2}</li>
                  <li>{t.methodology.panel_bullet_3}</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="methodology__principles">
        <div className="methodology__container">
          <h2 className="methodology__section-title">{t.methodology.principles_title}</h2>
          <p className="methodology__section-subtitle">{t.methodology.principles_subtitle}</p>

          <div className="methodology__cards">
            <article className="methodology__card">
              <h3 className="methodology__card-title">{t.methodology.card_1_title}</h3>
              <p className="methodology__card-text">{t.methodology.card_1_text}</p>
              <p className="methodology__card-meta">{t.methodology.card_1_meta}</p>
            </article>

            <article className="methodology__card">
              <h3 className="methodology__card-title">{t.methodology.card_2_title}</h3>
              <p className="methodology__card-text">{t.methodology.card_2_text}</p>
              <p className="methodology__card-meta">{t.methodology.card_2_meta}</p>
            </article>

            <article className="methodology__card">
              <h3 className="methodology__card-title">{t.methodology.card_3_title}</h3>
              <p className="methodology__card-text">{t.methodology.card_3_text}</p>
              <p className="methodology__card-meta">{t.methodology.card_3_meta}</p>
            </article>

            <article className="methodology__card">
              <h3 className="methodology__card-title">{t.methodology.card_4_title}</h3>
              <p className="methodology__card-text">{t.methodology.card_4_text}</p>
              <p className="methodology__card-meta">{t.methodology.card_4_meta}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="methodology__content">
        <div className="methodology__container methodology__content-grid">
          <div className="methodology__text">
            <h2 className="methodology__section-title">{t.methodology.full_title}</h2>

            <p className="methodology__p">{t.methodology.p1}</p>
            <p className="methodology__p">{t.methodology.p2}</p>
            <p className="methodology__p">{t.methodology.p3}</p>
            <p className="methodology__p">{t.methodology.p4}</p>
            <p className="methodology__p">{t.methodology.p5}</p>
          </div>

          <aside className="methodology__callout">
            <h3 className="methodology__callout-title">{t.methodology.callout_title}</h3>
            <p className="methodology__callout-text">{t.methodology.callout_text}</p>

            <div className="methodology__callout-divider" />

            <div className="methodology__checklist">
              <div className="methodology__check">
                <span className="methodology__check-dot" />
                <span>{t.methodology.check_1}</span>
              </div>
              <div className="methodology__check">
                <span className="methodology__check-dot" />
                <span>{t.methodology.check_2}</span>
              </div>
              <div className="methodology__check">
                <span className="methodology__check-dot" />
                <span>{t.methodology.check_3}</span>
              </div>
            </div>

            <p className="methodology__callout-footnote">{t.methodology.callout_footnote}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
