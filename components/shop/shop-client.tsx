"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import type { Category, Product } from "@/components/catalog/product-types";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/products?limit=100"),
        fetch("/api/categories"),
      ]);
      const data = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (
        !productsResponse.ok ||
        !data.success ||
        !Array.isArray(data.products)
      ) {
        throw new Error("Products could not be loaded");
      }

      if (
        categoriesResponse.ok &&
        categoriesData.success &&
        Array.isArray(categoriesData.categories)
      ) {
        setCategories(
          (categoriesData.categories as Category[]).filter(
            (category) => category.isActive,
          ),
        );
      }

      setProducts(
        (data.products as Product[]).filter(
          (product) => product.isActive === true,
        ),
      );
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
    const categoryFiltered = selectedCategory
      ? products.filter((product) => {
          const category =
            typeof product.category === "string"
              ? product.category
              : product.category?._id ?? product.category?.slug;
          return category === selectedCategory;
        })
      : products;
    const filtered = normalizedQuery
      ? categoryFiltered.filter((product) =>
          `${product.name} ${product.description} ${product.material ?? ""} ${product.dimensions ?? ""}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : [...categoryFiltered];

    return filtered.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, query, selectedCategory, sort]);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
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
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={17} aria-hidden="true" />
                  </button>
                ) : null}
              </label>
              {categories.length > 0 ? (
                <nav className="shop-categories" aria-label="Shop categories">
                <button
                  type="button"
                  className={!selectedCategory ? "is-active" : ""}
                  onClick={() => setSelectedCategory("")}
                >
                  All products
                </button>
                {categories.map((category) => (
                  <button
                    type="button"
                    className={
                      selectedCategory === category._id ? "is-active" : ""
                    }
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                  >
                    {category.name}
                  </button>
                ))}
                </nav>
              ) : null}
              <label className="sort-field">
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOrder)}
                >
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
                <p>
                  {products.length === 0
                    ? "New objects are on the way."
                    : "No products match your filters."}
                </p>
                {query ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </button>
                ) : null}
                {selectedCategory ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setSelectedCategory("")}
                  >
                    Show all categories
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
