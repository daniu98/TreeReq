from fastapi import FastAPI
from contextlib import asynccontextmanager
from config.database import connect_db, close_db
from routers import courses, majors
import pymongo
import os
import bcrypt

@asynccontextmanager
async def lifespan(app):
    await connect_db()
    yield
    await close_db()


app = FastAPI(lifespan=lifespan)


@app.get("/")
def home():
    return {"status": "ok", "project": "TreeReq"}

app.include_router(courses.router, prefix="/api")
app.include_router(majors.router, prefix="/api")
# export MONGO_URI MONGO_NAME
client = pymongo.MongoClient(os.environ["MONGO_URI"])
db = client.get_database(os.environ["MONGO_NAME"])
collections = db.list_collection_names()
for collection in collections:
    print(collection)
def createUser(username, email, password):
    # 0 - SUCCESS, 1 - USERNAME OR EMAIL TAKEN, 2 - INVALID CREDENTIALS 3 - OTHER ERROR
    if(((".com" in email) == False) or (" " in username) or (" " in email) or (" " in password)):
        return 2
    usersWithName = db.users.find_one({"username": username})
    if usersWithName == None:
        usersWithEmail = db.users.find_one({"email": email})
        if usersWithEmail == None:
            if(db.users.find_one({"email": username}) == None and db.users.find_one({"username": email}) == None):
                passwordBytes = password.encode('utf-8')
                bCryptSalt = bcrypt.gensalt()
                passwordHash = bcrypt.hashpw(passwordBytes, bCryptSalt)
                db.users.insert_one({"username": username, "email": email, "password": passwordHash})
                if db.users.find_one({"username": username}) == None:
                    return 3
                else:
                    return 0
            else:
                return 1
        else:
            return 1
    else:
        return 1
def signinUser(usernameOrEmail, password):
    # 0 - SUCCESS, 1 = INCORRECT USERNAME/EMAIL OR PASSWORD
    usersWithName = db.users.find_one({"username": usernameOrEmail})
    if usersWithName:
        passwordBytes = password.encode('utf-8')
        realPasswordHash = db.users.find_one({"username": usernameOrEmail}).get("password")
        if(bcrypt.checkpw(passwordBytes, realPasswordHash)):
           return 0
        print(db.users.find_one({"username": usernameOrEmail}).get("password"))
    usersWithEmail = db.users.find_one({"email": usernameOrEmail})
    if usersWithEmail:
        passwordBytes = password.encode('utf-8')
        realPasswordHash = db.users.find_one({"email": usernameOrEmail}).get("password")
        if(bcrypt.checkpw(passwordBytes, realPasswordHash)):
            return 0
    return 1;
