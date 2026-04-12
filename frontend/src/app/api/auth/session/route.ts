import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "__verve_session";
// Cookie valide 7 jours
const MAX_AGE = 60 * 60 * 24 * 7;

/**
 * POST /api/auth/session
 * Crée un cookie de session httpOnly à partir de l'idToken Firebase.
 * Appelé côté client juste après la connexion/inscription réussie.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken: string | undefined = body?.idToken;

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "idToken requis" }, { status: 400 });
  }

  // On stocke l'idToken tel quel dans un cookie httpOnly.
  // La vérification réelle du token reste du ressort du backend FastAPI.
  // Ce cookie sert uniquement à indiquer la présence d'une session au middleware.
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/auth/session
 * Supprime le cookie de session (logout).
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
