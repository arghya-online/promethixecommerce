"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { categories } from "@/data/categories";
import { Badge } from "@/components/ui/badge";

export function CategoryTiles() {
  return (
    <section id="categories" className="py-14 md:py-20 bg-gradient-to-b from-[#f8f5ee] via-[#f4efe8] to-[#f8f5ee] bg-cad-grid relative border-b border-border/80 overflow-hidden" aria-label="Product Categories">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff7336]">
              <Sparkles className="w-3.5 h-3.5" />
              What We Make
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mt-1">
              Explore Our Categories
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted mt-2 max-w-xl">
              From personalised home lighting to precision engineering components, explore our 100% 3D printed additive manufacturing catalog.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff7336] hover:text-[#ff824c] transition-colors group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Responsive Grid with motion stagger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="flex flex-col"
            >
              <Link
                href={cat.href}
                className="group relative flex flex-col flex-1 bg-surface rounded-xl overflow-hidden border border-border hover:border-[#ff7336]/50 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-secondary">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/95 text-foreground text-[10px] font-semibold border-none shadow-xs">
                      {cat.badge}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#ff7336] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="pt-3 flex items-center text-xs font-semibold text-[#ff7336] group-hover:text-[#ff824c]">
                    <span>{cat.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
