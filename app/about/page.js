import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Discover",
    text: "Browse products across multiple categories and discover what you need in one place.",
  },
  {
    number: "02",
    title: "Choose",
    text: "Compare products, explore details, and pick the option that fits you best.",
  },
  {
    number: "03",
    title: "Order",
    text: "Add your favorites to the cart and complete your order through a simple checkout.",
  },
  {
    number: "04",
    title: "Receive",
    text: "Sit back and wait for your order to arrive at your doorstep with convenient delivery.",
  },
];

const VALUES = [
  {
    title: "Simple shopping",
    text: "We keep the shopping experience clean, straightforward, and easy to navigate.",
  },
  {
    title: "A place for everything",
    text: "From electronics and fashion to home essentials, explore a growing range of products.",
  },
  {
    title: "Built around buyers",
    text: "Every part of HaatBari is designed to make discovering and purchasing products easier.",
  },
  {
    title: "Trust & transparency",
    text: "Clear product information, straightforward pricing, and a simple ordering experience.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="shell">
          <span className="kicker">OUR STORY</span>

          <h1>
            Shopping made
            <br />
            <em>simple.</em>
          </h1>

          <p className="about-hero-text">
            HaatBari is a modern online marketplace built to make everyday
            shopping simpler, more convenient, and more enjoyable.
          </p>

          <div className="about-hero-actions">
            <Link href="/shop" className="btn btn-ink">
              Start shopping →
            </Link>

            <Link href="/offers" className="about-text-link">
              Explore offers
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="about-intro">
        <div className="shell about-intro-grid">
          <div>
            <span className="kicker">WHY HAATBARI</span>
            <h2>
              One place.
              <br />
              Many possibilities.
            </h2>
          </div>

          <div className="about-intro-copy">
            <p>
              Online shopping should not feel complicated. HaatBari brings
              products from different categories together in one convenient
              marketplace, so you can discover what you need without jumping
              between different stores and platforms.
            </p>

            <p>
              Whether you are looking for a new gadget, something for your home,
              a wardrobe update, or everyday essentials, HaatBari is designed to
              give you a smooth path from discovery to checkout.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="about-process">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="kicker">HOW IT WORKS</span>
              <h2>From browsing to doorstep.</h2>
            </div>

            <p>
              A straightforward shopping experience, designed around the way
              customers actually shop.
            </p>
          </div>

          <div className="about-steps">
            {STEPS.map((step) => (
              <div className="about-step" key={step.number}>
                <span className="about-step-number">{step.number}</span>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="kicker">WHAT MATTERS TO US</span>
              <h2>Built for better shopping.</h2>
            </div>
          </div>

          <div className="about-values-grid">
            {VALUES.map((value) => (
              <article className="about-value" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Customer promise */}
      <section className="about-promise">
        <div className="shell">
          <div className="about-promise-inner">
            <span className="kicker">OUR PROMISE</span>

            <h2>
              Less searching.
              <br />
              More finding.
            </h2>

            <p>
              We are building HaatBari with one simple idea in mind: make online
              shopping feel easier. A place where discovering products, finding
              good value, and placing an order all happen naturally.
            </p>

            <Link href="/shop" className="btn btn-ink">
              Explore HaatBari →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
