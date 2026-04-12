import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

_db = None


def init_firebase() -> None:
    if firebase_admin._apps:
        return

    cred = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key_id": settings.firebase_private_key_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "client_id": settings.firebase_client_id,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )
    firebase_admin.initialize_app(cred)


def get_db() -> firestore.Client:
    global _db
    if _db is None:
        _db = firestore.client()
    return _db
