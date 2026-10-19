"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { heroSlides, heroFloatingProducts, heroSocialProof } from "@/data/hero";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

export function HeroSlideshow() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      className="relative overflow-hidden bg-background  py-2 sm:py-2 lg:py-4"
      aria-label="Featured Highlights"
    >
      <div className="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-border shadow-md bg-foreground/5">
          {/* Persistent Top-Right High-Visibility "Shop Now" Pill Button */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
            <Button
              asChild
              size="sm"
              className="bg-[#ff7336] hover:bg-[#ff824c] text-white font-heading font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-xl shadow-[#ff7336]/40 border border-white/25 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <Link href="/shop" className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-12 transition-transform" />
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          <Carousel
            setApi={setApi}
            plugins={[autoplayPlugin.current]}
            opts={{
              loop: true,
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem
                  key={slide.id}
                  className="relative min-h-[580px] sm:min-h-[560px] lg:min-h-[620px] flex items-center"
                >
                  {/* Background Hero Image with Left-Side Scrim */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1300px) 100vw, 1300px"
                      className="object-cover object-center scale-[1.01] transition-transform duration-1000 ease-out"
                    />
                    {/* Seamless Left-to-Right Scrim for 100% Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-[1]" />
                    {/* Subtle bottom vignette for controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1]" />
                  </div>

                  {/* Slide Content: Vertically Centered on the Left */}
                  <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-16 py-12 sm:py-16 flex items-center min-h-[520px] sm:min-h-[560px] lg:min-h-[600px]">
                    <motion.div
                      key={current}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="max-w-xl md:max-w-2xl space-y-4 sm:space-y-5"
                    >
                      {/* Headline in Eye-Catching Space Grotesk */}
                      <h1 className="font-heading font-black text-3xl mb-8 sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white tracking-tight leading-[1.12] drop-shadow-md">
                        {slide.headline}
                      </h1>

                      {/* Subline in High-Legibility Inter */}
                      <p className="text-sm sm:text-base md:text-lg text-white/90 font-normal leading-relaxed drop-shadow-sm max-w-xl">
                        {slide.subline}
                      </p>

                      {/* CTAs: Mandatory Shop Now on every slide + Contextual Action */}
                      <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3.5">
                        <Button
                          asChild
                          size="lg"
                          className="bg-[#ff7336] hover:bg-[#ff824c] text-white font-bold shadow-xl shadow-[#ff7336]/40 h-12 sm:h-13 px-7 sm:px-8 text-sm sm:text-base rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 group"
                        >
                          <Link
                            href="/shop"
                            className="flex items-center gap-2.5"
                          >
                            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-rotate-12" />
                            <span>Shop Now</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>

                        {slide.secondaryCta && (
                          <Button
                            asChild
                            size="lg"
                            className="bg-white hover:bg-white/90 text-black border border-white/30 backdrop-blur-md font-semibold h-12 sm:h-13 px-6 text-sm sm:text-base rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02]"
                          >
                            <Link
                              href={slide.secondaryCta.href}
                              className="flex items-center gap-2"
                            >
                              <span>{slide.secondaryCta.label}</span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Arrows */}
            <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-8 z-20 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous slide"
                className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white border-white/25 backdrop-blur-md shadow-sm transition-all hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => api?.scrollNext()}
                aria-label="Next slide"
                className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white border-white/25 backdrop-blur-md shadow-sm transition-all hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-10 z-20 flex items-center gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    current === index
                      ? "w-8 bg-[#ff7336]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* Social Proof Row */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 transition-colors hover:border-[#ff7336]/40 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ff7336]/10 text-[#ff7336] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm sm:text-base text-foreground">
                {heroSocialProof.metric}
              </p>
              <p className="text-[11px] text-foreground-muted">
                Delivered Nationwide
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 transition-colors hover:border-[#ff7336]/40 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ff7336]/10 text-[#ff7336] flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm sm:text-base text-foreground">
                24-Hour
              </p>
              <p className="text-[11px] text-foreground-muted">
                Engineering Quote
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 transition-colors hover:border-[#ff7336]/40 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ff7336]/10 text-[#ff7336] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm sm:text-base text-foreground">
                Calipers QA
              </p>
              <p className="text-[11px] text-foreground-muted">
                Tolerance Verified
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 transition-colors hover:border-[#ff7336]/40 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ff7336]/10 text-[#ff7336] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm sm:text-base text-foreground">
                Direct Contact
              </p>
              <p className="text-[11px] text-foreground-muted">No Middlemen</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
