import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuth(): Auth {
  if (!auth) throw new Error("Firebase Auth is not available server-side.");
  return auth;
}

// ─── Session cookie helpers ───────────────────────────────────────────────────

async function createSessionCookie(user: User) {
  const idToken = await user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

async function deleteSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

// ─── Error mapping ────────────────────────────────────────────────────────────

export function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use":
      "This email address is already associated with an account.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password is too weak (minimum 6 characters).",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests":
      "Too many attempts. Please try again in a few minutes.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/popup-closed-by-user": "Sign-in cancelled.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection.",
  };
  return map[code] ?? "An unexpected error occurred. Please try again.";
}

// ─── Backend profile sync (non-blocking) ─────────────────────────────────────

async function syncProfileToBackend(payload: {
  full_name: string;
  email: string;
  provider: "email" | "google";
}) {
  try {
    await api.post("/users/register", payload);
  } catch {
    // Backend might not be running in dev — log but don't block the auth flow.
    console.warn("[auth] Backend profile sync failed — will retry on next request.");
  }
}

// ─── Register (email/password) ────────────────────────────────────────────────

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export async function registerWithEmail({
  fullName,
  email,
  password,
}: RegisterPayload): Promise<UserCredential> {
  const a = getAuth();
  const credential = await createUserWithEmailAndPassword(a, email, password);

  await updateProfile(credential.user, { displayName: fullName });
  await sendEmailVerification(credential.user);

  // Non-blocking — email verification is the critical path, not Firestore.
  void syncProfileToBackend({ full_name: fullName, email, provider: "email" });

  return credential;
}

// ─── Login (email/password) ───────────────────────────────────────────────────

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginWithEmail({
  email,
  password,
}: LoginPayload): Promise<UserCredential> {
  const a = getAuth();
  return signInWithEmailAndPassword(a, email, password);
}

export async function createVerifiedSession(user: User) {
  await createSessionCookie(user);
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export type GoogleSignInResult = {
  credential: UserCredential;
  isNewUser: boolean;
  displayName: string;
  email: string;
};

/**
 * Launches the Google popup and returns the credential + whether this is a
 * brand-new Firebase account.
 *
 * The calling page decides the next step:
 *   - Login page  → if isNewUser, show error + link to signup
 *   - Signup page → if isNewUser, go to /onboarding; if returning, go to dashboard
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const a = getAuth();
  const credential = await signInWithPopup(a, googleProvider);
  const info = getAdditionalUserInfo(credential);
  const isNewUser = info?.isNewUser ?? false;

  if (!isNewUser) {
    // Returning user: create session cookie straight away.
    await createSessionCookie(credential.user);
  }

  return {
    credential,
    isNewUser,
    displayName: credential.user.displayName ?? "",
    email: credential.user.email ?? "",
  };
}

/**
 * Finalises a Google signup after the onboarding step:
 * saves the profile to Firestore and creates the session cookie.
 */
export async function finaliseGoogleSignup(
  user: User,
  fullName: string,
): Promise<void> {
  // Update Firebase displayName if the user changed it during onboarding
  if (fullName && fullName !== user.displayName) {
    await updateProfile(user, { displayName: fullName });
  }

  void syncProfileToBackend({
    full_name: fullName || user.displayName || "",
    email: user.email ?? "",
    provider: "google",
  });

  await createSessionCookie(user);
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  const a = getAuth();
  await sendPasswordResetEmail(a, email);
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const a = getAuth();
  await Promise.all([signOut(a), deleteSessionCookie()]);
}
