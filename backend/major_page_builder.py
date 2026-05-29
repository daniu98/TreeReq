import pymongo
import os
from dotenv import load_dotenv, dotenv_values
load_dotenv()
# export MONGO_URI DB_NAME GOOGLE_CLIENT_ID
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client.get_database(os.getenv("DB_NAME"))
majors = db.majors.find()
for major in majors:
    # make page
    rawMajorID = major["major_id"]
    majorName = major["name"]
    majorID = rawMajorID.replace("-", "_")
    f = open(("../frontend/src/components/pages/majors/" + rawMajorID + ".jsx"), "w")
    f.writelines([("export default function " + majorID +  "() {\n"), ("  return (<div>Welcome to the " + majorName + " Tree!</div>);\n"), "}"])
