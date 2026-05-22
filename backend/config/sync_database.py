"""Shared sync Mongo client + env loading for auth routers."""

import os
from pathlib import Path

import certifi
import pymongo
from dotenv import load_dotenv

_backend_dir = Path(__file__).resolve().parent.parent
_repo_root = _backend_dir.parent

load_dotenv(_backend_dir / ".env")
load_dotenv(_repo_root / "frontend" / ".env", override=False)

_env_bundle = _repo_root / ".env"
if _env_bundle.is_dir():
    for path in sorted(_env_bundle.glob("*.env")):
        load_dotenv(path, override=False)
elif _env_bundle.is_file():
    load_dotenv(_env_bundle, override=False)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "treereq_dev")

_client: pymongo.MongoClient | None = None


def get_sync_db():
    global _client
    if not MONGO_URI:
        raise RuntimeError("MONGO_URI is not set in backend/.env")
    if _client is None:
        _client = pymongo.MongoClient(
            MONGO_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=8000,
        )
    return _client[DB_NAME]


def user_is_onboarded(user: dict | None) -> bool:
    if not user:
        return False
    return bool(
        (user.get("first_name") or "").strip()
        and (user.get("last_name") or "").strip()
        and (user.get("major") or "").strip()
    )
