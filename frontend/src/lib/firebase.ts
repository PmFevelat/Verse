import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase Client SDK doit uniquement s'initialiser dans le navigateur.
 * Le SDK n'est pas conçu pour le SSR — on retourne null côté serveur,
 * ce qui est sûr car tous les composants qui utilisent Firebase sont "use client".
 */
function getApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) return null;
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

function createAuth(): Auth | null {
  const app = getApp();
  return app ? getAuth(app) : null;
}

function createFirestore(): Firestore | null {
  const app = getApp();
  return app ? getFirestore(app) : null;
}

// Ces exports sont null côté serveur (SSR/build) et initialisés côté client.
// Les composants "use client" ne s'exécutent jamais sur le serveur après
// la phase d'initialisation, donc l'utilisation de `auth!` dans les actions
// client est sûre.
export const auth = createAuth();
export const db = createFirestore();
