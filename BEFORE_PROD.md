# Checklist avant mise en production

Liste des tâches à compléter avant de déployer Verve en production.

---

## 🔐 Firebase

### Action URL des emails
Mettre à jour l'URL dans **Firebase Console → Authentication → Templates** pour chaque template :

| Template | Action URL à définir |
|---|---|
| Email address verification | `https://TON_DOMAINE.com/auth/action` |
| Password reset | `https://TON_DOMAINE.com/auth/action` |

> Actuellement configuré sur `http://localhost:3000/auth/action` (dev uniquement).

### Domaines autorisés
Firebase Console → Authentication → Sign-in method → **Authorized domains**
- Ajouter `TON_DOMAINE.com`
- Supprimer `localhost` si souhaité

### Règles Firestore
Firebase Console → Firestore → **Rules**
- Vérifier que les règles n'autorisent pas de lecture/écriture publique
- Exemple de règle minimale :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Emails (sender)
Firebase Console → Authentication → Templates → **From address**
- Configurer un domaine custom (`noreply@TON_DOMAINE.com`) pour éviter le dossier spam
- Nécessite une vérification DNS dans Firebase Console

---

## ⚙️ Variables d'environnement

### Frontend (Vercel ou autre)
Ajouter toutes les variables de `frontend/.env.local` dans le dashboard de l'hébergeur :
```
NEXT_PUBLIC_API_URL=https://api.TON_DOMAINE.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Backend (Render, Railway ou autre)
Ajouter toutes les variables de `backend/.env` dans le dashboard de l'hébergeur :
```
ENVIRONMENT=production
FRONTEND_URL=https://TON_DOMAINE.com
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
```

---

## 🍪 Cookie de session

Dans `frontend/src/app/api/auth/session/route.ts`, le cookie est déjà configuré avec `secure: process.env.NODE_ENV === "production"`. Rien à changer.

---

## 🔀 Proxy (middleware Next.js)

Dans `frontend/src/proxy.ts`, mettre à jour les routes protégées si de nouvelles pages nécessitent une authentification :
```ts
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/account"];
```

---

## 🌐 CORS (backend FastAPI)

Dans `backend/app/main.py`, le CORS est configuré avec `settings.frontend_url`.
S'assurer que `FRONTEND_URL` pointe bien vers le domaine de production.

---

## 📧 Emails transactionnels (optionnel, post-lancement)

Si tu veux des emails custom (bienvenue, notifications...) au-delà du reset/vérification Firebase :
- Créer un compte **Resend** (resend.com)
- Ajouter la clé API en variable d'environnement backend
- Configurer le domaine DNS dans Resend

---

## 🔑 Rotation des clés

- Ne jamais committer `backend/.env` ni `frontend/.env.local` dans git ✅ (déjà dans .gitignore)
- Supprimer le fichier JSON de service account téléchargé ✅ (déjà fait)
- En cas de fuite : **Firebase Console → Project Settings → Service Accounts → Revoke** l'ancienne clé et en générer une nouvelle

---

*Dernière mise à jour : avril 2026*
