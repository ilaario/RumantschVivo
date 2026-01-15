import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="rm-footer">
      <div className="rm-footer__inner">
        {/* Colonna 1: brand + mission */}
        <div className="rm-footer__brand">
          <div className="rm-footer__brandTop">
            {/* Se non hai logo, togli l'img */}
            <img className="rm-footer__logo" src="/images/logo2.png" alt="RumantschVivo" />
            <div>
              <div className="rm-footer__name">RumantschVivo</div>
              <div className="rm-footer__tagline">
                Impara romancio. Preserva storie, parole e pronunce.
              </div>
            </div>
          </div>

          <p className="rm-footer__blurb">
            Un progetto educativo per rendere il romancio più accessibile, pratico e vivo, con lezioni
            brevi, esempi reali e contenuti culturali.
          </p>

          <p className="rm-footer__quote">
            <span className="rm-footer__quoteRm">«Bun di e a revair.»</span>
            <span className="rm-footer__quoteIt"> Piccole frasi, grande lingua.</span>
          </p>
        </div>

        {/* Colonna 2: Impara */}
        <div className="rm-footer__col">
          <div className="rm-footer__title">Impara</div>
          <ul className="rm-footer__links">
            <li>
              <Link href="/learn">Percorso A0</Link>
            </li>
            <li>
              <Link href="/learn">Percorso A1</Link>
            </li>
            <li>
              <Link href="/learn">Percorso A2</Link>
            </li>
            <li>
              <Link href="/wip">Frasi utili</Link>
            </li>
          </ul>
        </div>

        {/* Colonna 3: Lingua e cultura */}
        <div className="rm-footer__col">
          <div className="rm-footer__title">Lingua e cultura</div>
          <ul className="rm-footer__links">
            <li>
              <Link href="/wip">Vocabolario</Link>
            </li>
            <li>
              <Link href="/wip">Storie e testi</Link>
            </li>
            <li>
              <Link href="/wip">Pronuncia (audio)</Link>
            </li>
            <li>
              <Link href="/wip">Varianti (Sursilvan, Vallader…)</Link>
            </li>
          </ul>
        </div>

        {/* Colonna 4: Contribuisci */}
        <div className="rm-footer__col">
          <div className="rm-footer__title">Contribuisci</div>
          <ul className="rm-footer__links">
            <li>
              <Link href="/wip">Aggiungi una parola</Link>
            </li>
            <li>
              <Link href="/wip">Registra un audio</Link>
            </li>
            <li>
              <Link href="/wip">Segnala un errore</Link>
            </li>
            <li>
              <Link href="/wip">Fonti e licenze</Link>
            </li>
          </ul>

          <div className="rm-footer__social">
            {/* Se non usi Unicons, sostituisci con testo o SVG */}
            <a href="#" aria-label="Instagram">
              <i className="uil uil-instagram" />
            </a>
            <a href="#" aria-label="GitHub">
              <i className="uil uil-github" />
            </a>
            <a href="#" aria-label="Email">
              <i className="uil uil-envelope" />
            </a>
          </div>
        </div>
      </div>

      <div className="rm-footer__bottom">
        <div className="rm-footer__copy">© {year} RumantschVivo. Alcuni diritti riservati.</div>
        <div className="rm-footer__legal">
          <Link href="/wip">Privacy</Link>
          <span>·</span>
          <Link href="/wip">Termini</Link>
          <span>·</span>
          <Link href="/wip">Contatti</Link>
        </div>
      </div>
    </footer>
  );
}