import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="subpage about-page">
      <section className="about-intro page-width">
        <p className="eyebrow">Why HaatBari exists</p>
        <h1>
          A better kind of
          <br />
          <em>neighbourhood.</em>
        </h1>
        <p className="intro-text">
          HaatBari is a shared shelf for the people who make Bangladesh feel
          like home. We bring good work into the light, and make it easier for
          neighbours to choose it.
        </p>
      </section>
      <section className="about-story page-width">
        <div className="story-graphic">
          <span>
            আমাদের
            <br />
            বাজার
          </span>
          <strong>
            OUR
            <br />
            HAAT
          </strong>
        </div>
        <div className="story-copy">
          <p className="eyebrow">A little more human</p>
          <h2>Every purchase has a person behind it.</h2>
          <p>
            From the hands that weave a nakshi kantha to the family that has
            perfected its spice blend, our sellers carry knowledge worth
            sharing. We curate everyday goods with a clear origin and a fairer
            path to your door.
          </p>
          <div className="values">
            <div>
              <strong>01</strong>
              <span>Local first</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Fair by design</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Made with care</span>
            </div>
          </div>
        </div>
      </section>
      <section className="about-cta">
        <div className="page-width">
          <h2>Keep the good close.</h2>
          <Link href="/#market" className="button button-light">
            Shop the edit <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
