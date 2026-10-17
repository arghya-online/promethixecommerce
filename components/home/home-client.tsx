"use client";

import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Image as ImageIcon,
  MapPin,
  Package,
  PhoneCall,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { type Product } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";
import { HomeMarquee } from "@/components/home/home-marquee";
import { HeroChakra } from "@/components/home/hero-chakras";

/* ─── Intersection-reveal hook ─────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(22px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Image placeholder ─────────────────────────────────── */
function ImgPlaceholder({
  filename,
  width,
  height,
  label,
  className = "",
}: {
  filename: string;
  width: number;
  height: number;
  label: string;
  className?: string;
}) {
  return (
    <div className={`img-placeholder ${className}`} aria-hidden="true">
      <span className="img-placeholder-icon">
        <ImageIcon size={28} weight="duotone" />
      </span>
      <span className="img-placeholder-label">{label}</span>
      <code className="img-placeholder-file">/public/{filename}</code>
      <span className="img-placeholder-dims">
        {width} × {height} px
      </span>
    </div>
  );
}

/* ─── Static category data ──────────────────────────────── */
const STATIC_CATEGORIES = [
  {
    id: "figurines",
    label: "Figurines & Collectibles",
    description: "Miniatures, statues, busts, and display pieces.",
    filename: "category-figurines.jpg",
    href: "/shop",
  },
  {
    id: "gifts",
    label: "Personalized Gifts",
    description:
      "Keychains, nameplates, event mementoes, and customized keepsakes.",
    filename: "category-gifts.jpg",
    href: "/shop",
  },
  {
    id: "lamps",
    label: "Lamps & Photo Art",
    description:
      "Decorative lamps, illuminated lithophanes, and 3D photo keepsakes.",
    filename: "category-lamps.jpg",
    href: "/shop",
  },
  {
    id: "decor",
    label: "Home & Desk Decor",
    description: "Mini decor, organizers, sculptures, and decorative objects.",
    filename: "category-decor.jpg",
    href: "/shop",
  },
  {
    id: "mechanical",
    label: "Mechanical & Robotics Parts",
    description:
      "Functional components, mounts, enclosures, gears, and custom engineering parts.",
    filename: "category-mechanical.jpg",
    href: "/shop",
  },
  {
    id: "prototypes",
    label: "Prototypes & Custom Prints",
    description:
      "Concept models, fit-check parts, and products developed from customer requirements.",
    filename: "category-prototypes.jpg",
    href: "/custom-orders",
  },
];

/* ─── Process steps ─────────────────────────────────────── */
const PROCESS_STEPS = [
  {
    number: "01",
    title: "Share Your Idea",
    body: "Upload a reference image, sketch, description, or functional requirement. No CAD file needed.",
  },
  {
    number: "02",
    title: "Discuss the Design",
    body: "We consult on dimensions, material, process, and feasibility — and refine the 3D model if needed.",
  },
  {
    number: "03",
    title: "Print & Finish",
    body: "We select the right process, manufacture the part, and complete any agreed finishing work.",
  },
  {
    number: "04",
    title: "Deliver the Result",
    body: "The finished object is packed carefully and dispatched to your address.",
  },
];

/* ─── FDM & SLA materials ───────────────────────────────── */
const FDM_MATERIALS = [
  "PLA",
  "PLA+",
  "ABS",
  "ASA",
  "PETG",
  "TPU",
  "PETG-CF",
  "PLA-CF",
  "Nylon",
  "Nylon-CF",
];

const SLA_MATERIALS = [
  "Standard Resin",
  "Draft Resin",
  "High-detail Resin",
  "Tough Resin",
  "Clear / Transparent",
  "Flexible Resin",
];

type HomepageBanner = {
  _id: string;
  slot: "hero" | "promotion";
  title: string;
  subtitle: string;
  image: string;
  href: string;
  isActive: boolean;
  sortOrder: number;
};

