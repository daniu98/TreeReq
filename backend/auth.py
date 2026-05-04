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
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins = origins, allow_credentials = True, allow_methods = ["*"], allow_headers = ["*"])
# export MONGO_URI DB_NAME GOOGLE_CLIENT_ID
client = pymongo.MongoClient(os.environ["MONGO_URI"])
db = client.get_database(os.environ["DB_NAME"])
class AuthData(BaseModel):
    email: str
    password: str
class TokenBody(BaseModel):
    token: str
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
@app.post("/api/auth/google_sso")
def google_sso(body: TokenBody):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), os.environ["GOOGLE_CLIENT_ID"])
        if(idinfo["email_verified"] == "true"):
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
    except:
        return{"message": "Invalid token"}
