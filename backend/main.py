from fastapi import FastAPI
from contextlib import asynccontextmanager
from config.database import connect_db, close_db
from routers import courses, majors
import pymongo
import os

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
