"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, parseFirebaseError } from "@/lib/auth-actions";
import {
  authFieldGroupClassName,
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-page-layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      // Toujours afficher le même message (pas d'info-leak sur l'existence du compte)
      setSubmitted(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      // On masque volontairement user-not-found pour éviter l'enumeration d'emails
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        setSubmitted(true);
      } else {
        setError(parseFirebaseError(code));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#f9fafb] px-4 py-10 text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-[380px]">
          <Link
            href="/login"
            className="mb-8 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
            aria-label="Retour à la connexion"
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </Link>

          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-normal tracking-tight text-gray-600 md:text-[1.65rem] md:leading-snug">
              Forgot your{" "}
              <span className="font-semibold text-gray-700">password?</span>
            </h1>
            <p className="text-base font-semibold text-foreground">
              We&apos;ll send you a reset link
            </p>
          </div>

          <div className="mt-8">
            {submitted ? (
              <div className="space-y-4 rounded-md bg-green-50 p-5 text-sm text-green-900">
                <p className="font-medium">Check your inbox</p>
                <p>
                  If an account exists for{" "}
                  <span className="font-semibold">{email}</span>, you&apos;ll receive
                  a password reset link shortly.
                </p>
                <Link
                  href="/login"
                  className="inline-block font-semibold underline underline-offset-2 hover:opacity-70"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className={authFieldGroupClassName}>
                  <Label htmlFor="reset-email" className={authLabelClassName}>
                    Email address
                  </Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Your email"
                    className={authInputClassName}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className={authPrimaryButtonClassName}
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-gray-900 underline-offset-4 hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
