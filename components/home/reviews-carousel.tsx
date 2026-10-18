"use client";

import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { reviews } from "@/data/reviews";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ReviewsCarousel() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-[#f3efe8] via-[#ede7dc] to-[#f3efe8] border-b border-border/80 relative overflow-hidden" aria-label="Customer Reviews">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-radial-warmth pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Customer Feedback
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mt-1">
            Trusted by Creators &amp; Engineers
          </h2>
          <p className="text-sm sm:text-base text-foreground-muted mt-2">
            Real experiences from people who ordered custom prints, gifts, and precision parts from our Kolkata studio.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((rev) => (
              <CarouselItem
                key={rev.id}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full bg-surface border-border hover:border-primary/40 rounded-xl transition-shadow hover:shadow-md flex flex-col justify-between">
                  <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-3">
                      {/* Rating Stars & Quote Icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-500 text-amber-500"
                            />
                          ))}
                        </div>
                        <Quote className="w-5 h-5 text-foreground-subtle/40" />
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-foreground-muted italic leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Author & Project Info */}
                    <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-heading font-bold text-foreground">
                          {rev.name}
                        </p>
                        <p className="text-[11px] text-foreground-subtle">
                          {rev.city}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{rev.project}</span>
                        </span>
                        {rev.date && (
                          <p className="text-[10px] text-foreground-subtle">
                            {rev.date}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="hidden sm:flex items-center justify-end gap-2 mt-6">
            <CarouselPrevious className="static translate-y-0 h-9 w-9 bg-surface hover:bg-secondary border-border" />
            <CarouselNext className="static translate-y-0 h-9 w-9 bg-surface hover:bg-secondary border-border" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
