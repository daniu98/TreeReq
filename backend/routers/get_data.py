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
    user = db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    local_storage = user.get("local_storage")
    if local_storage is None:
        raise HTTPException(status_code=404, detail="No profile data saved yet")
    return {"message": local_storage}
