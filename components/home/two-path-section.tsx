"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBag, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TwoPathSection() {
  return (
    <section className="py-14 md:py-20 bg-background bg-cad-grid relative border-b border-border overflow-hidden" aria-label="Our Dual Expertise">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-radial-warmth pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7336]">
            How Can We Help You?
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mt-1">
            Choose Your Path
          </h2>
          <p className="text-sm sm:text-base text-foreground-muted mt-2">
            Whether you are shopping for a unique 3D printed gift or engineering an industrial prototype, Promethix3D has the tools and expertise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Path 1: Shop Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -6 }}
            className="flex flex-col"
          >
            <Card className="overflow-hidden border-border bg-surface hover:shadow-lg hover:border-[#ff7336]/40 transition-all duration-300 flex flex-col flex-1 group">
              <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-secondary">
                <Image
                  src="/category-lamps.jpg"
                  alt="3D printed lamps, figurines and home gifts"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#ff7336] bg-white px-2.5 py-0.5 rounded shadow-xs mb-1">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Ready &amp; Made-to-Order
                  </span>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                    Shop 3D Printed Products
                  </h3>
                </div>
              </div>

              <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <ul className="space-y-3 text-sm text-foreground-muted">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ff7336] shrink-0 mt-0.5" />
                    <span>
                      <strong>Personalised photo lamps</strong> &amp; ambient lithophanes 100% 3D printed with your photos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ff7336] shrink-0 mt-0.5" />
                    <span>
                      <strong>Ultra-sharp SLA figurines</strong>, deity idols, and display models artistically painted for a striking finish.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ff7336] shrink-0 mt-0.5" />
                    <span>
                      <strong>Modern desk accessories &amp; décor</strong> ready to ship with express pan-India delivery.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Button asChild size="lg" className="w-full bg-[#ff7336] hover:bg-[#ff824c] text-white font-semibold shadow-md shadow-[#ff7336]/20">
                    <Link href="/shop" className="flex items-center justify-center gap-2">
                      <span>Shop All Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Path 2: Product Consultancy & Custom Parts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -6 }}
            className="flex flex-col"
          >
            <Card className="overflow-hidden border-border bg-surface hover:shadow-lg hover:border-foreground/30 transition-all duration-300 flex flex-col flex-1 group">
              <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-secondary">
                <Image
                  src="/category-prototypes.jpg"
                  alt="CAD modelling, reverse engineering and prototype fabrication"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground bg-white px-2.5 py-0.5 rounded shadow-xs mb-1">
                    <Wrench className="w-3.5 h-3.5 text-[#ff7336]" />
                    Engineering &amp; Prototyping
                  </span>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                    Product Consultancy &amp; Custom Parts
                  </h3>
                </div>
              </div>

              <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <ul className="space-y-3 text-sm text-foreground-muted">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ff7336] shrink-0 mt-0.5" />
                    <span>
                      <strong>Napkin sketch to 3D CAD:</strong> We audit wall thickness, snap-fits, and manufacturing feasibility.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ff7336] shrink-0 mt-0.5" />
                    <span>
                      <strong>Reverse engineer broken parts:</strong> Reconstruct obsolete gears, brackets, and appliance components.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ff7336] shrink-0 mt-0.5" />
                    <span>
                      <strong>Engineering polymers:</strong> High-temperature PETG, ABS, flexible TPU, and Carbon-Fibre blends.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Button asChild size="lg" variant="default" className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold shadow-md">
                    <Link href="/custom-orders" className="flex items-center justify-center gap-2">
                      <span>Book a Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
