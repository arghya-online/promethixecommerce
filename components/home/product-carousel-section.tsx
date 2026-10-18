"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, PackageCheck } from "lucide-react";
import type { Product } from "@/components/catalog/product-types";
import { ProductCard } from "@/components/catalog/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCarouselSection({
  products,
  loading = false,
}: {
  products: Product[];
  loading?: boolean;
}) {
  return (
    <section className="py-14 md:py-20 bg-background bg-cad-dots relative border-b border-border overflow-hidden" aria-label="Ready to ship products">
      <div className="absolute inset-0 bg-radial-warmth pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>In-Stock &amp; Ready to Ship</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mt-1">
              Popular 3D Prints
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted mt-2 max-w-xl">
              Precision crafted products, checked by our makers and dispatched within 24–48 hours across India.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent-strong transition-colors group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 bg-surface p-4 rounded-xl border border-border">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-border p-8">
            <p className="text-sm text-foreground-muted">No products currently displayed.</p>
            <Link href="/shop" className="text-sm font-semibold text-primary mt-2 inline-block">
              Visit the shop
            </Link>
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem
                  key={product._id}
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="h-full">
                    <ProductCard product={product} compact />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex items-center justify-end gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0 h-9 w-9 bg-surface hover:bg-secondary border-border" />
              <CarouselNext className="static translate-y-0 h-9 w-9 bg-surface hover:bg-secondary border-border" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}
