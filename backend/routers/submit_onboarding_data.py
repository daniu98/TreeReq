import os
import pymongo
from dotenv import load_dotenv, dotenv_values
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router = APIRouter(prefix="/auth", tags=["auth"])
load_dotenv()
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client.get_database(os.getenv("DB_NAME"))

class OnboardingData(BaseModel):
    email: str
    firstName: str
    lastName: str
    major: str
    minor: str
    admitTerm: str
    admitLevel: str
    expectedGraduationTerm: str
    apClasses: list[str]
    ibClasses: list[str]
    uclaClasses: list[str]

@router.post("/submit-onboarding-data")
def submit_onboarding_data(data: OnboardingData):
    collection = db["users"]
    filter_criteria = {"email": data.email}
    update_operation = {"$set": {
        "first_name": data.firstName,
        "last_name": data.lastName,
        "major": data.major,
        "minor": data.minor,
        "admit_term": data.admitTerm,
        "admit_level": data.admitLevel,
        "expected_graduation_term": data.expectedGraduationTerm,
        "ap_classes": data.apClasses,
        "ib_classes": data.ibClasses,
        "ucla_classes": data.uclaClasses
    }}
    result = collection.update_one(filter_criteria, update_operation)
    
    if result.matched_count == 0:
        return {"message": "User not found"}
        
    return {"message": "Onboarding data saved successfully"}
