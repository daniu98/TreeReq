import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "treereq_dev")

COURSES = [
    {
        "course_id": "COM SCI 31",
        "dept": "COM SCI",
        "number": "31",
        "title": "Introduction to Computer Science I",
        "units": 4,
        "description": "Introduction to computer science via theory, applications, and programming.",
        "prereqs_raw": "",
        "prereqs_parsed": {"required": []},
    },
    {
        "course_id": "COM SCI 32",
        "dept": "COM SCI",
        "number": "32",
        "title": "Introduction to Computer Science II",
        "units": 4,
        "description": "Object-oriented software development. Abstract data types and data structures.",
        "prereqs_raw": "Requisite: course 31 with a grade of C or better",
        "prereqs_parsed": {"required": ["COM SCI 31"], "min_grade": "C"},
    },
    {
        "course_id": "COM SCI 33",
        "dept": "COM SCI",
        "number": "33",
        "title": "Introduction to Computer Organization",
        "units": 5,
        "description": "Introductory course on computer architecture and assembly language.",
        "prereqs_raw": "Requisite: course 32 with a grade of C or better",
        "prereqs_parsed": {"required": ["COM SCI 32"], "min_grade": "C"},
    },
    {
        "course_id": "COM SCI 35L",
        "dept": "COM SCI",
        "number": "35L",
        "title": "Software Construction",
        "units": 4,
        "description": "Software construction tools, languages, and environments.",
        "prereqs_raw": "Requisite: course 31",
        "prereqs_parsed": {"required": ["COM SCI 31"]},
    },
    {
        "course_id": "COM SCI 111",
        "dept": "COM SCI",
        "number": "111",
        "title": "Operating Systems Principles",
        "units": 5,
        "description": "Introduction to operating systems design. Processes, threads, synchronization.",
        "prereqs_raw": "Requisites: courses 32 and 33",
        "prereqs_parsed": {"required": ["COM SCI 32", "COM SCI 33"]},
    },
    {
        "course_id": "COM SCI 131",
        "dept": "COM SCI",
        "number": "131",
        "title": "Programming Languages",
        "units": 4,
        "description": "Fundamental concepts in programming languages.",
        "prereqs_raw": "Requisite: course 33",
        "prereqs_parsed": {"required": ["COM SCI 33"]},
    },
    {
        "course_id": "COM SCI 180",
        "dept": "COM SCI",
        "number": "180",
        "title": "Introduction to Algorithms and Complexity",
        "units": 4,
        "description": "Design and analysis of efficient algorithms.",
        "prereqs_raw": "Requisites: courses 32 and Mathematics 61",
        "prereqs_parsed": {"required": ["COM SCI 32", "MATH 61"]},
    },
    {
        "course_id": "MATH 31A",
        "dept": "MATH",
        "number": "31A",
        "title": "Differential and Integral Calculus",
        "units": 4,
        "description": "Differential calculus and applications; introduction to integration.",
        "prereqs_raw": "",
        "prereqs_parsed": {"required": []},
    },
    {
        "course_id": "MATH 31B",
        "dept": "MATH",
        "number": "31B",
        "title": "Integration and Infinite Series",
        "units": 4,
        "description": "Techniques of integration; sequences and series.",
        "prereqs_raw": "Requisite: course 31A",
        "prereqs_parsed": {"required": ["MATH 31A"]},
    },
    {
        "course_id": "MATH 32A",
        "dept": "MATH",
        "number": "32A",
        "title": "Calculus of Several Variables",
        "units": 4,
        "description": "Differential calculus of several variables.",
        "prereqs_raw": "Requisite: course 31B",
        "prereqs_parsed": {"required": ["MATH 31B"]},
    },
    {
        "course_id": "MATH 33A",
        "dept": "MATH",
        "number": "33A",
        "title": "Linear Algebra and Applications",
        "units": 4,
        "description": "Systems of linear equations, matrix algebra, linear transformations.",
        "prereqs_raw": "Requisite: course 31B",
        "prereqs_parsed": {"required": ["MATH 31B"]},
    },
    {
        "course_id": "MATH 61",
        "dept": "MATH",
        "number": "61",
        "title": "Introduction to Discrete Structures",
        "units": 4,
        "description": "Logic, mathematical induction, sets, relations, combinatorics, graphs.",
        "prereqs_raw": "Requisite: course 31A",
        "prereqs_parsed": {"required": ["MATH 31A"]},
    },
]
MAJOR = {
    "major_id": "computer-science",
    "name": "Computer Science",
    "school": "School of Engineering",
    "requirements": [
        {
            "category": "Preparation for the Major",
            "courses": ["COM SCI 31", "COM SCI 32", "COM SCI 33", "COM SCI 35L",
                       "MATH 31A", "MATH 31B", "MATH 32A", "MATH 33A", "MATH 61"],
        },
        {
            "category": "Upper Division Required",
            "courses": ["COM SCI 111", "COM SCI 131", "COM SCI 180"],
        },
    ],
}

async def seed():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]

    print("Clearing old data...")
    await db.courses.delete_many({})

    print("Inserting courses...")
    for course in COURSES:
        await db.courses.update_one(
            {"course_id": course["course_id"]},
            {"$set": course},
            upsert=True,
        )

    print(f"Loaded {len(COURSES)} courses")

    await db.majors.update_one(
        {"major_id": MAJOR["major_id"]},
        {"$set": MAJOR},
        upsert=True,
    )
    print(f"Loaded major: {MAJOR['name']}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())