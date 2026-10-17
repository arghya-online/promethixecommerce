import { AuthPageClient } from "@/components/auth/auth-page-client";

export const metadata = {
  title: "Create Account | Promethix3D",
  description: "Create a Promethix3D customer account.",
};

export default function SignupPage() {
  return (
    <AuthPageClient
      mode="signup"
      eyebrow="Join Promethix3D"
      title="Create account."
      description="Keep track of your orders, custom fabrication requests, and fast re-ordering."
      switchPrompt="Already have an account?"
      switchLinkText="Sign in"
      switchHref="/login"
      redirectTo="/account"
    />
  );
}
