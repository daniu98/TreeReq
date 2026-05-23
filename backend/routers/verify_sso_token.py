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


@router.post("/verify-sso-token")
def verify_sso_token(body: GoogleTokenBody):
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
        return { "message": "Valid token" }
    except:
        return { "message": "Invalid token" }
