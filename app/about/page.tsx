import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/data/site";
import { stats } from "@/data/stats";

export const metadata = {
  title: "About Us | Promethix3D",
  description:
    "Promethix3D is a Kolkata-based 3D printed products brand and engineering consultancy. We craft ready-made gifts and figurines, and partner with creators to design, prototype, and manufacture custom parts.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero Story Section with Studio Gradient and CAD Grid */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#eee7db] via-[#f7f4ed] to-background bg-cad-grid relative border-b border-border overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-radial-warmth pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Our Story &amp; Ethos
            </span>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
              Ideas, designs, and solutions made real.
            </h1>

            <p className="text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              Based in <strong>Kolkata, India</strong>, Promethix3D was founded to bridge the gap between creative imagination and physical production. We operate both as a <strong>3D printed products brand</strong> delivering ready-made gifts, figurines, and décor, and as an <strong>engineering consultancy</strong> helping makers, startups, and hobbyists design, prototype, and manufacture custom parts.
            </p>
          </div>
        </section>

        {/* 2. Two-Pillars Section (Products + Consultancy) on Clean Ivory */}
        <section className="py-16 md:py-24 bg-background relative border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Two Pillars
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mt-1">
                Products &amp; Consultancy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pillar 1: Products */}
              <Card className="bg-surface border-border hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      Pillar 01 · Retail &amp; Made-to-Order
                    </Badge>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
                      3D Printed Products
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                    We create 3D printed personalized lithophane photo lamps, hyper-detailed SLA resin idols and anime figurines, and minimalist desk lifestyle accessories. Everything is 100% 3D printed—never traditionally hand-carved—with custom painting and post-processing applied to select pieces for striking visual realism. Every item is printed, post-cured, and quality-tested in our Kolkata studio before nationwide express dispatch.
                  </p>
                  <ul className="space-y-2 text-xs text-foreground-muted pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Lithophanes with warm ambient backlighting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>8K/12K SLA resin collectibles &amp; deity idols</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Custom event mementoes and corporate batch orders</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-border mt-6">
                  <Button asChild className="w-full bg-primary hover:bg-accent-strong text-white font-semibold">
                    <Link href="/shop" className="flex items-center justify-center gap-2">
                      <span>Explore Catalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Pillar 2: Consultancy */}
              <Card className="bg-surface border-border hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      Pillar 02 · Engineering &amp; DFM
                    </Badge>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
                      Product Consultancy
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                    Have an idea on a napkin, a CAD model that fails slicing, or a broken plastic bracket that cannot be bought anywhere? Our engineers assist with parametric 3D modelling, Design for Additive Manufacturing (DFAM), tolerance verification, and high-performance polymer selection.
                  </p>
                  <ul className="space-y-2 text-xs text-foreground-muted pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>2D sketch or broken part to production CAD (STEP/STL)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Industrial polymers: PETG, ABS, TPU, Carbon-Fibre</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Fixed, upfront quote with zero commitment</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-border mt-6">
                  <Button asChild variant="outline" className="w-full bg-surface text-foreground font-semibold hover:bg-secondary">
                    <Link href="/custom-orders" className="flex items-center justify-center gap-2">
                      <span>Book a Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. Studio Stats Bar - High-Contrast Industrial Dark */}
        <section className="py-14 md:py-18 bg-[#141211] text-[#faf8f5] bg-cad-grid-dark border-b border-[#2d2722] relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-40 bg-[#d9531e]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.id} className="space-y-1.5 p-4 rounded-xl bg-[#1c1917]/80 border border-[#2e2722]">
                  <p className="font-heading font-black text-3xl sm:text-4xl text-[#ff8a50]">
                    {stat.value}
                  </p>
                  <p className="font-bold text-xs sm:text-sm text-white">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Location & Contact Section on Warm Sandstone */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#f7f3ec] via-[#ede7dc] to-[#f7f3ec] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Direct Communication
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                  Visit Us or Reach Out Directly
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  We believe in human-to-human engineering. When you submit an inquiry or call us, you speak directly with the team designing and printing your components.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-foreground-muted">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{siteConfig.address.full}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-foreground">
                      {siteConfig.contact.phoneDisplay}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-foreground">
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/60 rounded-xl p-6 border border-border space-y-4 text-center">
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Have a unique project in mind?
                </h3>
                <p className="text-xs text-foreground-muted">
                  Get a free evaluation of your 3D model, sketch, or broken part within 24 hours.
                </p>
                <Button asChild className="w-full bg-primary hover:bg-accent-strong text-white font-semibold">
                  <Link href="/custom-orders">Start Your Consultation</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
