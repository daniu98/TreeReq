import pymongo
import os
import bcrypt
import json
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins = origins, allow_credentials = True, allow_methods = ["*"], allow_headers = ["*"])
# export MONGO_URI DB_NAME
client = pymongo.MongoClient(os.environ["MONGO_URI"])
db = client.get_database(os.environ["DB_NAME"])
class AuthData(BaseModel):
    email: str
    password: str
@app.post("/api/auth/signup")
def signup(data: AuthData):
    email = data.email
    password = data.password
    if((("@" in email) == False) or (("." in email) == False) or (" " in email) or (" " in password)):
        return {"message": "1 - INVALID INPUTS/EMAIL TAKEN"}
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
        passwordBytes = password.encode('utf-8')
        usersWithEmail.get("password")
        if(bcrypt.checkpw(passwordBytes, usersWithEmail.get("password"))):
            return {"message": "Successsfully signed in"}
    return {"message": "Incorrect email or password"}