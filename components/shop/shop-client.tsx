"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronRight,
  Package,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import type { Category, Product } from "@/components/catalog/product-types";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SortOrder = "newest" | "price-low" | "price-high" | "name";

export default function ShopClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?limit=100"),
        fetch("/api/categories"),
      ]);
      const prodData = await productsRes.json();
      const catData = await categoriesRes.json();

      if (!productsRes.ok || !prodData.success || !Array.isArray(prodData.products)) {
        throw new Error("Failed to load products");
      }

      if (categoriesRes.ok && catData.success && Array.isArray(catData.categories)) {
        setCategories(catData.categories.filter((c: Category) => c.isActive !== false));
      }

      setProducts(prodData.products.filter((p: Product) => p.isActive !== false));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // Read category from URL query parameters if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      const qParam = params.get("q");
      if (catParam) {
        setSelectedCategory(catParam);
      }
      if (qParam) {
        setSearchQuery(qParam);
      }
    }
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      // Category match
      if (selectedCategory) {
        const catId =
          typeof p.category === "string"
            ? p.category
            : p.category?._id ?? p.category?.slug;
        const catSlug =
          typeof p.category === "object" ? p.category?.slug : "";
        const catName =
          typeof p.category === "object" ? p.category?.name : "";
        if (
          catId !== selectedCategory &&
          catSlug !== selectedCategory &&
          (!catName || !catName.toLowerCase().includes(selectedCategory.toLowerCase()))
        ) {
          return false;
        }
      }

      // In stock filter
      if (onlyInStock && p.stock < 1) {
        return false;
      }

      // Search match
      if (q) {
        const matchName = p.name?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchMat = p.material?.toLowerCase().includes(q);
        return matchName || matchDesc || matchMat;
      }

      return true;
    });

    // Sort
    return list.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0; // Default newest
    });
  }, [products, searchQuery, selectedCategory, sort, onlyInStock]);

  const activeCategoryCount = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const id = typeof p.category === "object" ? p.category?._id : p.category;
      if (id) {
        map.set(id, (map.get(id) || 0) + 1);
      }
    });
    return map;
  }, [products]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setOnlyInStock(false);
    setSort("newest");
  };

  const hasActiveFilters =
    Boolean(selectedCategory) || Boolean(searchQuery) || onlyInStock || sort !== "newest";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        {/* Storefront Studio Header Band */}
        <section className="bg-gradient-to-b from-[#eee7dc] via-[#f7f4ee] to-background bg-cad-grid relative border-b border-border py-8 md:py-12 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-48 bg-radial-warmth pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs & Header */}
            <div className="space-y-3">
              <nav className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-foreground-subtle" />
                <span className="text-foreground font-semibold">Storefront</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div>
                  <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
                    Our Products
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section with subtle CAD dots texture */}
        <section className="py-8 md:py-12 bg-background bg-cad-dots">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search, Sort and Mobile Filter Controls Bar */}
            <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-3" />
              <Input
                type="search"
                placeholder="Search by name, description, material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 text-xs sm:text-sm bg-background h-10 border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-3 text-foreground-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-foreground-muted" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOrder)}
                  className="bg-background border border-border rounded-lg text-xs font-medium text-foreground px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Sort products"
                >
                  <option value="newest">Featured / Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Alphabetical (A–Z)</option>
                </select>
              </div>

              {/* Mobile Filter Sheet Trigger */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden text-xs flex items-center gap-1.5 border-border"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[320px] p-6 bg-background">
                  <SheetHeader className="pb-4 border-b border-border">
                    <SheetTitle className="font-heading text-lg font-bold">
                      Filter Catalog
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-5 space-y-6">
                    {/* Categories */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                        Category
                      </h4>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory("");
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg text-left transition-colors ${
                            !selectedCategory
                              ? "bg-primary text-white font-semibold"
                              : "text-foreground-muted hover:bg-secondary/70"
                          }`}
                        >
                          <span>All Categories</span>
                          <span className="text-[10px] opacity-80">{products.length}</span>
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat._id);
                              setMobileFilterOpen(false);
                            }}
                            className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg text-left transition-colors ${
                              selectedCategory === cat._id
                                ? "bg-primary text-white font-semibold"
                                : "text-foreground-muted hover:bg-secondary/70"
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] opacity-80">
                              {activeCategoryCount.get(cat._id) || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* In Stock toggle */}
                    <div className="pt-4 border-t border-border">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={onlyInStock}
                          onChange={(e) => setOnlyInStock(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>Only show in-stock items</span>
                      </label>
                    </div>

                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Main Layout: Desktop Sidebar + Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block bg-surface border border-border rounded-xl p-5 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Filter Products
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Categories
                </h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      !selectedCategory
                        ? "bg-primary text-white font-semibold"
                        : "text-foreground-muted hover:bg-secondary/70 hover:text-foreground"
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px] opacity-80">{products.length}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md text-left transition-colors ${
                        selectedCategory === cat._id
                          ? "bg-primary text-white font-semibold"
                          : "text-foreground-muted hover:bg-secondary/70 hover:text-foreground"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-[10px] opacity-80 shrink-0">
                        {activeCategoryCount.get(cat._id) || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Stock Filter */}
              <div className="pt-4 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Ready to Ship Only</span>
                </label>
              </div>

              {/* Need Custom Help Card */}
              <div className="pt-4 border-t border-border">
                <div className="bg-secondary/60 rounded-lg p-3 text-xs space-y-1.5">
                  <p className="font-semibold text-foreground">Can&apos;t find what you need?</p>
                  <p className="text-foreground-muted text-[11px] leading-relaxed">
                    We fabricate custom models, prototypes, and obsolete parts.
                  </p>
                  <Button asChild size="xs" variant="outline" className="w-full text-[11px] mt-1 bg-surface">
                    <Link href="/custom-orders">Custom Order &rarr;</Link>
                  </Button>
                </div>
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Results count & active tags */}
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span>
                  Showing <strong>{filteredProducts.length}</strong> product
                  {filteredProducts.length === 1 ? "" : "s"}
                </span>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={clearFilters}
                    className="text-xs text-primary hover:text-accent-strong"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-surface border border-border rounded-xl p-4 space-y-3"
                    >
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-surface border border-border rounded-xl p-8 space-y-3">
                  <p className="text-sm font-semibold text-destructive">
                    Unable to load products. Please check your connection.
                  </p>
                  <Button onClick={() => void loadProducts()} size="sm">
                    Retry
                  </Button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-dashed border-border rounded-xl p-8 space-y-3">
                  <Package className="w-12 h-12 text-foreground-subtle/50 mx-auto" />
                  <h3 className="font-heading font-bold text-base text-foreground">
                    No products match your criteria
                  </h3>
                  <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                    Try adjusting your search terms or clearing your category filters.
                  </p>
                  <Button onClick={clearFilters} size="sm" variant="outline" className="mt-2 text-xs">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </section>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
