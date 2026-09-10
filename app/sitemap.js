export default function sitemap() {
  const baseUrl = "https://haatbari.vercel.app";

  return [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/delivery`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), priority: 0.3 },
  ];
}
