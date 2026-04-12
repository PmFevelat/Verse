"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  authFieldGroupClassName,
  authFooterLinkClassName,
  authFooterTextClassName,
  authFormClassName,
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-page-layout";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVerifiedSession,
  loginWithEmail,
  parseFirebaseError,
  signInWithGoogle,
} from "@/lib/auth-actions";
import { sendEmailVerification } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";

const ERROR_DISMISS_MS = 6000;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-dismiss error after a few seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), ERROR_DISMISS_MS);
    return () => clearTimeout(t);
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setLoading(true);

    try {
      const credential = await loginWithEmail({ email, password });

      if (!credential.user.emailVerified) {
        await firebaseAuth?.signOut();
        setNeedsVerification(true);
        return;
      }

      await createVerifiedSession(credential.user);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(parseFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      const credential = await loginWithEmail({ email, password });
      await sendEmailVerification(credential.user);
      await firebaseAuth?.signOut();
      setResendSuccess(true);
    } catch {
      setError("Unable to resend email. Please check your credentials.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();

      if (isNewUser) {
        // This is a brand-new account — they should have signed up first.
        await firebaseAuth?.signOut();
        setError(
          "No account found with this Google account. Please create an account first.",
        );
        return;
      }

      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(parseFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      title={
        <>
          Welcome back to <span className="font-semibold">Verve</span>!
        </>
      }
      subtitle="Sign in to your account"
      onGoogleClick={handleGoogle}
      googleLoading={loading}
    >
      {needsVerification ? (
        <div className="space-y-3 rounded-md bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            Your email address hasn&apos;t been verified yet. Please check your
            inbox and click the confirmation link.
          </p>
          {resendSuccess ? (
            <p className="font-medium text-green-700">
              Verification email sent! Check your inbox (and spam folder).
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="font-semibold underline underline-offset-2 hover:opacity-70 disabled:opacity-50"
            >
              {resendLoading ? "Sending…" : "Resend verification email"}
            </button>
          )}
        </div>
      ) : (
        <form className={authFormClassName} onSubmit={handleSubmit}>
          <div className={authFieldGroupClassName}>
            <Label htmlFor="login-email" className={authLabelClassName}>
              Email
            </Label>
            <Input
              id="login-email"
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
          <div className={authFieldGroupClassName}>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className={authLabelClassName}>
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-500 underline-offset-2 hover:underline"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              className={authInputClassName}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}{" "}
              {error.includes("create an account") && (
                <Link
                  href="/signup"
                  className="font-semibold underline underline-offset-2"
                >
                  Get Started →
                </Link>
              )}
            </p>
          )}

          <Button
            type="submit"
            className={authPrimaryButtonClassName}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      )}
      <p className={authFooterTextClassName}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={authFooterLinkClassName}>
          Get Started
        </Link>
      </p>
    </AuthScreenShell>
  );
}
