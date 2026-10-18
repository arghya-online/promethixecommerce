"use client";

import { ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

const TRUST_ITEMS = [
  "Made in-house",
  "CAD help included",
  "Fixed quote before you pay",
  "Tracked shipping across India",
];

function TrustIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7" />
      <path d="m5.5 9 2.2 2.2 4.8-5" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="clean-hero" aria-labelledby="hero-title">
      <div className="content-width clean-hero-layout">
        <div className="clean-hero-copy">
          <p className="clean-eyebrow">CUSTOM 3D PRINTING · KOLKATA</p>
          <h1 id="hero-title" className="font-heading clean-hero-heading">
            Your idea, <span>3D printed</span> to perfection.
          </h1>
          <p className="clean-hero-description">
            Gifts, figurines, working parts and prototypes. Send a sketch or a
            broken part, and we&apos;ll design it, print it in our workshop and
            ship it across India with tracking.
          </p>

          <div className="clean-hero-cta-row">
            <Link
              href="/custom-orders"
              className="clean-btn clean-btn--primary"
            >
              Custom Order{" "}
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/shop" className="clean-btn clean-btn--secondary">
              Shop Now
            </Link>
          </div>

          <p className="clean-hero-microcopy">
            Free review · No commitment · Reply within 24 hours
          </p>

          <div
            className="clean-hero-trust-strip"
            aria-label="Why choose Promethix3D"
          >
            {TRUST_ITEMS.map((item) => (
              <span className="clean-hero-trust-item" key={item}>
                <TrustIcon />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="clean-hero-visual">
          <div className="clean-hero-image-frame">
            <Image
              src="/hero-print.jpg"
              alt="A detailed 3D printed product made by the Promethix3D workshop"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="clean-hero-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
