export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/cart", "/checkout", "/api/"],
    },
    sitemap: "https://haatbari.vercel.app/sitemap.xml",
  };
}
