"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (mounted) setError(err.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = () => {
    alert("Searching");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-black text-3xl font-bold mb-6">Products</h1>

        <input
          value={query}
          type="text"
          placeholder="Search products..."
          className="w-full p-2 mb-6 border rounded text-black"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded mb-6"
          onClick={handleSearch}
        >
          Search
        </button>

        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : products.length === 0 ? (
          <div className="text-gray-700">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <article
                key={p._id || p.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                <div className="h-40 bg-gray-200 rounded-md overflow-hidden mb-4 cursor-pointer">
                  <img
                    src={p.image || "/placeholder.png"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-semibold text-lg mb-1">{p.name}</h2>
                <p className="text-gray-600 text-sm flex-1">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">
                    ${p.price}
                  </span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded">
                    View
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
