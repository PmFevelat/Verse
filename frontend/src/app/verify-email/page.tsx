"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { authPrimaryButtonClassName } from "@/components/auth/auth-page-layout";

const POLL_INTERVAL_MS = 4000;
const RESEND_COOLDOWN_S = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling : recharger le token Firebase et vérifier emailVerified
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = firebaseAuth?.currentUser;
      if (!user) return;
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        // Créer le cookie de session maintenant que l'email est vérifié
        const idToken = await user.getIdToken(true);
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        router.push("/dashboard/gallery");
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN_S);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    setError(null);
    setResendLoading(true);
    setResendSuccess(false);
    try {
      const user = firebaseAuth?.currentUser;
      if (!user) {
        setError("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      await sendEmailVerification(user);
      setResendSuccess(true);
      startCooldown();
    } catch {
      setError("Impossible d'envoyer l'email. Veuillez réessayer.");
    } finally {
      setResendLoading(false);
    }
  }

  const userEmail = firebaseAuth?.currentUser?.email;

  return (
    <div className="flex min-h-svh flex-col bg-[#fafafa] px-4 py-10">
      <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-[380px] space-y-6 text-left">
        <Link
          href="/signup"
          className="mb-2 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
          aria-label="Back to sign up"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Link>

        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
          <MailCheck className="size-6 text-gray-700" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-normal tracking-tight text-gray-600">
            Check your{" "}
            <span className="font-semibold text-gray-700">inbox</span>
          </h1>
          <p className="text-base font-semibold text-foreground">
            Verify your email address
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            We sent a verification link to{" "}
            {userEmail ? (
              <span className="font-semibold text-gray-900">{userEmail}</span>
            ) : (
              "your email address"
            )}
            . Click the link to activate your account.
          </p>
          <p className="text-xs text-gray-400">
            This page will automatically redirect you once your email is
            verified.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        {resendSuccess && (
          <p className="text-xs text-green-700">
            Email renvoyé avec succès !
          </p>
        )}

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            className={authPrimaryButtonClassName}
          >
            {resendLoading
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification email"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Wrong email?{" "}
            <Link
              href="/signup"
              className="font-semibold text-gray-900 underline-offset-4 hover:underline"
            >
              Start over
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
