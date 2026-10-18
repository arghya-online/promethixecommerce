"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle, Lock, Mail, User } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
            "Authentication failed. Please verify your credentials.",
        );
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Auth request failed", err);
      setError("Unable to reach the authentication service. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {isSignUp && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Full Name</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="e.g. Debanjan Mukherjee"
            required
            className="text-xs h-10"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-primary" />
          <span>Email Address</span>
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="your.email@example.com"
          required
          className="text-xs h-10"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Password</span>
          </label>
          {!isSignUp && (
            <span className="text-[11px] text-foreground-muted">
              Min. 8 characters
            </span>
          )}
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder="••••••••"
          required
          minLength={8}
          className="text-xs h-10"
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-accent-strong text-white font-semibold h-11 text-xs shadow-xs"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <span>{isSignUp ? "Create Promethix3D Account" : "Sign In to Promethix3D"}</span>
        )}
        {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
      </Button>
    </form>
  );
}
