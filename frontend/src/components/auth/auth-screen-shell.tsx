import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { cn } from "@/lib/utils";

type AuthScreenShellProps = {
  children: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  onGoogleClick?: () => void;
  googleLoading?: boolean;
  hideGoogle?: boolean;
  className?: string;
};

function SubtitleText({ children }: { children: ReactNode }) {
  return (
    <p className="text-base font-semibold text-foreground">{children}</p>
  );
}

export function AuthScreenShell({
  children,
  title,
  subtitle,
  onGoogleClick,
  googleLoading,
  hideGoogle = false,
  className,
}: AuthScreenShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-col bg-[#fafafa] px-4 py-10 text-foreground",
        className,
      )}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative w-full max-w-[380px]">
          <Link
            href="/"
            className="mb-8 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </Link>

          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-normal tracking-tight text-gray-600 md:text-[1.65rem] md:leading-snug [&_span]:text-gray-700">
              {title}
            </h1>
            <SubtitleText>{subtitle}</SubtitleText>
          </div>

          <div className="mt-8 space-y-5">
            {!hideGoogle && (
              <>
                <GoogleOAuthButton onClick={onGoogleClick} disabled={googleLoading} />
                <Separator className="bg-border/80" />
              </>
            )}
            <div className="space-y-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
