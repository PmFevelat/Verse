"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { applyActionCode } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { authPrimaryButtonClassName } from "@/components/auth/auth-page-layout";

type Status = "loading" | "success" | "error";

export default function AuthActionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode || mode !== "verifyEmail") {
      setStatus("error");
      setErrorMessage("Invalid or expired verification link.");
      return;
    }

    async function verify() {
      try {
        const auth = firebaseAuth;
        if (!auth) throw new Error("Auth not available.");

        await applyActionCode(auth, oobCode!);

        // Reload the current user to update emailVerified flag
        if (auth.currentUser) {
          await auth.currentUser.reload();
          // Create session cookie now that email is verified
          const idToken = await auth.currentUser.getIdToken(true);
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        }

        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage(
          "This verification link has expired or already been used.",
        );
      }
    }

    void verify();
  }, [mode, oobCode]);

  return (
    <div className="flex min-h-svh flex-col bg-[#fafafa] px-4 py-10">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-[380px] space-y-6 text-left">
          <Link
            href="/"
            className="mb-2 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </Link>

          {status === "loading" && (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-normal tracking-tight text-gray-600">
                  Verifying your{" "}
                  <span className="font-semibold text-gray-700">email…</span>
                </h1>
                <p className="text-base font-semibold text-foreground">
                  Just a moment
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                Confirming your address…
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="size-6 text-green-600" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-normal tracking-tight text-gray-600">
                  Email{" "}
                  <span className="font-semibold text-gray-700">verified!</span>
                </h1>
                <p className="text-base font-semibold text-foreground">
                  Your account is now active
                </p>
              </div>
              <p className="text-sm text-gray-600">
                You&apos;re all set. Sign in to start using Verve.
              </p>
              <Button
                className={authPrimaryButtonClassName}
                onClick={() => router.push("/login")}
              >
                Sign In →
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-red-50">
                <XCircle className="size-6 text-red-500" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-normal tracking-tight text-gray-600">
                  Something went{" "}
                  <span className="font-semibold text-gray-700">wrong</span>
                </h1>
                <p className="text-base font-semibold text-foreground">
                  Verification failed
                </p>
              </div>
              <p className="text-sm text-gray-600">{errorMessage}</p>
              <div className="space-y-3">
                <Button
                  className={authPrimaryButtonClassName}
                  onClick={() => router.push("/signup")}
                >
                  Try again
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Already verified?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-gray-900 underline-offset-4 hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
