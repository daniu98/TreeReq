from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from config.sync_database import get_sync_db

router = APIRouter(prefix="/auth", tags=["auth"])

class GetDataRequest(BaseModel):
    email: str

@router.post("/get-data")
def get_data(data: GetDataRequest):
    db = get_sync_db()
    usersWithEmail = db.users.find_one({"email": data.email})
    try:
        return {"message": usersWithEmail["local_storage"]}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {exc}",
        ) from exc

    if result.matched_count == 0:
        return {"message": "User not found"}
