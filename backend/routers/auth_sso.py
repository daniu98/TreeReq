import os

from fastapi import APIRouter, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel

from config.sync_database import get_sync_db, user_is_onboarded

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleTokenBody(BaseModel):
    token: str


def _google_client_id() -> str:
    return (
        os.environ.get("GOOGLE_CLIENT_ID", "").strip()
        or os.environ.get("VITE_GOOGLE_CLIENT_ID", "").strip()
    )


@router.post("/google-sso")
def google_sso(body: GoogleTokenBody):
    """
    Verify Google ID token, upsert user, return onboarded status (one round trip).
    """
    client_id = _google_client_id()
    if not client_id:
        raise HTTPException(
            status_code=500,
            detail=(
                "Set GOOGLE_CLIENT_ID in backend/.env, or VITE_GOOGLE_CLIENT_ID in frontend/.env "
                "(same OAuth 2.0 Web client ID from Google Cloud Console)."
            ),
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            body.token,
            google_requests.Request(),
            client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google token",
        )

    email = idinfo.get("email")
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Google account has no email on file",
        )

    google_id = idinfo["sub"]

    try:
        db = get_sync_db()
        user = db.users.find_one({"email": email})
        if user is None:
            db.users.insert_one(
                {
                    "email": email,
                    "googleId": google_id,
                    "first_name": "",
                    "last_name": "",
                    "major": "",
                    "minor": "",
                    "admit_term": "",
                    "admit_level": "",
                    "expected_graduation_term": "",
                    "ap_classes": [],
                    "ib_classes": [],
                    "ucla_classes": [],
                }
            )
            user = db.users.find_one({"email": email})
            message = f"Signed up as {email}"
        else:
            message = f"Signed in as {email}"

        onboarded = user_is_onboarded(user)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Database error during sign-in: {exc}",
        ) from exc

    return {
        "message": message,
        "email": email,
        "onboarded": onboarded,
    }
