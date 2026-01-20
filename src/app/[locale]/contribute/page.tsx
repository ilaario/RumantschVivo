'use client';

import '../../stylesheets/contribute.css';
import { useI18n } from '@/lib/i18n/i18nprovider';

export default function ContributePage() {
  const t = useI18n();

  return (
    <main className="contribute">
      <section className="contribute__hero">
        <div className="contribute__container">
          <span className="contribute__badge">{t.contribute.badge}</span>
          <h1 className="contribute__title">{t.contribute.title}</h1>
          <p className="contribute__lead">{t.contribute.lead}</p>
        </div>
      </section>

      <section className="contribute__section">
        <div className="contribute__container contribute__grid">
          {/* BLOCCO ITALIANO */}
          <article className="contribute__card">
            <h2 className="contribute__lang-heading">{t.contribute.it_heading}</h2>

            <p className="contribute__p">{t.contribute.it_p1}</p>
            <p className="contribute__p">{t.contribute.it_p2}</p>

            <ul className="contribute__list">
              <li className="contribute__list-item">
                <span className="contribute__dot" />
                <span>{t.contribute.it_b1}</span>
              </li>
              <li className="contribute__list-item">
                <span className="contribute__dot" />
                <span>{t.contribute.it_b2}</span>
              </li>
              <li className="contribute__list-item">
                <span className="contribute__dot" />
                <span>{t.contribute.it_b3}</span>
              </li>
            </ul>

            <p className="contribute__p">{t.contribute.it_p3}</p>

            <div className="contribute__email">
              <div className="contribute__email-label">
                {t.contribute.email_label_it}
              </div>
              <a
                href="mailto:contributors@rumantschvivo.it"
                className="contribute__email-link"
              >
                contributors@rumantschvivo.it
              </a>
            </div>
          </article>

          {/* BLOCCO ENGLISH */}
          <article className="contribute__card">
            <h2 className="contribute__lang-heading">{t.contribute.en_heading}</h2>

            <p className="contribute__p">{t.contribute.en_p1}</p>
            <p className="contribute__p">{t.contribute.en_p2}</p>

            <ul className="contribute__list">
              <li className="contribute__list-item">
                <span className="contribute__dot" />
                <span>{t.contribute.en_b1}</span>
              </li>
              <li className="contribute__list-item">
                <span className="contribute__dot" />
                <span>{t.contribute.en_b2}</span>
              </li>
              <li className="contribute__list-item">
                <span className="contribute__dot" />
                <span>{t.contribute.en_b3}</span>
              </li>
            </ul>

            <p className="contribute__p">{t.contribute.en_p3}</p>

            <div className="contribute__email">
              <div className="contribute__email-label">
                {t.contribute.email_label_en}
              </div>
              <a
                href="mailto:contributors@rumantschvivo.it"
                className="contribute__email-link"
              >
                contributors@rumantschvivo.it
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}