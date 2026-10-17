"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

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
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <Container className="auth-layout">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="auth-card-wrap"
            style={{ width: "100%", maxWidth: "440px" }}
          >
            <div className="auth-intro">
              <span className="auth-brand-badge font-heading">
                Promethix<strong>3D</strong>
              </span>
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="font-heading page-title">{title}</h1>
              <p>{description}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="auth-card"
            >
              <AuthForm mode={mode} redirectTo={redirectTo} />
              <p className="auth-switch">
                {switchPrompt}{" "}
                <Link href={switchHref}>{switchLinkText}</Link>
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </main>
    </div>
  );
}
