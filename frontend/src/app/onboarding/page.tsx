"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth as firebaseAuth } from "@/lib/firebase";
import { finaliseGoogleSignup } from "@/lib/auth-actions";
import {
  authFieldGroupClassName,
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-page-layout";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill name from the Google account
  useEffect(() => {
    const user = firebaseAuth?.currentUser;
    if (!user) {
      // No active session — send back to signup
      router.replace("/signup");
      return;
    }
    setDisplayName(user.displayName ?? "");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = firebaseAuth?.currentUser;
      if (!user) throw new Error("No active session.");

      await finaliseGoogleSignup(user, displayName.trim());
      router.push("/dashboard/gallery");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      hideGoogle
      title={
        <>
          You&apos;re almost in,{" "}
          <span className="font-semibold">
            {displayName.split(" ")[0] || "there"}
          </span>
          !
        </>
      }
      subtitle="Confirm your display name to finish setting up your account"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className={authFieldGroupClassName}>
          <Label htmlFor="onboarding-name" className={authLabelClassName}>
            Display Name
          </Label>
          <Input
            id="onboarding-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={authInputClassName}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-[11px] text-gray-400">
            This is how you&apos;ll appear across Verve.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className={authPrimaryButtonClassName}
          disabled={loading || !displayName.trim()}
        >
          {loading ? "Setting up your account…" : "Get Started →"}
        </Button>
      </form>
    </AuthScreenShell>
  );
}
