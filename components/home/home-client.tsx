"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/components/catalog/product-types";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { SiteFooter } from "@/components/navigation/site-footer";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { TwoPathSection } from "@/components/home/two-path-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { ProductCarouselSection } from "@/components/home/product-carousel-section";
import { ServicesGrid } from "@/components/home/services-grid";
import { QuickQuoteBlock } from "@/components/home/quick-quote-block";
import { ProcessSection } from "@/components/home/process-section";
import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";

export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/products?limit=8")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        if (data?.success && Array.isArray(data.products)) {
          setProducts(
            data.products.filter((p: Product) => p.isActive !== false),
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header */}
      <SiteHeader />

      <main className="flex-1">
        {/* 3. Hero image slideshow with autoplay */}
        <HeroSlideshow />

        {/* 4. Single-row featured products with motion animations */}
        <ProductCarouselSection products={products} loading={loadingProducts} />

        <ReviewsCarousel />

        {/* 5. Two-path split section: Shop vs Consultancy */}
        <TwoPathSection />

        {/* 5. Trust strip */}
        <TrustStrip />

        {/* 6. Category tiles (single responsive instance) */}
        <CategoryTiles />

        {/* 7. Ready-to-ship product carousel */}

        {/* 8. Consultancy services grid */}
        <ServicesGrid />

        {/* 9. Quick-quote block with file drop zone */}
        <QuickQuoteBlock />

        {/* 10. How it works stepper */}
        <ProcessSection />

        {/* 11. Customer reviews carousel (single instance) */}

        {/* 12. FAQs via shadcn accordion */}
        <FaqSection />

        {/* 13. Final CTA Banner */}
        <CtaBanner />
      </main>

      {/* 14. Redesigned Footer */}
      <SiteFooter />

      {/* 15. Mobile Sticky Bottom Tab Bar */}
      <MobileTabBar />
    </div>
  );
}
