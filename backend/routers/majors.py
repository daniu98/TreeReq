from fastapi import APIRouter, HTTPException
from config.database import get_db
from models.major import MajorResponse
from utils.tree_builder import build_major_tree

router = APIRouter()


@router.get("/majors")
async def list_majors():
    db = get_db()
    cursor = db.majors.find()
    majors = await cursor.to_list(length=200)
    return [MajorResponse(**m) for m in majors]


@router.get("/majors/{major_id}")
async def get_major(major_id: str):
    db = get_db()
    major = await db.majors.find_one({"major_id": major_id})
    if not major:
        raise HTTPException(status_code=404, detail=f"Major '{major_id}' not found")
    return MajorResponse(**major)


@router.get("/majors/{major_id}/tree")
async def get_major_tree(major_id: str):
    db = get_db()
    try:
        return await build_major_tree(db, major_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
