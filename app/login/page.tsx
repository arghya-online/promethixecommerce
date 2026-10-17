import { AuthPageClient } from "@/components/auth/auth-page-client";

export const metadata = {
  title: "Sign in | Promethix3D",
  description: "Sign in to your Promethix3D account.",
};

export default function LoginPage() {
  return (
    <AuthPageClient
      mode="signin"
      eyebrow="Customer Account"
      title="Welcome back."
      description="Sign in to view your orders, custom inquiries, and account details."
      switchPrompt="New to Promethix3D?"
      switchLinkText="Create an account"
      switchHref="/signup"
      redirectTo="/account"
    />
  );
}
