"use client";

import Link from "next/link";
import { CalendarCheck, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-16 md:py-24 bg-background bg-cad-dots relative overflow-hidden" aria-label="Ready to start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-foreground text-background p-8 sm:p-12 md:p-16 text-center border border-border shadow-xl"
        >
          {/* Subtle brand glow overlay */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#ff7336]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#ff7336]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#ff7336] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Let&apos;s Build Together</span>
            </span>

            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight text-white leading-tight">
              Where imagination gets reality.
            </h2>

            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl mx-auto">
              Ready to explore our 100% 3D printed catalog, or need precision CAD modelling and custom manufacturing? Our Kolkata studio is ready to build your vision.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <Button
                asChild
                size="lg"
                className="bg-[#ff7336] hover:bg-[#ff824c] text-white font-semibold shadow-lg shadow-[#ff7336]/30 h-12 px-7 transition-all duration-200"
              >
                <Link href="/custom-orders" className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book a Consultation</span>
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-white/90 text-[#181615] font-semibold h-12 px-7 shadow-md transition-all duration-200"
              >
                <Link href="/shop" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Products</span>
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
