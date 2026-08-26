import { Hind_Siliguri, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionRoot from "@/components/Motion";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const bangla = Hind_Siliguri({
  variable: "--font-bangla",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "HaatBari — everyday goods, delivered",
    template: "%s · HaatBari",
  },
  description:
    "Electronics, apparel, footwear and accessories from sellers across Bangladesh. Cash on delivery, ৳70 flat.",
};

export const viewport = {
  themeColor: "#f1f2f4",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${bangla.variable}`}>
      <body>
        <MotionRoot>
          <Navbar />
          {children}
          <Footer />
        </MotionRoot>
      </body>
    </html>
  );
}
