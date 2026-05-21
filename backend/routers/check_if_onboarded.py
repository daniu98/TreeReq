import os
import pymongo
from dotenv import load_dotenv, dotenv_values
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router = APIRouter(prefix="/auth", tags=["auth"])
load_dotenv()
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client.get_database(os.getenv("DB_NAME"))

class EmailRequest(BaseModel):
    email: str

@router.post("/check-if-onboarded")
def check_if_onboarded(request: EmailRequest):
    user = db.users.find_one({"email": request.email})
    if(user == None):
        return {"message": "User not found"}
    else:
        try:
            if(user["first_name"] == "" or user["last_name"] == "" or user["major"] == ""):
                return {"message": "User did not onboard"}
            else:
                return {"message": "User already onboarded"}
        except:
            return {"message": "Error: something went wrong"}