/* ═══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(false);
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([fetch("/api/products?limit=8"), fetch("/api/banners")])
      .then(async ([productsResponse, bannersResponse]) => {
        if (!productsResponse.ok) throw new Error("Products unavailable");
        const data = await productsResponse.json();
        const bannersData = bannersResponse.ok
          ? await bannersResponse.json()
          : null;
        if (!active || !data.success) return;
        setProducts(
          (data.products as Product[]).filter((p) => p.isActive === true),
        );
        if (bannersData?.success)
          setBanners(bannersData.banners as HomepageBanner[]);
      })
      .catch(() => {
        if (active) setProductError(true);
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = products.slice(0, 8);
  const heroBanners = banners
    .filter((banner) => banner.slot === "hero")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const activeHeroBanner = heroBanners[activeHeroIndex] ?? heroBanners[0];

  useEffect(() => {
    if (heroBanners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveHeroIndex((index) => (index + 1) % heroBanners.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        {/* ══ 1. HERO ══════════════════════════════════════════ */}
        <section className="hp2-hero" aria-labelledby="hero-heading">
          <Container className="hp2-hero-inner">
            <div className="hero-chakra-stage">
              <HeroChakra side="left" />
              <HeroChakra side="right" />
            </div>
            <div className="hp2-hero-copy">
              <p className="hp2-eyebrow">
                Promethix3D · Kolkata, India
              </p>
              <h1 id="hero-heading" className="hp2-hero-title font-heading">
                Premium 3D Printing.{" "}
                <span className="hp2-accent-line">Delivered Nationwide.</span>
              </h1>
              <p className="hp2-hero-body">
                Custom 3D printing for gifts, figurines, lamps, mechanical parts, and prototypes — serving clients across India and internationally with FDM &amp; SLA technology.
              </p>
              <div className="hp2-hero-ctas">
                <Link href="/shop" className="hp2-btn-primary">
                  Shop Products{" "}
                  <CaretRight size={14} weight="fill" aria-hidden="true" />
                </Link>
                <Link href="/custom-orders" className="hp2-btn-ghost">
                  Get a Custom Print
                </Link>
              </div>
              <div
                className="hp2-hero-pills"
                aria-label="Product maker contact"
              >
                <span className="hp2-pill">
                  <MapPin size={12} weight="fill" aria-hidden="true" />
                  Kolkata, India
                </span>
                <span className="hp2-pill">
                  <PhoneCall size={12} weight="fill" aria-hidden="true" />
                  +91 98327 69269
                </span>
                <span className="hp2-pill hp2-pill--accent">
                  <CheckCircle size={12} weight="fill" aria-hidden="true" />
                  FDM &amp; SLA Printing
                </span>
                <span className="hp2-pill hp2-pill--accent">
                  <Package size={12} weight="fill" aria-hidden="true" />
                  National &amp; Int&apos;l Orders
                </span>
              </div>
            </div>
          </Container>
        </section>

        {/* ══ STATS STRIP ══════════════════════════════════════ */}
        <div className="stats-strip" aria-label="Brand statistics">
          <div className="stat-block">
            <span className="stat-number">500+</span>
            <span className="stat-label">Orders Delivered</span>
          </div>
          <div className="stat-block">
            <span className="stat-number">28+</span>
            <span className="stat-label">States Served</span>
          </div>
          <div className="stat-block">
            <span className="stat-number">15+</span>
            <span className="stat-label">Countries Reached</span>
          </div>
          <div className="stat-block">
            <span className="stat-number">10+</span>
            <span className="stat-label">Materials Available</span>
          </div>
        </div>


        {/* ══ 2. MARQUEE ══════════════════════════════════════ */}
        <div className="marquee-section" role="presentation">
          <HomeMarquee />
        </div>

        {/* ══ 2B. GLOBAL REACH ══════════════════════════════════ */}
        <section className="reach-section" aria-labelledby="reach-heading">
          <Container>
            <div className="reach-grid">
              <div className="reach-copy">
                <p className="eyebrow">Shipping &amp; Reach</p>
                <h2 id="reach-heading" className="font-heading">
                  National &amp; International Delivery
                </h2>
                <p>
                  From Kolkata, we ship precision 3D printed products to every corner of India and internationally. Whether you need a single custom piece or bulk orders, we ensure secure packaging and reliable delivery to your doorstep.
                </p>
              </div>
              <div className="reach-zones">
                <div className="reach-zone-card">
                  <div className="reach-zone-icon" aria-hidden="true">
                    <MapPin size={18} weight="fill" />
                  </div>
                  <div>
                    <h3>Pan-India Delivery</h3>
                    <p>Covering all 28 states and union territories. Fast dispatch with tracked shipments via professional courier partners.</p>
                    <span className="reach-zone-tag">Nationwide</span>
                  </div>
                </div>
                <div className="reach-zone-card">
                  <div className="reach-zone-icon" aria-hidden="true">
                    <Package size={18} weight="fill" />
                  </div>
                  <div>
                    <h3>International Shipping</h3>
                    <p>We ship to 15+ countries. Contact us for rates, customs documentation, and delivery timelines for your region.</p>
                    <span className="reach-zone-tag">Global</span>
                  </div>
                </div>
                <div className="reach-zone-card">
                  <div className="reach-zone-icon" aria-hidden="true">
                    <CheckCircle size={18} weight="fill" />
                  </div>
                  <div>
                    <h3>Secure Packaging</h3>
                    <p>Every order is professionally packed with foam insulation and rigid outer casing to protect delicate 3D prints.</p>
                    <span className="reach-zone-tag">Protected</span>
                  </div>
                </div>
                <div className="reach-zone-card">
                  <div className="reach-zone-icon" aria-hidden="true">
                    <PhoneCall size={18} weight="fill" />
                  </div>
                  <div>
                    <h3>Dedicated Support</h3>
                    <p>Real-time order updates via WhatsApp. Direct communication from design to delivery — no middlemen.</p>
                    <span className="reach-zone-tag">WhatsApp Support</span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>


        <section
          id="categories"
          className="hp2-categories-section"
          aria-labelledby="categories-heading"
        >
          <Container>
            <Reveal>
              <div className="hp2-section-head">
                <div>
                  <p className="eyebrow">Explore Our Work</p>
                  <h2
                    id="categories-heading"
                    className="hp2-section-title font-heading"
                  >
                    What Can We Make for You?
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hp2-section-link"
                  aria-label="Browse all products"
                >
                  Browse shop
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            <div className="hp2-cat-grid">
              {STATIC_CATEGORIES.map((cat, i) => (
                <Reveal key={cat.id} delay={i * 50}>
                  <Link href={cat.href} className="hp2-cat-card">
                    <div className="hp2-cat-image">
                      <ImgPlaceholder
                        filename={cat.filename}
                        width={800}
                        height={600}
                        label={cat.label}
                        className="hp2-cat-placeholder"
                      />
                    </div>
                    <div className="hp2-cat-copy">
                      <h3 className="hp2-cat-title font-heading">
                        {cat.label}
                      </h3>
                      <p className="hp2-cat-desc">{cat.description}</p>
                      <span className="hp2-cat-cta" aria-hidden="true">
                        Explore <ArrowRight size={12} weight="bold" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ══ 4. FEATURED PRODUCTS ═════════════════════════════ */}
        <section
          id="featured"
          className="hp2-products-section"
          aria-labelledby="featured-heading"
        >
          <Container>
            <Reveal>
              <div className="hp2-section-head">
                <div>
                  <p className="eyebrow">Selected Prints</p>
                  <h2
                    id="featured-heading"
                    className="hp2-section-title font-heading"
                  >
                    Featured Products
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hp2-section-link"
                  aria-label="View all products"
                >
                  View all
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            {loadingProducts ? (
              <div
                className="hp2-product-grid"
                aria-label="Loading products"
                role="status"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-skeleton" aria-hidden="true">
                    <div className="skeleton-block" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                ))}
              </div>
            ) : productError ? (
              <div className="hp2-empty-state" role="alert">
                <Package size={40} weight="duotone" aria-hidden="true" />
                <p className="hp2-empty-title">
                  Products temporarily unavailable
                </p>
                <p className="hp2-empty-body">
                  We&apos;re having trouble loading products right now. Please
                  refresh or try again shortly.
                </p>
                <button
                  type="button"
                  className="hp2-btn-ghost"
                  onClick={() => window.location.reload()}
                >
                  Refresh page
                </button>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="hp2-empty-state">
                <Package size={40} weight="duotone" aria-hidden="true" />
                <p className="hp2-empty-title">
                  Our first products are being prepared
                </p>
                <p className="hp2-empty-body">
                  We&apos;re stocking our shelves. In the meantime, you can
                  place a custom order for anything you need made.
                </p>
                <Link href="/custom-orders" className="hp2-btn-primary">
                  Place a custom order
                  <CaretRight size={14} weight="fill" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="hp2-product-grid">
                {featuredProducts.map((product, i) => (
                  <Reveal key={product._id} delay={i * 45}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* ══ 5. CUSTOM ORDERS ═════════════════════════════════ */}
        <section
          className="hp2-custom-section"
          aria-labelledby="custom-heading"
        >
          <Container className="hp2-custom-inner">
            {/* Image column */}
            <Reveal className="hp2-custom-visual">
              <ImgPlaceholder
                filename="custom-order.jpg"
                width={900}
                height={1100}
                label="Custom order — CAD design to printed part"
                className="hp2-custom-img-block"
              />
            </Reveal>

            {/* Copy column */}
            <div className="hp2-custom-copy">
              <Reveal>
                <p className="eyebrow hp2-custom-eyebrow">Custom 3D Printing</p>
                <h2
                  id="custom-heading"
                  className="hp2-custom-title font-heading"
                >
                  Imagine It. <br />
                  We&apos;ll Help You Make It.
                </h2>
                <p className="hp2-custom-body">
                  Share an idea, photograph, sketch, or functional requirement.
                  We consult with you, help develop the design, select the
                  printing process and material, manufacture the object, and
                  arrange delivery.
                </p>
              </Reveal>

              <ol
                className="hp2-process-list"
                aria-label="Custom order process"
              >
                {PROCESS_STEPS.map((step, i) => (
                  <Reveal key={step.number} delay={i * 70}>
                    <li className="hp2-process-step">
                      <span className="hp2-step-number" aria-hidden="true">
                        {step.number}
                      </span>
                      <div className="hp2-step-content">
                        <h3 className="hp2-step-title font-heading">
                          {step.title}
                        </h3>
                        <p className="hp2-step-body">{step.body}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={300}>
                <Link href="/custom-orders" className="hp2-btn-primary">
                  Request a Custom Print
                  <CaretRight size={14} weight="fill" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ══ 6. FDM & SLA PRINTING ════════════════════════════ */}
        <section
          className="hp2-process-section"
          aria-labelledby="process-heading"
        >
          <Container>
            <Reveal>
              <div className="hp2-section-head">
                <div>
                  <p className="eyebrow">Technology</p>
                  <h2
                    id="process-heading"
                    className="hp2-section-title font-heading"
                  >
                    Two Printing Processes. <br className="hp2-section-br" />
                    More Ways to Create.
                  </h2>
                </div>
              </div>
            </Reveal>

            <div className="hp2-process-panels">
              {/* FDM Panel */}
              <Reveal className="hp2-process-panel">
                <div className="hp2-process-panel-image">
                  <ImgPlaceholder
                    filename="fdm-printer.jpg"
                    width={1200}
                    height={800}
                    label="FDM — Filament printer in action"
                    className="hp2-process-img-block"
                  />
                </div>
                <div className="hp2-process-panel-copy">
                  <span className="hp2-process-tag">FDM</span>
                  <h3 className="hp2-process-panel-title font-heading">
                    Fused Deposition Modeling
                  </h3>
                  <p className="hp2-process-panel-desc">
                    The workhorse of 3D printing. Excellent for functional
                    components, prototypes, mechanical parts, enclosures,
                    decorative objects, and larger prints. Strong, practical,
                    and available in a wide range of materials.
                  </p>
                  <div
                    className="hp2-material-chips"
                    aria-label="Available FDM materials"
                  >
                    {FDM_MATERIALS.map((m) => (
                      <span key={m} className="hp2-material-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* SLA Panel */}
              <Reveal delay={80} className="hp2-process-panel">
                <div className="hp2-process-panel-image">
                  <ImgPlaceholder
                    filename="sla-miniatures.jpg"
                    width={1200}
                    height={800}
                    label="SLA — Resin printer and detailed miniatures"
                    className="hp2-process-img-block"
                  />
                </div>
                <div className="hp2-process-panel-copy">
                  <span className="hp2-process-tag hp2-process-tag--sla">
                    SLA
                  </span>
                  <h3 className="hp2-process-panel-title font-heading">
                    Resin 3D Printing
                  </h3>
                  <p className="hp2-process-panel-desc">
                    Photopolymer resin cured by UV light at ultra-fine
                    resolution. Best for detailed miniatures, figurines,
                    intricate models, precision visual prototypes, and smooth
                    surface finishes. Results FDM cannot match in detail.
                  </p>
                  <div
                    className="hp2-material-chips"
                    aria-label="Available SLA materials"
                  >
                    {SLA_MATERIALS.map((m) => (
                      <span key={m} className="hp2-material-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="hp2-process-note">
                    Material availability may vary. Contact us for current
                    options.
                  </p>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ══ 7. BRAND STATEMENT ═══════════════════════════════ */}
        <section className="hp2-statement" aria-labelledby="statement-heading">
          <Container>
            <Reveal>
              <p className="eyebrow hp2-statement-eyebrow">
                The Promethix3D Promise
              </p>
              <blockquote
                id="statement-heading"
                className="hp2-statement-quote font-heading"
              >
                From a single prototype to bulk production — we engineer precision objects that push the limits of additive manufacturing and deliver them to your door, anywhere in India or the world.
              </blockquote>
              <div className="hp2-statement-ctas">
                <Link href="/shop" className="hp2-btn-primary hp2-statement-cta">
                  Browse the shop
                  <CaretRight size={14} weight="fill" aria-hidden="true" />
                </Link>
                <Link href="/custom-orders" className="hp2-btn-ghost">
                  Start a custom order
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

      </main>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="hp2-footer" aria-label="Site footer">
        <Container className="hp2-footer-inner">
          <div className="hp2-footer-brand">
            <Link href="/" className="hp2-footer-wordmark font-heading">
              Promethix3D
            </Link>
            <p className="hp2-footer-tagline">Where Imagination Takes Shape.</p>
            <div className="hp2-footer-contact">
              <p>
                <MapPin size={12} aria-hidden="true" />
                Kolkata, India
              </p>
              <p>
                <PhoneCall size={12} aria-hidden="true" />
                <a href="tel:+919832769269">+91 98327 69269</a>
              </p>
              <p>
                <a href="mailto:promethix3d@gmail.com">promethix3d@gmail.com</a>
              </p>
              <p>
                <a
                  href="https://instagram.com/promethix3d"
                  rel="noreferrer"
                  target="_blank"
                >
                  Instagram / @promethix3d
                </a>
              </p>
              <p>
                <a
                  href="https://youtube.com/@promethix3d"
                  rel="noreferrer"
                  target="_blank"
                >
                  YouTube / @promethix3d
                </a>
              </p>
            </div>
          </div>

          <nav className="hp2-footer-nav-group" aria-label="Footer navigation">
            <div className="hp2-footer-nav-col">
              <p className="hp2-footer-nav-heading">Shop</p>
              <Link href="/shop">All Products</Link>
              <Link href="/shop#categories">Categories</Link>
            </div>
            <div className="hp2-footer-nav-col">
              <p className="hp2-footer-nav-heading">Services</p>
              <Link href="/custom-orders">Custom Orders</Link>
              <Link href="/about">About</Link>
            </div>
            <div className="hp2-footer-nav-col">
              <p className="hp2-footer-nav-heading">Account</p>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign up</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </nav>
        </Container>

        <Container className="hp2-footer-bottom">
          <p className="hp2-footer-meta">
            © {new Date().getFullYear()} Promethix3D. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
