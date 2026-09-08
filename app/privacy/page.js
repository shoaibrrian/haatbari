import Link from "next/link";

const SECTIONS = [
  {
    title: "Information we collect",
    text: "When you create an account or place an order on HaatBari, we collect basic details such as your name, phone number, delivery address, and order history. This information is used only to process your orders and improve your shopping experience.",
  },
  {
    title: "How we use your information",
    text: "Your information helps us confirm orders, arrange delivery, provide customer support, and keep you updated about your purchases. We do not sell your personal information to third parties.",
  },
  {
    title: "Payment & delivery details",
    text: "HaatBari primarily supports cash on delivery. Any delivery address and contact details you provide are shared only with our delivery partners, solely for the purpose of completing your order.",
  },
  {
    title: "Cookies & browsing data",
    text: "We use basic cookies to keep your cart, wishlist, and login session working smoothly across visits. This data is used to improve site performance, not for external advertising.",
  },
  {
    title: "Your control over your data",
    text: "You can review, update, or request deletion of your account information at any time by contacting our support team or through your account settings.",
  },
  {
    title: "Changes to this policy",
    text: "As HaatBari grows, this policy may be updated to reflect new features or requirements. Continued use of the platform after changes means you accept the updated policy.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="shell">
          <span className="eyebrow">LEGAL</span>

          <h1>
            Privacy
            <br />
            <em>policy.</em>
          </h1>

          <p className="about-hero-text">
            We take your privacy seriously. Here is a clear explanation of what
            information we collect and how it is used across HaatBari.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="about-process">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="kicker">THE DETAILS</span>
              <h2>How your data is handled.</h2>
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
              We&apos;re here
              <br />
              to help.
            </h2>

            <p>
              If you have any questions about how your information is handled,
              reach out to our support team any time.
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
