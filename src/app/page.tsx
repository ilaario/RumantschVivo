import Link from 'next/link';
import './stylesheets/home.css';

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero__left">
          <h1 className="hero__title">IMPARA IL ROMANCIO</h1>

          <p className="hero__subtitle">
            Impara la lingua storica del <strong>Canton Grigioni</strong>, parlata ancora oggi da
            circa <strong>60.000 persone</strong> in Svizzera. Un percorso chiaro e strutturato, con
            focus sul <strong>Sursilvan</strong>, tra lezioni brevi, vocabolario tematico e ripasso
            guidato.
          </p>

          <div className="hero__actions">
            <Link href="/learn" className="btn btn--primary">
              Inizia da zero
            </Link>
            <Link href="/about" className="btn btn--outline">
              Scopri il progetto
            </Link>
          </div>
        </div>

        <div className="hero__right" aria-hidden="true">
          {/* Sostituisci src con la tua mappa */}
          <img
              className="hero__svg"
              src="/images/logo2.png"
              alt="Mappa del Canton Grigioni"
            />
        </div>
      </section>

      <section className="about_us">
        <div className="about__left" aria-hidden="true">
          {/* Sostituisci src con la tua mappa */}
          <img
              className="about__svg"
              src="/images/graubuenden-map.svg"
              alt="Mappa del Canton Grigioni"
            />
        </div>

        <div className="about__right">
          <h1 className="about__title">ABOUT US</h1>
          <p className="about__subtitle">
            <strong>RumantschVivo</strong> è uno spazio dedicato al <strong>romancio</strong>, una lingua viva, ricca e spesso sottovalutata.
            Qui puoi impararla in modo semplice e pratico, <strong>anche partendo da zero</strong>.
          </p>
          <p className="about__subtitle">
            RumantschVivo nasce per rendere il romancio accessibile, comprensibile e usabile, senza complicazioni inutili.
          </p>
          <p className="about__subtitle">
            <strong>Perché una lingua vive solo se qualcuno la parla.</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
