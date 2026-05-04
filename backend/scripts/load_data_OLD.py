import asyncio
import json
import sys
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "treereq_dev")


async def load_courses(filepath):
    with open(filepath) as f:
        courses = json.load(f)

    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]

    loaded = 0
    for course in courses:
        if not all(k in course for k in ["course_id", "dept", "number", "title", "units"]):
            print(f"  Skipping: {course.get('course_id', 'UNKNOWN')} (missing fields)")
            continue
        await db.courses.update_one(
            {"course_id": course["course_id"]},
            {"$set": course},
            upsert=True,
        )
        loaded += 1

    print(f"Loaded {loaded} courses from {filepath}")
    client.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/load_data.py <path_to_json>")
        sys.exit(1)
    asyncio.run(load_courses(sys.argv[1]))