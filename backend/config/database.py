from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi
from pathlib import Path

# Always load backend/.env, even when uvicorn is started from the repo root.
_backend_dir = Path(__file__).resolve().parent.parent
_repo_root = _backend_dir.parent

load_dotenv(_backend_dir / ".env")
# Optional: reuse the same Web Client ID from frontend/.env (VITE_GOOGLE_CLIENT_ID).
load_dotenv(_repo_root / "frontend" / ".env", override=False)

# Some teams keep secrets under a `.env` *directory* (e.g. `.env/oauth.env`).
# load_dotenv only reads files, so load every `*.env` in that folder.
_env_bundle = _repo_root / ".env"
if _env_bundle.is_dir():
    for path in sorted(_env_bundle.glob("*.env")):
        load_dotenv(path, override=False)
elif _env_bundle.is_file():
    load_dotenv(_env_bundle, override=False)

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