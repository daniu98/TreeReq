from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from config.sync_database import get_sync_db

router = APIRouter(prefix="/auth", tags=["auth"])

class UpdateDataRequest(BaseModel):
    email: str
    data: Dict[str, Any]

@router.post("/update-data")
def update_data(data: UpdateDataRequest):
    db = get_sync_db()
    usersWithEmail = db.users.find_one({"email": data.email})
    if usersWithEmail == None:
        db.users.insert_one({"email": data.email})
    try:
        result = db.users.update_one(
            {"email": data.email},
            {
                "$set": {
                    "local_storage": data.data,
                }
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {exc}",
        ) from exc

    if result.matched_count == 0:
        return {"message": "User not found"}

    return {"message": "Data updated successfully"}
    
