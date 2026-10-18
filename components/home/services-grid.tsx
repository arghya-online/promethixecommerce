"use client";

import Link from "next/link";
import {
  Compass,
  Cpu,
  Wrench,
  Sparkles,
  Layers,
  Boxes,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { services } from "@/data/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const iconMap = {
  DraftingCompass: Compass,
  Cpu: Cpu,
  Wrench: Wrench,
  Sparkles: Sparkles,
  Layers: Layers,
  Boxes: Boxes,
};

export function ServicesGrid() {
  return (
    <section id="services" className="py-16 md:py-24 bg-[#141211] text-[#faf8f5] bg-cad-grid-dark relative overflow-hidden border-b border-[#2d2722]" aria-label="Consultancy & Manufacturing Services">
      {/* Ambient Orange Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-72 bg-[#d9531e]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-10 w-[420px] h-60 bg-[#d9531e]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff8a50] bg-[#ff7336]/15 border border-[#ff7336]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Engineering &amp; Production Services
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white mt-3">
            Product Consultancy &amp; Print Studio
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
            We don&apos;t just hit print. We collaborate with you on design optimization, CAD remodelling, tolerance tuning, and material science.
          </p>
        </motion.div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = iconMap[service.iconName] || Wrench;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="flex flex-col"
              >
                <Card className="group relative bg-[#1c1917]/95 border-[#2f2822] hover:border-[#ff7336]/70 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#ff7336]/10 transition-all duration-300 flex flex-col justify-between flex-1">
                  <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Header: Icon + Badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-[#ff7336]/15 text-[#ff8a50] flex items-center justify-center shrink-0 group-hover:bg-[#ff7336] group-hover:text-white transition-colors duration-300 shadow-xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-[#2a241f] text-zinc-300 border border-[#3e342b] text-[11px] font-semibold"
                        >
                          {service.badge}
                        </Badge>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-white group-hover:text-[#ff8a50] transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#ff8a50] mt-1">
                          {service.tagline}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Feature Bullets */}
                      <ul className="space-y-1.5 pt-1 text-xs text-zinc-300">
                        {service.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ff7336] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA & Tools Tags */}
                    <div className="pt-4 border-t border-[#2e2721] space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {service.materialsOrTools.slice(0, 3).map((tool, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#28211b] text-zinc-400 border border-[#382f27] px-2 py-0.5 rounded font-mono"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold border-[#443a32] text-white hover:bg-[#ff7336] hover:text-white hover:border-[#ff7336] transition-colors"
                      >
                        <Link href={service.ctaHref} className="flex items-center justify-center gap-1.5">
                          <span>{service.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
