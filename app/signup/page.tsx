import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

export const metadata = {
  title: "Create account",
  description: "Create a Promethix3D customer account.",
};

export default function SignupPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <Container className="auth-layout">
          <div className="auth-intro">
            <p className="eyebrow">Customer account</p>
            <h1 className="font-heading page-title">Make it yours.</h1>
            <p>Create an account to keep track of your Promethix3D orders.</p>
          </div>
          <div className="auth-card">
            <AuthForm mode="signup" />
            <p className="auth-switch">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
