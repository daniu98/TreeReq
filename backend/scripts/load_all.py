"""
Load all scraped major data into MongoDB.
Reads every *_parsed.json file in the ai/data folder.
Loads both courses AND major documents with requirement categories.

Usage:
  python scripts/load_all.py                           # load all files
  python scripts/load_all.py ../ai/data/mathematics_bs_parsed.json  # load one file
"""

import asyncio
import json
import sys
import os
import glob
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "treereq_dev")


async def load_file(db, filepath):
    with open(filepath) as f:
        data = json.load(f)

    major_name = data.get("major_name", "Unknown")
    major_id = data.get("major_id", "unknown")
    print(f"\n  Loading: {major_name}")

    # Load courses
    courses = data.get("courses", [])
    courses_loaded = 0
    for course in courses:
        if not all(k in course for k in ["course_id", "dept", "number", "title", "units"]):
            continue
        await db.courses.update_one(
            {"course_id": course["course_id"]},
            {"$set": course},
            upsert=True,
        )
        courses_loaded += 1

    # Load major with requirement categories
    requirements = data.get("requirements", [])
    major_doc = {
        "major_id": major_id,
        "name": major_name,
        "school": data.get("school", "UCLA"),
        "url": data.get("url", ""),
        "requirements": requirements,
    }

    await db.majors.update_one(
        {"major_id": major_id},
        {"$set": major_doc},
        upsert=True,
    )

    # Print summary
    required_cats = [r for r in requirements if r.get("type") != "elective"]
    elective_cats = [r for r in requirements if r.get("type") == "elective"]
    print(f"    {courses_loaded} courses loaded")
    print(f"    {len(requirements)} requirement categories ({len(required_cats)} required, {len(elective_cats)} elective)")
    for r in requirements:
        choose_text = f"choose {r['choose_n']}" if r.get("choose_n") else "all required"
        print(f"      - {r['category']}: {len(r['courses'])} courses ({choose_text})")

    return courses_loaded


async def main():
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]

    # Determine which files to load
    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        files = sorted(glob.glob("../../ai/data/*_parsed.json"))

    if not files:
        print("No parsed JSON files found in ../ai/data/")
        print("Run the scraper first: cd ../ai && python scrape_and_parse.py")
        client.close()
        return

    print(f"Loading {len(files)} files...")

    total_courses = 0
    total_majors = 0

    for filepath in files:
        if not os.path.exists(filepath):
            print(f"  File not found: {filepath}")
            continue
        try:
            courses_loaded = await load_file(db, filepath)
            total_courses += courses_loaded
            total_majors += 1
        except Exception as e:
            print(f"  Error loading {filepath}: {e}")

    # Print totals
    total_courses_in_db = await db.courses.count_documents({})
    total_majors_in_db = await db.majors.count_documents({})
    print(f"\n{'='*40}")
    print(f"  Loaded {total_courses} courses across {total_majors} majors")
    print(f"  Database totals: {total_courses_in_db} courses, {total_majors_in_db} majors")
    print(f"{'='*40}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())