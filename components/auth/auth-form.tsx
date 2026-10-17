"use client";

import { ArrowRight, Spinner, WarningCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
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

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = isSignUp
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
          });

      if (response.error) {
        setError(
          response.error.message ||
            "Authentication failed. Please check your credentials.",
        );
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Authentication request failed", error);
      setError(
        "We could not reach the authentication service. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {isSignUp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <label className="form-field">
            Full Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="e.g. Debanjan Mukherjee"
              required
            />
          </label>
        </motion.div>
      )}

      <label className="form-field">
        Email Address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="your.email@example.com"
          required
        />
      </label>

      <div className="form-field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Password</span>
          {!isSignUp && (
            <Link
              href="/forgot-password"
              style={{
                fontSize: "0.8rem",
                color: "#D9531E",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          )}
        </div>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="feedback feedback-error"
            role="alert"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <WarningCircle size={18} weight="bold" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading ? <Spinner className="spin" size={18} aria-hidden="true" /> : null}
        <span>{loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</span>
        {!loading && <ArrowRight size={18} aria-hidden="true" />}
      </motion.button>
    </form>
  );
}
