"""
Load AP credit rows from ai/data/ucla_ap_credits_simple.json into MongoDB collection ap_credits.

Run from repo root:
  cd backend && python scripts/seed_ap_credits.py

Skips if ap_credits already has documents (use --force to replace).
"""

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


def backend_dir() -> Path:
    return Path(__file__).resolve().parent.parent


async def main():
    load_dotenv(backend_dir() / ".env")
    load_dotenv(backend_dir().parent / "frontend" / ".env", override=False)
    _env_bundle = backend_dir().parent / ".env"
    if _env_bundle.is_dir():
        for path in sorted(_env_bundle.glob("*.env")):
            load_dotenv(path, override=False)
    elif _env_bundle.is_file():
        load_dotenv(_env_bundle, override=False)

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force",
        action="store_true",
        help="Clear ap_credits and re-insert from JSON",
    )
    args = parser.parse_args()

    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "treereq_dev")
    if not mongo_uri:
        print("Set MONGO_URI in backend/.env or environment.", file=sys.stderr)
        sys.exit(1)

    json_path = repo_root() / "ai" / "data" / "ucla_ap_credits_simple.json"
    if not json_path.is_file():
        print(f"Missing {json_path}", file=sys.stderr)
        sys.exit(1)

    with open(json_path, encoding="utf-8") as f:
        rows = json.load(f)

    client = AsyncIOMotorClient(mongo_uri, tlsCAFile=certifi.where())
    db = client[db_name]

    existing = await db.ap_credits.count_documents({})
    if existing and not args.force:
        print(f"ap_credits already has {existing} documents; use --force to replace")
        client.close()
        return

    if args.force:
        await db.ap_credits.delete_many({})

    if rows:
        await db.ap_credits.insert_many(rows)
    print(f"Inserted {len(rows)} AP credit rows into ap_credits")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
