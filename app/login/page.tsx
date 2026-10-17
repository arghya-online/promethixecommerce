import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Promethix3D account.",
};

export default function LoginPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <Container className="auth-layout">
          <div className="auth-intro">
            <p className="eyebrow">Customer account</p>
            <h1 className="font-heading page-title">Welcome back.</h1>
            <p>Sign in to view your orders and continue where you left off.</p>
          </div>
          <div className="auth-card">
            <AuthForm mode="signin" />
            <p className="auth-switch">
              New to Promethix3D? <Link href="/signup">Create an account</Link>
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
