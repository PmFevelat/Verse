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
  parseFirebaseError,
  registerWithEmail,
  signInWithGoogle,
} from "@/lib/auth-actions";

const ERROR_DISMISS_MS = 6000;

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), ERROR_DISMISS_MS);
    return () => clearTimeout(t);
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerWithEmail({ fullName, email, password });
      router.push("/verify-email");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(parseFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();

      if (isNewUser) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard/gallery");
      }
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
          Welcome to <span className="font-semibold">Verve</span>!
        </>
      }
      subtitle="Create an Account to Get Started"
      onGoogleClick={handleGoogle}
      googleLoading={loading}
    >
      <form className={authFormClassName} onSubmit={handleSubmit}>
        <div className={authFieldGroupClassName}>
          <Label htmlFor="signup-name" className={authLabelClassName}>
            Full Name
          </Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className={authInputClassName}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className={authFieldGroupClassName}>
          <Label htmlFor="signup-email" className={authLabelClassName}>
            Email
          </Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password" className={authLabelClassName}>
            Password
          </Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password (6+ characters)"
            className={authInputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <p style={{ color: "#dc2626" }} className="text-xs font-medium" role="alert">
            {error}{" "}
            {error.includes("already associated") && (
              <Link
                href="/login"
                className="font-semibold underline underline-offset-2"
              >
                Sign In →
              </Link>
            )}
          </p>
        )}

        <Button
          type="submit"
          className={authPrimaryButtonClassName}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>
      <p className={authFooterTextClassName}>
        Already have an account?{" "}
        <Link href="/login" className={authFooterLinkClassName}>
          Sign In
        </Link>
      </p>
    </AuthScreenShell>
  );
}
