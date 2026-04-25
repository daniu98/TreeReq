import pymongo
import os
import bcrypt
# export MONGO_URI DB_NAME
client = pymongo.MongoClient(os.environ["MONGO_URI"])
db = client.get_database(os.environ["DB_NAME"])
def signup(email, password):
    # 0 - SUCCESS, 1 - EMAIL TAKEN, 2 - INVALID CREDENTIALS 3 - OTHER ERROR
    if((("@" in email) == False) or (("." in email) == false) or (" " in email) or (" " in password)):
        return 2
    usersWithEmail = db.users.find_one({"email": email})
    if usersWithEmail == None:
        passwordBytes = password.encode('utf-8')
        bCryptSalt = bcrypt.gensalt()
        passwordHash = bcrypt.hashpw(passwordBytes, bCryptSalt)
        db.users.insert_one({"email": email, "password": passwordHash})
        if db.users.find_one({"email": email}) == None:
            return 3
        else:
            return 0
    else:
        print(usersWithEmail.get("password"))
        return 1
def login(email, password):
    # 0 - SUCCESS, 1 = INCORRECT EMAIL OR PASSWORD
    usersWithEmail = db.users.find_one({"email": email})
    if usersWithEmail:
        passwordBytes = password.encode('utf-8')
        realPasswordHash = db.users.find_one({"email": email}).get("password")
        if(bcrypt.checkpw(passwordBytes, realPasswordHash)):
            return 0
    return 1;
