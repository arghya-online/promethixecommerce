import {
  ArrowRight,
  EnvelopeSimple,
  MapPin,
  PhoneCall,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

export const metadata = {
  title: "About Promethix3D | Custom 3D Printing in Kolkata, India",
  description:
    "Discover Promethix3D, a Kolkata-based 3D printing brand offering custom 3D printed parts, CAD modelling, prototypes, personalised gifts, event mementoes, and delivery across India and to international destinations.",
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
              Ideas, designs, and solutions made real.
            </h1>

            <p className="about-lead">
              Promethix3D is a 3D printing brand based in Kolkata, India. We
              help individuals and businesses turn ideas, digital designs, and
              everyday requirements into physical products. From custom 3D
              printed parts and prototypes to personalised gifts, figurines, and
              event mementoes, we make custom manufacturing more accessible.
              With 200+ products sold, our work has reached customers across
              India and international destinations.
            </p>
          </header>

          <section className="about-grid">
            <div className="about-card">
              <span className="about-step font-heading">01</span>
              <h2 className="font-heading about-card-title">
                Custom Parts &amp; Practical Solutions
              </h2>
              <p className="about-card-desc">
                Need a replacement component, a robotics part, a prototype, or a
                product made to your specifications? We offer custom 3D printing
                and CAD modelling to turn sketches, reference images,
                measurements, and digital models into useful physical parts.
              </p>
            </div>

            <div className="about-card">
              <span className="about-step font-heading">02</span>
              <h2 className="font-heading about-card-title">
                Products, Gifts &amp; Event Mementoes
              </h2>
              <p className="about-card-desc">
                We create personalised lamps, figurines, decorative products,
                custom gifts, and mementoes for events and bulk orders. From a
                single made-to-order item to a batch designed for a special
                occasion, we work around the product, design, and quantity you
                need.
              </p>
            </div>

            <div className="about-card">
              <span className="about-step font-heading">03</span>
              <h2 className="font-heading about-card-title">
                From Kolkata to Beyond
              </h2>
              <p className="about-card-desc">
                Based in Kolkata, Promethix3D serves customers across India and
                has delivered products to international destinations. Whether
                you need a custom component, a personalised product, or event
                mementoes in bulk, we help you access 3D printing without
                needing your own printer or manufacturing setup.
              </p>
            </div>
          </section>

          <section className="about-connect-section">
            <div className="about-contact-info">
              <span className="clean-eyebrow">Based in Kolkata, India</span>
              <h2 className="font-heading about-connect-title">
                Let&apos;s make something.
              </h2>
              <p className="about-connect-sub">
                Have a product idea, a part to reproduce, an event memento
                requirement, or a bulk order? Get in touch to discuss your
                project and explore a practical way to make it.
              </p>

              <div className="about-contact-list">
                <div className="about-contact-item">
                  <MapPin size={20} className="about-contact-icon" />
                  <span>Kolkata, West Bengal, India</span>
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
              <span className="clean-eyebrow">Custom 3D Printing</span>
              <h3 className="font-heading about-cta-heading">
                Have an idea or a custom requirement?
              </h3>
              <p className="about-cta-text">
                Share your concept, reference images, measurements, or 3D model.
                We&apos;ll help you explore the next steps.
              </p>
              <Link
                href="/custom-orders"
                className="clean-btn clean-btn--primary"
              >
                Discuss Your Project <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
