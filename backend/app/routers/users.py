from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.core.firebase import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retourne les infos de l'utilisateur connecté."""
    db = get_db()
    uid = current_user["uid"]

    doc = db.collection("users").document(uid).get()
    if doc.exists:
        return {"uid": uid, **doc.to_dict()}

    return {"uid": uid, "email": current_user.get("email")}
