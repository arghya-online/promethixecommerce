"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Star, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "@/components/catalog/product-types";
import { formatPrice } from "@/components/catalog/product-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroProductsRowProps {
  products: Product[];
  loading?: boolean;
}

// Curated fallbacks in case product database has < 4 items or is syncing
const fallbackProducts = [
  {
    _id: "lithophane-photo-lamp",
    title: "Custom Lithophane Cylindrical Lamp",
    price: 1499,
    category: "Lamps & Lithophanes",
    images: ["/category-lamps.jpg"],
    stock: 12,
    material: "High-Opacity PLA+",
    badge: "Bestseller",
  },
  {
    _id: "precision-planetary-gearset",
    title: "Reinforced Planetary Gearset",
    price: 650,
    category: "Mechanical & Spares",
    images: ["/category-mechanical.jpg"],
    stock: 25,
    material: "Carbon-Fibre PETG",
    badge: "High Strength",
  },
  {
    _id: "collector-anime-resin-figurine",
    title: "Hyper-Detail SLA Collector Figurine",
    price: 899,
    category: "Figurines & Collectibles",
    images: ["/category-figurines.jpg"],
    stock: 8,
    material: "8K Tough Resin",
    badge: "100% 3D Printed",
  },
  {
    _id: "geometric-succulent-planter",
    title: "Low-Poly Geometric Desk Planter",
    price: 449,
    category: "Home & Desk Décor",
    images: ["/category-decor.jpg"],
    stock: 18,
    material: "Matte Stone PLA",
    badge: "Painted / Finished",
  },
];

export function HeroProductsRow({ products, loading = false }: HeroProductsRowProps) {
  // Use DB products if available, fallback to rich defaults
  const displayItems =
    products && products.length >= 4
      ? products.slice(0, 4)
      : fallbackProducts;

  return (
    <section className="py-10 sm:py-12 bg-background border-b border-border/80" aria-label="Featured 3D Prints">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff7336]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Creations</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-foreground mt-1">
              Popular 3D Printed Products
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1 max-w-xl">
              100% 3D printed in our studio—selectively painted and finished for striking visual realism.
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-foreground font-semibold hover:text-[#ff7336] hover:bg-secondary/60 self-start sm:self-auto group px-2.5"
          >
            <Link href="/shop" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* 1 Row Products Grid (horizontal scroll on mobile, 4-col on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          {displayItems.map((item, index) => {
            const imageSrc =
              item.images && item.images[0] ? item.images[0] : "/category-lamps.jpg";
            const productHref =
              "_id" in item && item._id && !item._id.startsWith("lithophane-")
                ? `/products/${item._id}`
                : "/shop";

            const itemTitle =
              "name" in item && item.name
                ? item.name
                : "title" in item && typeof item.title === "string"
                ? item.title
                : "3D Printed Product";

            return (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -5 }}
                className="group relative bg-surface border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#ff7336]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image & Badge */}
                <Link href={productHref} className="relative block aspect-square w-full overflow-hidden bg-foreground/5">
                  <Image
                    src={imageSrc}
                    alt={itemTitle}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Subtle Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <Badge
                      variant="secondary"
                      className="bg-background/90 text-foreground font-semibold text-[10px] sm:text-xs backdrop-blur-md border border-border shadow-xs"
                    >
                      {"badge" in item ? (item.badge as string) : "100% 3D Printed"}
                    </Badge>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mb-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>4.9</span>
                      <span className="text-foreground-muted font-normal">· Verified</span>
                    </div>

                    <Link href={productHref}>
                      <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground group-hover:text-[#ff7336] transition-colors line-clamp-1">
                        {itemTitle}
                      </h3>
                    </Link>

                    {"material" in item && (
                      <p className="text-[11px] text-foreground-muted line-clamp-1 mt-0.5">
                        {item.material as string}
                      </p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-border/60 mt-1">
                    <div>
                      <p className="font-heading font-extrabold text-sm sm:text-base text-foreground">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="h-8 px-2.5 sm:px-3 text-xs bg-[#ff7336] hover:bg-[#ff824c] text-white font-medium rounded-lg shadow-xs"
                    >
                      <Link href={productHref} className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
