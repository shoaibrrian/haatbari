import Link from "next/link";

const SECTIONS = [
  {
    title: "Using HaatBari",
    text: "By browsing or placing an order on HaatBari, you agree to use the platform honestly and only for lawful purposes. Account details you provide should be accurate and kept up to date.",
  },
  {
    title: "Orders & pricing",
    text: "Product prices, availability, and details are set by sellers and may change without prior notice. We aim to keep listings accurate, but occasional errors may be corrected before an order is confirmed.",
  },
  {
    title: "Payments & delivery",
    text: "HaatBari primarily operates on cash on delivery. Delivery timelines are estimates and may vary based on your location and courier availability.",
  },
  {
    title: "Returns & refunds",
    text: "Eligible products can be returned within 7 days of delivery, provided they meet our return conditions. Refunds are processed after the returned item is received and inspected.",
  },
  {
    title: "Account responsibility",
    text: "You are responsible for keeping your account credentials secure. HaatBari is not liable for actions taken through your account if credentials are shared or compromised.",
  },
  {
    title: "Changes to these terms",
    text: "These terms may be updated as HaatBari evolves. Continued use of the platform after updates means you accept the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="shell">
          <span className="eyebrow">LEGAL</span>

          <h1>
            Terms of
            <br />
            <em>service.</em>
          </h1>

          <p className="about-hero-text">
            These terms outline what to expect when using HaatBari — please take
            a moment to read them.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="about-process">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="kicker">THE DETAILS</span>
              <h2>What you&apos;re agreeing to.</h2>
            </div>

            <p>Last updated: September 2026.</p>
          </div>

          <div className="about-values-grid">
            {SECTIONS.map((section) => (
              <article className="about-value" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="about-promise">
        <div className="shell">
          <div className="about-promise-inner">
            <span className="kicker">QUESTIONS?</span>

            <h2>
              Need
              <br />
              clarification?
            </h2>

            <p>
              If anything in these terms is unclear, our support team is happy
              to walk you through it.
            </p>

            <Link href="/about" className="btn btn-ink">
              Contact us →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
