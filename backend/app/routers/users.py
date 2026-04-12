from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.core.firebase import get_db
from app.models.user import AuthProvider, RegisterRequest, build_user_document

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", status_code=status.HTTP_200_OK)
async def register_user(
    body: RegisterRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Crée ou met à jour le profil utilisateur dans Firestore.

    - Appelé juste après la création du compte Firebase (email ou Google).
    - Idempotent : un second appel met simplement à jour `updated_at` et
      `email_verified`, sans écraser `created_at`.
    - La déduplication email est garantie par Firebase Auth en amont ;
      ce endpoint sert de source de vérité pour les données métier.
    """
    db = get_db()
    uid: str = current_user["uid"]
    now = datetime.now(timezone.utc)

    # Vérification de cohérence : le token doit appartenir à l'email déclaré
    token_email: str = current_user.get("email", "")
    if token_email.lower() != body.email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'email du token ne correspond pas à l'email de la requête.",
        )

    doc_ref = db.collection("users").document(uid)
    existing = doc_ref.get()

    email_verified: bool = current_user.get("email_verified", False)

    if existing.exists:
        # Mise à jour partielle : on ne touche pas created_at ni provider original
        doc_ref.update(
            {
                "email_verified": email_verified,
                "full_name": body.full_name or existing.to_dict().get("full_name", ""),
                "updated_at": now,
            }
        )
        return {"uid": uid, "created": False}

    # Première création
    doc = build_user_document(
        uid=uid,
        full_name=body.full_name,
        email=body.email,
        provider=body.provider,
        email_verified=email_verified,
        now=now,
    )
    doc_ref.set(doc)
    return {"uid": uid, "created": True}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retourne le profil complet de l'utilisateur connecté."""
    db = get_db()
    uid: str = current_user["uid"]

    doc = db.collection("users").document(uid).get()
    if doc.exists:
        return {"uid": uid, **doc.to_dict()}

    # Fallback si le profil Firestore n'existe pas encore (cas edge)
    return {
        "uid": uid,
        "email": current_user.get("email"),
        "email_verified": current_user.get("email_verified", False),
    }
