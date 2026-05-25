from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config.sync_database import get_sync_db, user_is_onboarded

router = APIRouter(prefix="/auth", tags=["auth"])


class EmailRequest(BaseModel):
    email: str


@router.post("/check-if-onboarded")
def check_if_onboarded(request: EmailRequest):
    try:
        db = get_sync_db()
        user = db.users.find_one({"email": request.email})
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {exc}",
        ) from exc

    if user is None:
        return {"message": "User not found", "onboarded": False}

    if user_is_onboarded(user):
        return {"message": "User already onboarded", "onboarded": True}

    return {"message": "User did not onboard", "onboarded": False}
