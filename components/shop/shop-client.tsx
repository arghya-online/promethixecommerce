"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import type { Product } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

type SortOrder = "newest" | "price-low" | "price-high" | "name";

function ProductSkeleton() {
  return (
    <div className="product-card product-skeleton" aria-hidden="true">
      <div className="skeleton-block" />
      <div className="skeleton-line skeleton-line-short" />
      <div className="skeleton-line" />
    </div>
  );
}

export default function ShopClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products?limit=100");
      const data = await response.json();

      if (!response.ok || !data.success || !Array.isArray(data.products)) {
        throw new Error("Products could not be loaded");
      }

      setProducts((data.products as Product[]).filter((product) => product.isActive === true));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(request);
  }, [loadProducts]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? products.filter((product) =>
          `${product.name} ${product.description} ${product.material ?? ""} ${product.dimensions ?? ""}`.toLowerCase().includes(normalizedQuery),
        )
      : [...products];

    return filtered.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, query, sort]);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="shop-intro">
          <Container>
            <p className="eyebrow">The collection</p>
            <h1 className="font-heading page-title">Objects for considered spaces.</h1>
            <p className="page-intro">
              A growing collection of useful, tactile pieces designed and 3D-printed by
              Promethix3D.
            </p>
          </Container>
        </section>

        <section className="shop-content">
          <Container>
            <div className="shop-toolbar">
              <label className="search-field">
                <MagnifyingGlass size={18} aria-hidden="true" />
                <span className="sr-only">Search products</span>
                <input
                  type="search"
                  placeholder="Search products"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                    <X size={17} aria-hidden="true" />
                  </button>
                ) : null}
              </label>
              <label className="sort-field">
                <span>Sort</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>

            {loading ? (
              <div className="product-grid" aria-label="Loading products">
                {Array.from({ length: 8 }, (_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="shop-state" role="alert">
                <p>We could not load the collection.</p>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setLoading(true);
                    setError(false);
                    void loadProducts();
                  }}
                >
                  Try again
                </button>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="shop-state">
                <p>{products.length === 0 ? "New objects are on the way." : "No products match your search."}</p>
                {query ? (
                  <button type="button" className="text-button" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>
    </div>
  );
}
