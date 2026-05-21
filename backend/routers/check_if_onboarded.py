import os
import pymongo
from dotenv import load_dotenv, dotenv_values
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router = APIRouter(prefix="/auth", tags=["auth"])
load_dotenv()
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client.get_database(os.getenv("DB_NAME"))

@router.post("/check-if-onboarded")
def check_if_onboarded(email: str):
    user = db.users.find_one({"email": email})
    if(user == None):
        return {"message": "User not found"}
    else:
        if(user.first_name == "" or user.last_name == "" or user.major == ""):
            return {"message": "User did not onboard"}
        else:
            return {"message": "User already onboarded"}
    
