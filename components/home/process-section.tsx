"use client";

import { FileUp, Calculator, Printer, PackageCheck, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { processSteps } from "@/data/process";

const iconMap = {
  FileUp,
  Calculator,
  Printer,
  PackageCheck,
};

export function ProcessSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background bg-cad-grid relative border-b border-border/80 overflow-hidden" aria-label="Our Process">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff7336]">
            <Sparkles className="w-3.5 h-3.5" />
            Step by Step
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mt-1">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-foreground-muted mt-2">
            A frictionless workflow designed to take your idea, broken component, or 3D model directly to finished product.
          </p>
        </motion.div>

        {/* Stepper with connecting line */}
        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 bg-border -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {processSteps.map((step, idx) => {
              const Icon = iconMap[step.iconName] || FileUp;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className="relative flex flex-col bg-surface border border-border hover:border-[#ff7336]/40 rounded-xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group"
                >
                  {/* Step Number + Icon Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-[#ff7336]/40 group-hover:text-[#ff7336] transition-colors">
                      {step.step}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-[#ff7336]/10 text-[#ff7336] flex items-center justify-center shrink-0 group-hover:bg-[#ff7336] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-foreground group-hover:text-[#ff7336] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#ff7336] mt-0.5 mb-2">
                    {step.tagline}
                  </p>
                  <p className="text-xs text-foreground-muted leading-relaxed mb-4 flex-1">
                    {step.description}
                  </p>

                  <ul className="space-y-1.5 pt-3 border-t border-border/60 text-[11px] text-foreground-muted">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#ff7336] shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
