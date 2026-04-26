import pymongo
import os
import bcrypt
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins = origins, allow_credentials = True, allow_methods = ["*"], allow_headers = ["*"])
# export MONGO_URI DB_NAME
client = pymongo.MongoClient(os.environ["MONGO_URI"])
db = client.get_database(os.environ["DB_NAME"])
@app.post("/api/auth/signup")
def signup(inputJson):
    email = json.loads(inputJson)["email"]
    password = json.loads(inputJson)["password"]
    if((("@" in email) == False) or (("." in email) == False) or (" " in email) or (" " in password)):
        return 2
    usersWithEmail = db.users.find_one({"email": email})
    if usersWithEmail == None:
        passwordBytes = password.encode('utf-8')
        bCryptSalt = bcrypt.gensalt()
        passwordHash = bcrypt.hashpw(passwordBytes, bCryptSalt)
        db.users.insert_one({"email": email, "password": passwordHash})
        return {"message": "0 - SUCCESS"}
    else:
        return {"message": "1 - INVALID INPUTS/EMAIL TAKEN"}
@app.post("/api/auth/login")
def login(inputJson):
    email = json.loads(inputJson)["email"]
    password = json.loads(inputJson)["password"]
    usersWithEmail = db.users.find_one({"email": email})
    if usersWithEmail:
        passwordBytes = password.encode('utf-8')
        uswersWithEmail.get("password")
        if(bcrypt.checkpw(passwordBytes, realPasswordHash)):
            return {"message": "0 - SUCCESS"}
    return {"message": "1 - INCORRECT EMAIL/PASSWORD"}