from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, EmailStr


class AuthProvider(str, Enum):
    email = "email"
    google = "google"


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    provider: AuthProvider = AuthProvider.email


class UserProfile(BaseModel):
    uid: str
    full_name: str
    email: str
    provider: AuthProvider
    email_verified: bool
    created_at: datetime
    updated_at: datetime


def user_profile_from_firestore(uid: str, data: dict) -> dict:
    return {"uid": uid, **data}


def build_user_document(
    uid: str,
    full_name: str,
    email: str,
    provider: AuthProvider,
    email_verified: bool,
    now: datetime | None = None,
) -> dict:
    ts = now or datetime.now(timezone.utc)
    return {
        "uid": uid,
        "full_name": full_name,
        "email": email,
        "provider": provider.value,
        "email_verified": email_verified,
        "created_at": ts,
        "updated_at": ts,
    }
