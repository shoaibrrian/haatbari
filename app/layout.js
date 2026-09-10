import { ClerkProvider } from "@clerk/nextjs";
import { Hind_Siliguri, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionRoot from "@/components/Motion";
import Providers from "./providers";
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
  metadataBase: new URL("https://haatbari.vercel.app"),
  openGraph: {
    title: "HaatBari — everyday goods, delivered",
    description:
      "Electronics, apparel, footwear and accessories from sellers across Bangladesh. Cash on delivery, ৳70 flat.",
    url: "https://haatbari.vercel.app",
    siteName: "HaatBari",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HaatBari",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HaatBari — everyday goods, delivered",
    description:
      "Electronics, apparel, footwear and accessories from sellers across Bangladesh. Cash on delivery, ৳70 flat.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#f1f2f4",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${bangla.variable}`}>
      <body>
        <ClerkProvider>
          <Providers>
            <MotionRoot>
              <Navbar />
              {children}
              <Footer />
            </MotionRoot>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
