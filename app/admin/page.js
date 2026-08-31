import Link from "next/link";

const stats = [
  {
    label: "Total orders",
    value: "—",
    note: "All time",
  },
  {
    label: "Pending orders",
    value: "—",
    note: "Need attention",
  },
  {
    label: "Products",
    value: "—",
    note: "In your catalog",
  },
  {
    label: "Revenue",
    value: "৳—",
    note: "All time",
  },
];

export default function AdminDashboard() {
  return (
    <main className="admin-page page-width">
      <header className="admin-header">
        <div>
          <p className="eyebrow">HaatBari administration</p>

          <h1>
            Good morning,
            <br />
            <em>Admin.</em>
          </h1>

          <p className="admin-subtitle">
            Manage your marketplace, orders and products from one place.
          </p>
        </div>

        <Link href="/" className="admin-store-link">
          View storefront <span>↗</span>
        </Link>
      </header>

      <section className="admin-stats" aria-label="Store overview">
        {stats.map((stat) => (
          <article className="admin-stat" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <section className="admin-content">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Manage</p>
            <h2>Store operations</h2>
          </div>
        </div>

        <div className="admin-actions">
          <Link href="/admin/orders" className="admin-action-card">
            <span className="admin-action-number">01</span>
            <div>
              <h3>Orders</h3>
              <p>
                Review customer orders, update delivery status and manage
                fulfilment.
              </p>
            </div>
            <span className="admin-action-arrow">↗</span>
          </Link>

          <Link href="/admin/products" className="admin-action-card">
            <span className="admin-action-number">02</span>
            <div>
              <h3>Products</h3>
              <p>
                Add, edit and manage the products available on your storefront.
              </p>
            </div>
            <span className="admin-action-arrow">↗</span>
          </Link>

          <Link href="/admin/inventory" className="admin-action-card">
            <span className="admin-action-number">03</span>
            <div>
              <h3>Inventory</h3>
              <p>
                Keep track of stock levels and identify products that need
                attention.
              </p>
            </div>
            <span className="admin-action-arrow">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
