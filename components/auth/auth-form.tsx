"use client";

import { ArrowRight, Spinner } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/src/lib/auth-client";

export function AuthForm({
  mode,
  redirectTo = "/account",
}: {
  mode: "signin" | "signup";
  redirectTo?: string;
}) {
  const router = useRouter();
  const isSignUp = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const response = isSignUp
      ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
      : await authClient.signIn.email({ email: email.trim(), password });

    if (response.error) {
      setError(response.error.message || "Authentication failed. Please try again.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {isSignUp ? (
        <label className="form-field">
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </label>
      ) : null}
      <label className="form-field">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label className="form-field">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={8}
        />
      </label>
      {error ? (
        <p className="feedback feedback-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="button button-primary auth-submit" disabled={loading}>
        {loading ? <Spinner className="spin" size={18} aria-hidden="true" /> : null}
        {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        {!loading ? <ArrowRight size={18} aria-hidden="true" /> : null}
      </button>
    </form>
  );
}
