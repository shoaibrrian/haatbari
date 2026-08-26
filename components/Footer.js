import Link from "next/link";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot-in">
          <div>
            <Link className="brand" href="/">
              <span className="mark">HB</span>
              <b>HaatBari</b>
            </Link>
            <p className="foot-note">
              Everyday goods from sellers across Bangladesh, delivered for ৳70
              flat.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li>
                <Link href="/#new">Electronics</Link>
              </li>
              <li>
                <Link href="/#new">Apparel</Link>
              </li>
              <li>
                <Link href="/#new">Footwear</Link>
              </li>
              <li>
                <Link href="/#new">Accessories</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li>
                <Link href="/about">Delivery</Link>
              </li>
              <li>
                <Link href="/about">Returns</Link>
              </li>
              <li>
                <Link href="/cart">Your cart</Link>
              </li>
              <li>
                <Link href="/checkout">Checkout</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">Our story</Link>
              </li>
              <li>
                <Link href="/about">Sell with us</Link>
              </li>
              <li>
                <Link href="/about">Privacy</Link>
              </li>
              <li>
                <Link href="/about">Terms</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-btm">
          <span>© 2026 HaatBari</span>
          <span>Cash on delivery · ৳70 flat</span>
        </div>
        <div className="word" aria-hidden="true">
          HaatBari
        </div>
      </div>
    </footer>
  );
}
