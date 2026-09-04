"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE } from "@/components/Motion";

const STEPS = [
  {
    number: "01",
    title: "Find what you need",
    text: "Browse the catalogue and discover products selected for everyday life.",
  },
  {
    number: "02",
    title: "Place your order",
    text: "Choose what you want, select your delivery area and confirm your order.",
  },
  {
    number: "03",
    title: "Seller prepares",
    text: "Your seller receives the order and carefully prepares it for dispatch.",
  },
  {
    number: "04",
    title: "We deliver",
    text: "Your order makes its way to you and arrives at your doorstep.",
  },
  {
    number: "05",
    title: "Pay on delivery",
    text: "Pay when your order arrives. Simple, secure and straightforward.",
  },
  {
    number: "06",
    title: "Need a return?",
    text: "Eligible products can be returned within 7 days, subject to our return policy.",
  },
];

function load(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.65,
      delay,
      ease: EASE,
    },
  };
}

export default function DeliveryPage() {
  return (
    <main className="delivery-page">
      {/* HERO */}
      <section className="delivery-hero">
        <div className="shell">
          <motion.span className="eyebrow" {...load()}>
            HOW IT WORKS
          </motion.span>

          <motion.h1 {...load(0.08)}>
            From click
            <br />
            <em>to doorstep.</em>
          </motion.h1>

          <motion.p className="delivery-hero-text" {...load(0.16)}>
            Shopping should feel simple. Find what you need, place your order,
            and let HaatBari take care of the journey.
          </motion.p>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="delivery-journey">
        <div className="shell">
          <motion.div className="delivery-section-heading" {...load()}>
            <div>
              <span className="kicker">THE HAATBARI WAY</span>
              <h2>Six simple steps.</h2>
            </div>

            <p>
              From the moment you find something you like to the moment it
              reaches your door.
            </p>
          </motion.div>

          <div className="delivery-steps">
            {STEPS.map((step, index) => (
              <motion.article
                key={step.number}
                className="delivery-step"
                {...load(index * 0.04)}
              >
                <div className="delivery-step-top">
                  <span>{step.number}</span>
                  <span className="delivery-step-line" />
                </div>

                <div className="delivery-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY INFORMATION */}
      <section className="delivery-information dark">
        <div className="shell">
          <div className="delivery-information-grid">
            <motion.div {...load()}>
              <span className="eyebrow eyebrow-d">DELIVERY INFORMATION</span>

              <h2>
                Clear from
                <br />
                checkout to door.
              </h2>

              <p>
                We keep delivery straightforward, with clear charges and
                convenient cash-on-delivery payment.
              </p>
            </motion.div>

            <motion.div className="delivery-facts" {...load(0.1)}>
              <div className="delivery-fact">
                <span>Inside Dhaka</span>
                <strong>৳80</strong>
              </div>

              <div className="delivery-fact">
                <span>Outside Dhaka</span>
                <strong>৳150</strong>
              </div>

              <div className="delivery-fact">
                <span>Payment</span>
                <strong>Cash on Delivery</strong>
              </div>

              <div className="delivery-fact">
                <span>Returns</span>
                <strong>7 days</strong>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="delivery-final">
        <div className="shell">
          <motion.div {...load()}>
            <span className="kicker">READY TO SHOP?</span>

            <h2>Find something worth bringing home.</h2>

            <p>
              Explore the HaatBari catalogue and discover something made for
              your everyday.
            </p>

            <Link href="/shop" className="btn btn-ink">
              Explore the catalogue
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
