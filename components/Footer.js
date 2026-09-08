import Link from "next/link";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot-in">
          <div>
            <Link className="brand" href="/">
              <img src="/logo.png" alt="HaatBari" className="logo" />
              <b>HaatBari</b>
            </Link>
            <p className="foot-note">
              Everyday goods from sellers across Bangladesh, delivered to your
              doorstep.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul className="foot-shop-list">
              <li>
                <Link href="/shop?category=Electronics">Electronics</Link>
              </li>
              <li>
                <Link href="/shop?category=Fashion">Fashion</Link>
              </li>
              <li>
                <Link href="/shop?category=Home+%26+Living">Home & Living</Link>
              </li>
              <li>
                <Link href="/shop?category=Beauty+%26+Care">Beauty & Care</Link>
              </li>
              <li>
                <Link href="/shop?category=Sports+%26+Fitness">
                  Sports & Fitness
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Books+%26+Stationery">
                  Books & Stationery
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Grocery+%26+Food">
                  Grocery & Food
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Automotive">Automotive</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Help</h4>
            <ul>
              <li>
                <Link href="/delivery">Delivery</Link>
              </li>
              <li>
                <Link href="/orders">Returns</Link>
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
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-btm">
          <span>© 2026 HaatBari. All rights reserved.</span>
          <span>Designed & Developed by Shoaib Rahman Rian</span>
        </div>

        <div className="word" aria-hidden="true">
          HaatBari
        </div>
      </div>
    </footer>
  );
}
