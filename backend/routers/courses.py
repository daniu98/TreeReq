from fastapi import APIRouter, HTTPException
from config.database import get_db
from models.course import CourseResponse

router = APIRouter()


@router.get("/courses")
async def list_courses():
    db = get_db()
    cursor = db.courses.find()
    courses = await cursor.to_list(length=100)
    return [CourseResponse(**c) for c in courses]


@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    db = get_db()
    course_id = course_id.replace("+", " ").upper()
    course = await db.courses.find_one({"course_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{course_id}' not found")
    return CourseResponse(**course)