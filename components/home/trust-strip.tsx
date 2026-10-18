"use client";

import { Home, Layers, Calculator, Truck } from "lucide-react";
import { motion } from "motion/react";

const trustDetails = [
  {
    title: "100% 3D Printed In-house",
    desc: "Printed & custom-finished in our Kolkata studio with zero middlemen.",
    icon: Home,
  },
  {
    title: "CAD help included",
    desc: "Send a drawing or broken part; we turn it into precision 3D CAD.",
    icon: Layers,
  },
  {
    title: "Fixed quote",
    desc: "Exact upfront quote before payment; zero surprise fees.",
    icon: Calculator,
  },
  {
    title: "Tracked shipping",
    desc: "Express shockproof shipping across all pin codes in India.",
    icon: Truck,
  },
];

export function TrustStrip() {
  return (
    <section className="py-7 bg-gradient-to-r from-[#f0eae0] via-[#f7f3ea] to-[#f0eae0] border-b border-border shadow-xs relative" aria-label="Why Choose Promethix3D">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trustDetails.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                whileHover={{ y: -2 }}
                className="flex items-start gap-3 p-2.5 rounded-lg transition-colors hover:bg-background/80"
              >
                <div className="w-9 h-9 rounded-lg bg-[#ff7336]/10 text-[#ff7336] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
