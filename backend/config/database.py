from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "treereq_dev")

client = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]
    print("Connected to MongoDB")


async def close_db():
    if client:
        client.close()


def get_db():
    return db