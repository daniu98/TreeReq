from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config.sync_database import get_sync_db

router = APIRouter(prefix="/auth", tags=["auth"])


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
    db = get_sync_db()
    usersWithEmail = db.users.find_one({"email": data.email})
    if usersWithEmail == None:
        db.users.insert_one({"email": data.email})
    try:
        db = get_sync_db()
        result = db.users.update_one(
            {"email": data.email},
            {
                "$set": {
                    "first_name": data.firstName,
                    "last_name": data.lastName,
                    "major": data.major,
                    "minor": data.minor,
                    "admit_term": data.admitTerm,
                    "admit_level": data.admitLevel,
                    "expected_graduation_term": data.expectedGraduationTerm,
                    "ap_classes": data.apClasses,
                    "ib_classes": data.ibClasses,
                    "ucla_classes": data.uclaClasses,
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

    return {"message": "Onboarding data saved successfully"}
