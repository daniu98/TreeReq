import pymongo
import os
import bcrypt
import json
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import id_token
from google.auth.transport import requests
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv, dotenv_values
load_dotenv()
app = FastAPI()
origins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:8000", "http://127.0.0.1:5173"]
app.add_middleware(CORSMiddleware, allow_origins = origins, allow_credentials = True, allow_methods = ["*"], allow_headers = ["*"])
# export MONGO_URI DB_NAME GOOGLE_CLIENT_ID
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client.get_database(os.getenv("DB_NAME"))
class AuthData(BaseModel):
    email: str
    password: str
class TokenBody(BaseModel):
    token: str
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
@app.post("/api/auth/signup")
def signup(data: AuthData):
    email = data.email
    password = data.password
    if((("@" in email) == False) or (("." in email) == False) or (" " in email) or (" " in password)):
        return {"message": "Invalid inputs"}
    usersWithEmail = db.users.find_one({"email": email})
    if usersWithEmail == None:
        passwordBytes = password.encode('utf-8')
        bCryptSalt = bcrypt.gensalt()
        passwordHash = bcrypt.hashpw(passwordBytes, bCryptSalt)
        db.users.insert_one({"email": email, "password": passwordHash})
        return {"message": "Successfully signed up"}
    else:
        return {"message": "Invalid inputs or Email taken"}
@app.post("/api/auth/login")
def login(data: AuthData):
    email = data.email
    password = data.password
    usersWithEmail = db.users.find_one({"email": email})
    if usersWithEmail:
        try:
            passwordBytes = password.encode('utf-8')
            usersWithEmail.get("password")
            if(bcrypt.checkpw(passwordBytes, usersWithEmail.get("password"))):
                return {"message": "Successsfully signed in"}
        except:
            return {"No password set. Sign in with Google"}
    return {"message": "Incorrect email or password"}
@app.post("/api/auth/google-sso")
def google_sso(body: TokenBody):
    try:
        idinfo = id_token.verify_oauth2_token(body.token, requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        if(idinfo["email_verified"] == True):
            email = idinfo["email"]
            googleId = idinfo["sub"]
            usersWithEmail = db.users.find_one({"email": email})
            if(usersWithEmail == None):
                db.users.insert_one({"email": email, "googleId": googleId})
                return {"message": "Successfully signed up and signed in"}
            else:
                return {"message": "Successfully signed in"}
        else:
            return{"message": "Email not verified"}
    except Exception:
        return{"message": "Invalid token"}
@app.post("/api/auth/submit-onboarding-data")
def submit_onboarding_data(data: OnboardingData):
    collection = db["users"]
    filter_criteria = {"email": data.email}
    update_operation{"$set": {"first_name": data.firstName}}
    update_operation{"$set": {"last_name": data.lastName}}
    update_operation{"$set": {"major": data.major}}
    update_operation{"$set": {"minor": data.minor}}
    update_operation{"$set": {"admit_term": data.admitTerm}}
    update_operation{"$set": {"admit_level": data.admitLevel}}
    update_operation{"$set": {"expected_graduation_term": data.expectedGraduationTerm}}
    update_operation{"$set": {"ap_classes": data.apClasses}}
    update_operation{"$set": {"ib_classes": data.ibClasses}}
    update_operation{"$set": {"ucla_classes": data.uclaClasses}}
    
