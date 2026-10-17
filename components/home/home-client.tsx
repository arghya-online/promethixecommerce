"use client";

import {
  ArrowRight,
  CaretDown,
  Check,
  EnvelopeSimple,
  MapPin,
  Package,
  PhoneCall,
  ShieldCheck,
  Truck,
  Wrench,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { type Product } from "@/components/catalog/product-types";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";
import { Hero } from "@/components/home/Hero";

const DEFAULT_CATEGORIES = [
  {
    id: "lamps",
    name: "Personalised Lamps",
    description: "Custom 3D liprinted lamps with your photos, text or design.",
    image: "/category-lamps.jpg",
    href: "/custom-orders",
    actionLabel: "Make a gift",
  },
  {
    id: "figurines",
    name: "Figurines & Idols",
    description: "Fine-detail miniatures, deity idols and statues.",
    image: "/category-figurines.jpg",
    href: "/shop",
    actionLabel: "See figurines",
  },
  {
    id: "mechanical",
    name: "Working Parts",
    description:
      "Strong brackets, gears and replacements in PETG, ABS and carbon fibre.",
    image: "/category-mechanical.jpg",
    href: "/custom-orders",
    actionLabel: "Get a part made",
  },
  {
    id: "prototypes",
    name: "Prototypes",
    description: "Test your design in your hands before you spend on tooling.",
    image: "/category-prototypes.JPG",
    href: "/custom-orders",
    actionLabel: "Start a prototype",
  },
  {
    id: "decor",
    name: "Home & Desk",
    description:
      "Planters, cable organisers and décor that make your space yours.",
    image: "/category-decor.jpg",
    href: "/shop",
    actionLabel: "Browse décor",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us what you need.",
    desc: "Send a file, a sketch, photos or measurements. Anything works.",
  },
  {
    step: "02",
    title: "Get your fixed quote.",
    desc: "We check feasibility, suggest the best material, and model the design if needed. The price you see is the price you pay.",
  },
  {
    step: "03",
    title: "We print and inspect.",
    desc: "Made in our Kolkata studio, finished by hand and measured with calipers.",
  },
  {
    step: "04",
    title: "Delivered safely.",
    desc: "Shockproof packing, tracked all the way to your door.",
  },
];

const WHY_CHOOSE_US = [
  {
    title: "We print it ourselves.",
    desc: "No middlemen. You speak directly with the people running your job.",
    icon: MapPin,
  },
  {
    title: "We help you get it right.",
    desc: "Bring a drawing or a broken part and we'll turn it into a print-ready model.",
    icon: Wrench,
  },
  {
    title: "The right material, honestly advised.",
    desc: "Detail resin, tough PETG, ABS, flexible TPU or carbon fibre. We recommend what works, not what's expensive.",
    icon: ShieldCheck,
  },
  {
    title: "Packed to arrive safe.",
    desc: "Secure packaging and tracked courier shipping across India.",
    icon: Truck,
  },
];

const CUSTOMER_REVIEWS = [
  {
    name: "Debanjan M.",
    city: "Kolkata, WB",
    project: "Custom Replacement Motor Mount (PETG)",
    comment:
      "Brought in a broken mount from a drone frame with caliper measurements. The replacement fit perfectly and the PETG print was even sturdier than the original.",
  },
  {
    name: "Rohan S.",
    city: "Bengaluru, KA",
    project: "Functional Prototype Enclosure",
    comment:
      "Dimensions on the STEP model matched within ±0.08 mm. Quick CAD clearance review and dispatch was super clean.",
  },
  {
    name: "Priyanka D.",
    city: "Pune, MH",
    project: "Custom Lithophane Lamp",
    comment:
      "The photo detail on the lamp came out sharp and clear. Delivered safely to Pune with solid shockproof packing.",
  },
];

const FAQS = [
  {
    q: "How much does a custom print cost?",
    a: "Your price depends on material used, print time, and any design or finishing needed. You'll get an exact quote before you commit, so there are no surprises.",
  },
  {
    q: "I don't have a 3D file. Can you still help?",
    a: "Yes. Send a sketch, photos, measurements or the actual item. We'll create the 3D model for you.",
  },
  {
    q: "Which materials do you use?",
    a: "PLA, PETG, ABS, TPU, carbon-fibre blends and high-detail resin. We'll recommend the best one for your use.",
  },
  {
    q: "How long will it take?",
    a: "Most custom orders are printed, inspected and shipped in 2–5 business days. Delivery time depends on your location.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes, with protective packaging and tracking.",
  },
  {
    q: "Can you reproduce a broken plastic part?",
    a: "Usually, yes. Send the part or photos with measurements and we'll check feasibility and quote you.",
  },
];

export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let active = true;

    Promise.all([fetch("/api/products?limit=6")])
      .then(async ([prodRes]) => {
        const prodData = prodRes.ok ? await prodRes.json() : null;

        if (!active) return;
        if (prodData?.success) {
          setProducts(
            (prodData.products as Product[]).filter((p) => p.isActive),
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="site-shell clean-storefront">
      <SiteHeader />

      <main>
        {/* ══════════════════════════════════════════════════════
            1. HERO SECTION (Clear, Grounded, Credible)
        ══════════════════════════════════════════════════════ */}
        <Hero />

        {/* ══════════════════════════════════════════════════════
            2. WHAT WE MAKE (Categories)
        ══════════════════════════════════════════════════════ */}
        <section id="categories" className="clean-section">
          <Container>
            <div className="clean-section-header">
              <div>
                <h2 className="font-heading clean-section-title">
                  Whatever you imagine, we can make it real.
                </h2>
                <p className="clean-section-subtitle">
                  From personalized gifts to functional mechanical components,
                  we match each job to the right process.
                </p>
              </div>
              <Link href="/shop" className="clean-section-link">
                View all categories <ArrowRight size={14} />
              </Link>
            </div>

            <div className="clean-categories-grid">
              {DEFAULT_CATEGORIES.map((cat) => {
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="clean-category-card"
                  >
                    <div className="clean-category-thumb">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        priority={cat.id === "gifts"}
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="clean-category-thumb-img"
                      />
                    </div>
                    <div className="clean-category-content">
                      <h3 className="font-heading clean-category-name">
                        {cat.name}
                      </h3>
                      <p className="clean-category-desc">{cat.description}</p>
                      <span className="clean-category-action">
                        {cat.actionLabel} <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            3. HOW IT WORKS
        ══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="clean-section clean-section--alt">
          <Container>
            <div className="clean-section-header clean-section-header--center">
              <h2 className="font-heading clean-section-title">
                Easy, even if you&apos;ve never touched CAD.
              </h2>
              <p className="clean-section-subtitle">
                No 3D modeling experience needed. We guide you from rough
                concept to finished, inspected part.
              </p>
            </div>

            <div className="clean-steps-grid">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="clean-step-card">
                  <span className="clean-step-num font-heading">
                    {item.step}
                  </span>
                  <h3 className="font-heading clean-step-title">
                    {item.title}
                  </h3>
                  <p className="clean-step-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            4. FEATURED PRODUCTS
        ══════════════════════════════════════════════════════ */}
        <section id="products" className="clean-section">
          <Container>
            <div className="clean-section-header">
              <div>
                <h2 className="font-heading clean-section-title">
                  Ready to ship, made in Kolkata.
                </h2>
                <p className="clean-section-subtitle">
                  In stock and dispatched fast. No waiting for a quote.
                </p>
              </div>
              <Link href="/shop" className="clean-section-link">
                Browse all products <ArrowRight size={14} />
              </Link>
            </div>

            {loadingProducts ? (
              <div className="clean-products-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="clean-product-skeleton">
                    <div className="skeleton-thumb" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text skeleton-text--short" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="clean-products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="clean-empty-state">
                <Package size={36} />
                <p>New studio products are currently in production.</p>
                <Link
                  href="/custom-orders"
                  className="clean-btn clean-btn--primary"
                >
                  Get a Free Quote
                </Link>
              </div>
            )}
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            5. CUSTOM ORDERS
        ══════════════════════════════════════════════════════ */}
        <section
          id="custom-printing"
          className="clean-section clean-section--alt"
        >
          <Container>
            <div className="clean-custom-box">
              <div className="clean-custom-copy">
                <span className="clean-eyebrow clean-eyebrow--accent">
                  Custom Orders
                </span>
                <h2 className="font-heading clean-custom-title">
                  Have an idea or a broken part? Start here.
                </h2>
                <p className="clean-custom-desc">
                  You don’t need a 3D file. Send a sketch, photos, measurements
                  or the physical part. We’ll tell you honestly what’s possible,
                  build the model, and quote you clearly.
                </p>

                <div className="clean-custom-points">
                  <div className="clean-point">
                    <Check size={18} weight="bold" />
                    <div>
                      <strong>We design it for you.</strong>
                      <span>Only have an idea? We’ll model it.</span>
                    </div>
                  </div>
                  <div className="clean-point">
                    <Check size={18} weight="bold" />
                    <div>
                      <strong>Honest, upfront pricing.</strong>
                      <span>
                        Based on material and machine time. No hidden fees.
                      </span>
                    </div>
                  </div>
                  <div className="clean-point">
                    <Check size={18} weight="bold" />
                    <div>
                      <strong>Fast turnaround.</strong>
                      <span>Most custom orders ship in 2–5 business days.</span>
                    </div>
                  </div>
                </div>

                <div className="clean-custom-cta-area">
                  <Link
                    href="/custom-orders"
                    className="clean-btn clean-btn--primary"
                  >
                    Request My Free Quote <ArrowRight size={16} />
                  </Link>
                  <span className="clean-custom-note">
                    Free review · No commitment · Fast response
                  </span>
                </div>
              </div>

              <div className="clean-custom-info-card">
                <h3 className="font-heading">Files we accept</h3>
                <p>
                  If you already have a 3D model or reference, you can upload:
                </p>
                <div className="clean-formats-tags">
                  <span>.STL</span>
                  <span>.STEP</span>
                  <span>.STP</span>
                  <span>.OBJ</span>
                  <span>.3MF</span>
                  <span>.PDF</span>
                  <span>.JPG</span>
                  <span>.PNG</span>
                </div>

                <h3 className="font-heading" style={{ marginTop: "1.5rem" }}>
                  Common applications
                </h3>
                <ul className="clean-app-list">
                  <li>• Custom gifts &amp; 3D lithophane lamps</li>
                  <li>• Detailed miniatures and idols</li>
                  <li>• Robotics brackets &amp; drone arms</li>
                  <li>• Obsolete replacement plastic parts</li>
                  <li>• Prototype enclosures and fit checks</li>
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            6. WHY PEOPLE TRUST PROMETHIX3D
        ══════════════════════════════════════════════════════ */}
        <section id="why-us" className="clean-section">
          <Container>
            <div className="clean-section-header clean-section-header--center">
              <h2 className="font-heading clean-section-title">
                Real makers. Real workshop. Real accountability.
              </h2>
              <p className="clean-section-subtitle">
                A dedicated Indian 3D printing workshop built around
                craftsmanship, honest communication, and reliable turnaround.
              </p>
            </div>

            <div className="clean-why-grid">
              {WHY_CHOOSE_US.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="clean-why-card">
                    <div className="clean-why-icon">
                      <Icon size={24} weight="bold" />
                    </div>
                    <h3 className="font-heading clean-why-title">
                      {item.title}
                    </h3>
                    <p className="clean-why-desc">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Verifiable Proof Metrics */}
            <div className="clean-proof-bar">
              <div>
                <span className="clean-proof-stat font-heading">150+</span>
                <span className="clean-proof-label">
                  Custom Orders Delivered
                </span>
              </div>
              <div>
                <span className="clean-proof-stat font-heading">± 0.08 mm</span>
                <span className="clean-proof-label">
                  Caliper-Inspected Tolerances
                </span>
              </div>
              <div>
                <span className="clean-proof-stat font-heading">
                  100% In-House
                </span>
                <span className="clean-proof-label">
                  Kolkata Studio Production
                </span>
              </div>
            </div>

            {/* Customer Reviews for Trust Proof */}
            <div className="clean-reviews-grid">
              {CUSTOMER_REVIEWS.map((rev, idx) => (
                <div key={idx} className="clean-review-card">
                  <p className="clean-review-text">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div>
                    <span className="clean-review-author">{rev.name}</span>
                    <span className="clean-review-location">
                      {rev.city} · {rev.project}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            7. OUR STORY & ETHOS (About Promethix3D)
        ══════════════════════════════════════════════════════ */}
        <section id="about" className="clean-section clean-about-section">
          <Container>
            <div className="clean-section-header">
              <span className="clean-eyebrow">OUR STORY &amp; ETHOS</span>
              <h2 className="font-heading clean-section-title">
                Crafting happiness, one layer at a time.
              </h2>
              <p
                className="clean-section-subtitle"
                style={{ maxWidth: "48rem" }}
              >
                Promethix3D was founded with a singular conviction: digital
                ideas deserve physical form without industrial barriers. Based
                at IEM Management House in Kolkata, we bridge the gap between
                creative imagination and physical reality through advanced
                additive manufacturing.
              </p>
            </div>

            <div className="about-grid">
              <div className="about-card">
                <span className="about-step font-heading">01</span>
                <h3 className="font-heading about-card-title">
                  Bespoke Engineering
                </h3>
                <p className="about-card-desc">
                  Whether it is a custom mechanical mount for robotics, a rapid
                  prototype for a startup, or an intricate art piece, we
                  calibrate print speed, infill geometry, and layer adhesion to
                  meet structural requirements.
                </p>
              </div>

              <div className="about-card">
                <span className="about-step font-heading">02</span>
                <h3 className="font-heading about-card-title">
                  Dual Technologies
                </h3>
                <p className="about-card-desc">
                  We operate high-precision FDM filament systems (using PLA,
                  PETG, ABS, and Carbon-Fiber composites) alongside
                  ultra-detailed UV SLA resin printers achieving 0.05mm layer
                  resolution.
                </p>
              </div>

              <div className="about-card">
                <span className="about-step font-heading">03</span>
                <h3 className="font-heading about-card-title">
                  Pan-India Reach
                </h3>
                <p className="about-card-desc">
                  From Kolkata, we deliver to all 28 Indian states with
                  dedicated tracking and protective multi-layer packaging. Every
                  item undergoes rigorous manual dimensional checks before
                  dispatch.
                </p>
              </div>
            </div>

            <div className="about-connect-section">
              <div className="about-contact-info">
                <span className="clean-eyebrow">Studio Location</span>
                <h3 className="font-heading about-connect-title">
                  Visit or Connect
                </h3>
                <p className="about-connect-sub">
                  We welcome custom project consultations, student projects,
                  prototyping inquiries, and corporate bulk orders.
                </p>
                <div className="about-contact-list">
                  <div className="about-contact-item">
                    <MapPin size={20} className="about-contact-icon" />
                    <span>
                      IEM Management House, D-1, Street No. 13, EP Block, Sector
                      V, Bidhannagar, Kolkata, West Bengal 700091
                    </span>
                  </div>
                  <div className="about-contact-item">
                    <PhoneCall size={20} className="about-contact-icon" />
                    <a href="tel:+919832769269">+91 98327 69269</a>
                  </div>
                  <div className="about-contact-item">
                    <EnvelopeSimple size={20} className="about-contact-icon" />
                    <a href="mailto:promethix3d@gmail.com">
                      promethix3d@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="about-cta-card">
                <span className="clean-eyebrow">Start Fabrication</span>
                <h3 className="font-heading about-cta-heading">
                  Have a project in mind?
                </h3>
                <p className="about-cta-text">
                  Send us your concept or 3D model for a personalized quote.
                </p>
                <Link
                  href="/custom-orders"
                  className="clean-btn clean-btn--primary"
                >
                  Get a Free Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            8. FAQS (Practical, Direct Answers)
        ══════════════════════════════════════════════════════ */}
        <section id="faqs" className="clean-section clean-section--alt">
          <Container className="clean-faq-container">
            <div className="clean-section-header clean-section-header--center">
              <h2 className="font-heading clean-section-title">
                Frequently asked questions
              </h2>
              <p className="clean-section-subtitle">
                Clear answers to common questions about pricing, materials, and
                turnaround.
              </p>
            </div>

            <div className="clean-faq-list">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className={`clean-faq-item ${isOpen ? "is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="clean-faq-question"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <CaretDown size={18} className="clean-faq-caret" />
                    </button>
                    {isOpen && (
                      <div className="clean-faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════════════════════
            8. FINAL CTA (Single Clear Route)
        ══════════════════════════════════════════════════════ */}
        <section className="clean-final-cta-section">
          <Container>
            <div className="clean-final-cta-box">
              <h2 className="font-heading clean-final-title">
                Ready to see your idea in your hands?
              </h2>
              <p className="clean-final-desc">
                Tell us what you have in mind. We’ll reply with a clear, fixed
                quote and no obligation.
              </p>
              <div className="clean-final-buttons">
                <Link
                  href="/custom-orders"
                  className="clean-btn clean-btn--primary"
                >
                  Get a Free Quote <ArrowRight size={16} />
                </Link>
                <Link href="/shop" className="clean-btn clean-btn--secondary">
                  Shop Ready-Made Products
                </Link>
              </div>
              <p className="clean-final-contact">
                Prefer to talk? Call or WhatsApp{" "}
                <a href="tel:+919832769269">+91 98327 69269</a> or email{" "}
                <a href="mailto:promethix3d@gmail.com">promethix3d@gmail.com</a>
              </p>
            </div>
          </Container>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER (Simple, Grounded, Reassuring)
      ══════════════════════════════════════════════════════ */}
      <footer className="clean-footer">
        <Container className="clean-footer-inner">
          <div className="clean-footer-brand">
            <Link href="/" className="clean-footer-logo font-heading">
              Promethix<strong>3D</strong>
            </Link>
            <p className="clean-footer-tagline">
              Custom 3D printing and CAD modelling studio based in Kolkata,
              India. Shipping nationwide.
            </p>
            <div className="clean-footer-address">
              <p>
                <strong>Studio Address:</strong>
                <br />
                IEM Management House, D-1, Street No. 13, EP Block,
                <br />
                Sector V, Bidhannagar, Kolkata, West Bengal 700091
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                <strong>Contact:</strong>{" "}
                <a href="tel:+919832769269">+91 98327 69269</a> ·{" "}
                <a href="mailto:promethix3d@gmail.com">promethix3d@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="clean-footer-links">
            <div className="clean-footer-col">
              <h4>Navigation</h4>
              <Link href="/shop">Products</Link>
              <Link href="/#categories">What We Print</Link>
              <Link href="/custom-orders">Custom Orders</Link>
              <Link href="/#how-it-works">How It Works</Link>
              <Link href="/#faqs">FAQs</Link>
            </div>

            <div className="clean-footer-col">
              <h4>Services</h4>
              <Link href="/custom-orders">CAD 3D Modelling</Link>
              <Link href="/custom-orders">Resin Printing (SLA)</Link>
              <Link href="/custom-orders">Filament Printing (FDM)</Link>
              <Link href="/custom-orders">Replacement Parts</Link>
            </div>

            <div className="clean-footer-col">
              <h4>Connect</h4>
              <a
                href="https://www.instagram.com/promethix3d/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram (@promethix3d)
              </a>
              <Link href="/account">Customer Account</Link>
            </div>
          </div>
        </Container>

        <Container className="clean-footer-bottom">
          <p>© {new Date().getFullYear()} Promethix3D. All rights reserved.</p>
          <p>Kolkata, West Bengal · Pan-India Delivery</p>
        </Container>
      </footer>

      {/* ══════════════════════════════════════════════════════
          FLOATING WHATSAPP BUTTON (Direct Customer Support)
      ══════════════════════════════════════════════════════ */}
      <a
        href="https://wa.me/919832769269?text=Hi%20Promethix3D%2C%20I%20have%20an%20enquiry%20about%20a%203D%20print."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Promethix3D"
        className="clean-whatsapp-float"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.37C16.32 14.25 15.1 13.65 14.87 13.57C14.65 13.49 14.48 13.45 14.32 13.69C14.15 13.94 13.68 14.49 13.53 14.66C13.39 14.82 13.24 14.85 12.99 14.72C12.75 14.6 11.96 14.34 11.03 13.51C10.3 12.86 9.81 12.06 9.66 11.81C9.52 11.57 9.65 11.43 9.77 11.31C9.88 11.2 10.02 11.02 10.14 10.88C10.27 10.74 10.31 10.64 10.39 10.47C10.47 10.31 10.43 10.16 10.37 10.04C10.31 9.92 9.81 8.7 9.61 8.19C9.4 7.69 9.2 7.76 9.05 7.75C8.91 7.74 8.75 7.74 8.58 7.74C8.42 7.74 8.15 7.8 7.92 8.05C7.7 8.3 7.07 8.89 7.07 10.1C7.07 11.31 7.95 12.48 8.07 12.64C8.2 12.8 9.8 15.26 12.25 16.32C12.83 16.57 13.28 16.72 13.64 16.83C14.23 17.02 14.76 16.99 15.18 16.93C15.66 16.86 16.65 16.33 16.86 15.75C17.06 15.17 17.06 14.68 17 14.58C16.94 14.49 16.82 14.43 16.57 14.37Z" />
        </svg>
        <span className="clean-whatsapp-text">Chat on WhatsApp</span>
      </a>
    </div>
  );
}
