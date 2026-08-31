"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const OFFERS = [
  {
    label: "FASHION",
    discount: "40% OFF",
    title: "Refresh your wardrobe",
    description:
      "Save on clothing, shoes, bags and accessories from selected sellers.",
    code: "FASHION40",
    condition: "On orders over ৳1,500",
  },
  {
    label: "ELECTRONICS",
    discount: "৳500 OFF",
    title: "Upgrade your tech",
    description:
      "Get exclusive savings on gadgets, accessories and everyday electronics.",
    code: "TECH500",
    condition: "On orders over ৳3,000",
  },
  {
    label: "HOME & LIVING",
    discount: "25% OFF",
    title: "Make home feel better",
    description:
      "Bring something new home with special discounts on selected products.",
    code: "HOME25",
    condition: "On selected products",
  },
  {
    label: "BEAUTY & CARE",
    discount: "30% OFF",
    title: "Care for less",
    description:
      "Special prices on skincare, makeup, hair care and personal care.",
    code: "CARE30",
    condition: "On orders over ৳1,000",
  },
  {
    label: "SPORTS & FITNESS",
    discount: "20% OFF",
    title: "Move more, spend less",
    description:
      "Gear up with offers on sportswear, fitness equipment and outdoor essentials.",
    code: "MOVE20",
    condition: "On selected products",
  },
  {
    label: "GROCERY & FOOD",
    discount: "৳300 OFF",
    title: "More value every day",
    description:
      "Save on everyday groceries, snacks, beverages and cooking essentials.",
    code: "SAVE300",
    condition: "On orders over ৳2,000",
  },
];

export default function OffersPage() {
  return (
    <main className="offers-page">
      {/* HERO */}
      <section className="offers-hero shell">
        <motion.div
          className="offers-hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="kicker">LIMITED TIME</span>

          <h1>
            Good deals.
            <br />
            Better finds.
          </h1>

          <p>
            Discover our latest offers and save more on the things you love. New
            deals are added regularly.
          </p>

          <Link href="/shop" className="btn btn-ink">
            Shop all products →
          </Link>
        </motion.div>

        <motion.div
          className="offers-hero-note"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <span>HaatBari</span>
          <strong>More value.</strong>
          <strong>Every order.</strong>
        </motion.div>
      </section>

      {/* OFFERS */}
      <section className="offers-section shell">
        <div className="offers-section-head">
          <div>
            <span className="kicker">SHOP & SAVE</span>
            <h2>Current offers</h2>
          </div>

          <p>
            Use the available offer code at checkout to enjoy your discount.
          </p>
        </div>

        <div className="offers-page-grid">
          {OFFERS.map((offer, index) => (
            <motion.article
              key={offer.code}
              className="offers-page-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: index * 0.06,
              }}
            >
              <div className="offers-page-card-top">
                <span className="offer-page-label">{offer.label}</span>
                <span className="offer-page-badge">OFFER</span>
              </div>

              <strong className="offers-page-discount">{offer.discount}</strong>

              <h3>{offer.title}</h3>

              <p className="offers-page-description">{offer.description}</p>

              <div className="offers-page-divider" />

              <div className="offers-page-code">
                <div>
                  <span>USE CODE</span>
                  <strong>{offer.code}</strong>
                </div>

                <span className="offer-condition">{offer.condition}</span>
              </div>

              <Link href="/shop" className="offers-page-link">
                Shop this offer <span>→</span>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {/* INFO */}
      <section className="offers-info shell">
        <div className="offers-info-inner">
          <div>
            <span className="kicker">GOOD TO KNOW</span>
            <h2>Simple offers, no surprises.</h2>
          </div>

          <div className="offers-info-list">
            <div>
              <span>01</span>
              <p>Offer codes can be applied during checkout.</p>
            </div>

            <div>
              <span>02</span>
              <p>Some offers may only apply to selected products.</p>
            </div>

            <div>
              <span>03</span>
              <p>Offers are available for a limited time while stocks last.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="offers-final shell">
        <span className="kicker">KEEP EXPLORING</span>

        <h2>There&apos;s always something worth finding.</h2>

        <p>
          Browse the full HaatBari collection and discover your next favorite.
        </p>

        <Link href="/shop" className="btn btn-ink">
          Explore the shop →
        </Link>
      </section>
    </main>
  );
}
