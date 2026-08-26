import { Hind_Siliguri, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${bangla.variable}`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
