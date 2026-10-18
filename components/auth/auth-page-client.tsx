"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuthPageClientProps {
  mode: "signin" | "signup";
  eyebrow: string;
  title: string;
  description: string;
  switchPrompt: string;
  switchLinkText: string;
  switchHref: string;
  redirectTo?: string;
}

export function AuthPageClient({
  mode,
  eyebrow,
  title,
  description,
  switchPrompt,
  switchLinkText,
  switchHref,
  redirectTo,
}: AuthPageClientProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-12 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#f8f5ee] via-[#ede6d9] to-[#f4efe8] bg-cad-dots relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-radial-warmth pointer-events-none" />
        <div className="relative w-full max-w-md space-y-6">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mx-auto group"
              aria-label="Promethix3D Home"
            >
              <div className="relative w-9 h-9 rounded-md overflow-hidden bg-surface border border-border shadow-xs">
                <Image
                  src="/promethix3dLogo.png"
                  alt="Promethix3D Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="font-heading font-bold text-2xl text-foreground">
                Promethix<span className="text-primary font-black ml-0.5">3D</span>
              </span>
            </Link>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                {eyebrow}
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mt-1">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-foreground-muted mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="bg-surface border-border shadow-md rounded-2xl p-6 sm:p-8">
            <CardContent className="p-0 space-y-6">
              <AuthForm mode={mode} redirectTo={redirectTo} />

              <div className="pt-4 border-t border-border text-center text-xs text-foreground-muted">
                <span>{switchPrompt} </span>
                <Link
                  href={switchHref}
                  className="text-primary font-semibold hover:underline"
                >
                  {switchLinkText}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
