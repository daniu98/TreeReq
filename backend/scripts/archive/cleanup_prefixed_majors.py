"""
Remove stale major documents from MongoDB whose major_id starts with a stray
1-2 character prefix (e.g. 'a0-', 'cw-', 'g-', 'x-') left over from a bad scrape.

The corresponding *_parsed.json files have been renamed and their major_id /
major_name fields cleaned. Running load_all.py afterwards will upsert the
corrected documents, but the OLD prefixed documents remain in db.majors and
must be deleted explicitly.

Usage:
  python scripts/cleanup_prefixed_majors.py            # dry-run (lists matches)
  python scripts/cleanup_prefixed_majors.py --apply    # actually delete
"""

import asyncio
import os
import re
import sys

import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "treereq_dev")

# Matches major_id values that begin with a stray 1-2 alphanumeric prefix
# followed by a hyphen, e.g. "a0-...", "cw-...", "g-...", "x-...".
PREFIX_PATTERN = re.compile(r"^[a-z][a-z0-9]?-")


async def main(apply: bool) -> None:
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]

    cursor = db.majors.find({}, {"major_id": 1, "name": 1})
    stale_ids: list[str] = []
    async for doc in cursor:
        mid = doc.get("major_id", "")
        if not PREFIX_PATTERN.match(mid):
            continue
        # Confirm a clean (deprefixed) sibling exists before deleting, so we
        # never wipe an entry that has no replacement.
        cleaned = mid.split("-", 1)[1] if "-" in mid else mid
        sibling = await db.majors.find_one({"major_id": cleaned}, {"_id": 1})
        marker = "OK" if sibling else "NO REPLACEMENT"
        print(f"  [{marker}] {mid}  ->  {cleaned}   ({doc.get('name', '')})")
        if sibling:
            stale_ids.append(mid)

    print(f"\nFound {len(stale_ids)} stale prefixed majors with clean replacements.")

    if not stale_ids:
        client.close()
        return

    if not apply:
        print("Dry-run only. Re-run with --apply to delete.")
        client.close()
        return

    result = await db.majors.delete_many({"major_id": {"$in": stale_ids}})
    print(f"Deleted {result.deleted_count} documents.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main(apply="--apply" in sys.argv))
