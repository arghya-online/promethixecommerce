import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { footerSections } from "@/data/navigation";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-border mt-16 md:mt-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="Promethix3D Home"
            >
              <div className="relative w-8 h-8 rounded-md overflow-hidden bg-surface border border-border shadow-xs">
                <Image
                  src="/promethix3dLogo.png"
                  alt="Promethix3D Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-foreground">
                Promethix<span className="text-primary font-black ml-0.5">3D</span>
              </span>
            </Link>

            <p className="text-sm font-semibold text-primary">
              {siteConfig.eyebrow}
            </p>

            <p className="text-sm text-foreground-muted max-w-md leading-relaxed">
              {siteConfig.subline}
            </p>

            <div className="pt-2 space-y-2 text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{siteConfig.address.full}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-foreground transition-colors"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-foreground transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground bg-secondary/80 hover:bg-secondary px-3 py-1.5 rounded-md border border-border transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-primary"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>{siteConfig.social.instagramHandle}</span>
                <ArrowUpRight className="w-3 h-3 text-foreground-subtle" />
              </a>
            </div>
          </div>

          {/* Nav Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-foreground-muted hover:text-primary transition-colors py-0.5"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-foreground-muted hover:text-foreground hover:underline transition-colors py-0.5 block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 md:my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-subtle">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              © {new Date().getFullYear()} {siteConfig.name}. Made with precision in Kolkata.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Pan-India Courier Delivery</span>
            <span>·</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
