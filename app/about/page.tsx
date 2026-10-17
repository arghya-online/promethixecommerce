import { ArrowRight, EnvelopeSimple, MapPin, PhoneCall } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

export const metadata = {
  title: "Our Story & Ethos | Promethix3D",
  description:
    "Crafting happiness, one layer at a time. Learn about Promethix3D — additive manufacturing studio based in Kolkata.",
};

export default function AboutPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="about-page">
        <Container className="about-container">
          <header className="about-header">
            <span className="clean-eyebrow">OUR STORY &amp; ETHOS</span>
            <h1 className="font-heading about-title">
              Crafting happiness, one layer at a time.
            </h1>
            <p className="about-lead">
              Promethix3D was founded with a singular conviction: digital ideas deserve physical form without industrial barriers. Based at IEM Management House in Kolkata, we bridge the gap between creative imagination and physical reality through advanced additive manufacturing.
            </p>
          </header>

          <section className="about-grid">
            <div className="about-card">
              <span className="about-step font-heading">01</span>
              <h2 className="font-heading about-card-title">Bespoke Engineering</h2>
              <p className="about-card-desc">
                Whether it is a custom mechanical mount for robotics, a rapid prototype for a startup, or an intricate art piece, we calibrate print speed, infill geometry, and layer adhesion to meet structural requirements.
              </p>
            </div>
            <div className="about-card">
              <span className="about-step font-heading">02</span>
              <h2 className="font-heading about-card-title">Dual Technologies</h2>
              <p className="about-card-desc">
                We operate high-precision FDM filament systems (using PLA, PETG, ABS, and Carbon-Fiber composites) alongside ultra-detailed UV SLA resin printers achieving 0.05mm layer resolution.
              </p>
            </div>
            <div className="about-card">
              <span className="about-step font-heading">03</span>
              <h2 className="font-heading about-card-title">Pan-India Reach</h2>
              <p className="about-card-desc">
                From Kolkata, we deliver to all 28 Indian states with dedicated tracking and protective multi-layer packaging. Every item undergoes rigorous manual dimensional checks before dispatch.
              </p>
            </div>
          </section>

          <section className="about-connect-section">
            <div className="about-contact-info">
              <span className="clean-eyebrow">Studio Location</span>
              <h2 className="font-heading about-connect-title">Visit or Connect</h2>
              <p className="about-connect-sub">
                We welcome custom project consultations, student projects, prototyping inquiries, and corporate bulk orders.
              </p>
              <div className="about-contact-list">
                <div className="about-contact-item">
                  <MapPin size={20} className="about-contact-icon" />
                  <span>IEM Management House, D-1, Street No. 13, EP Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091</span>
                </div>
                <div className="about-contact-item">
                  <PhoneCall size={20} className="about-contact-icon" />
                  <a href="tel:+919832769269">+91 98327 69269</a>
                </div>
                <div className="about-contact-item">
                  <EnvelopeSimple size={20} className="about-contact-icon" />
                  <a href="mailto:promethix3d@gmail.com">promethix3d@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="about-cta-card">
              <span className="clean-eyebrow">Start Fabrication</span>
              <h3 className="font-heading about-cta-heading">Have a project in mind?</h3>
              <p className="about-cta-text">Send us your concept or 3D model for a personalized quote.</p>
              <Link href="/custom-orders" className="clean-btn clean-btn--primary">
                Get a Free Quote <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
