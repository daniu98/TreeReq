import os

from fastapi import APIRouter, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleTokenBody(BaseModel):
    token: str


@router.post("/google-sso")
def google_sso(body: GoogleTokenBody):
    """
    Verifies a Google ID token from @react-oauth/google and returns a short success payload.
    Set GOOGLE_CLIENT_ID to the same OAuth 2.0 Web Client ID as VITE_GOOGLE_CLIENT_ID in the frontend.
    """
    client_id = (
        os.environ.get("GOOGLE_CLIENT_ID", "").strip()
        or os.environ.get("VITE_GOOGLE_CLIENT_ID", "").strip()
    )
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
    return {"message": f"Signed in as {email}", "email": email}
