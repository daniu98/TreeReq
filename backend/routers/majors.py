from fastapi import APIRouter, HTTPException
from config.database import get_db
from models.major import MajorResponse
from models.course import PrereqTreeResponse, TreeNode, TreeEdge, PrereqsParsed

router = APIRouter()


@router.get("/majors")
async def list_majors():
    db = get_db()
    cursor = db.majors.find()
    majors = await cursor.to_list(length=100)
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
    major = await db.majors.find_one({"major_id": major_id})
    if not major:
        raise HTTPException(status_code=404, detail=f"Major '{major_id}' not found")

    nodes = []
    edges = []
    visited = set()

    async def walk_prereqs(cid):
        if cid in visited:
            return
        visited.add(cid)

        course = await db.courses.find_one({"course_id": cid})
        if not course:
            nodes.append(TreeNode(id=cid, dept=cid.rsplit(" ", 1)[0], number=cid.rsplit(" ", 1)[1] if " " in cid else "?", title="(not in database)", units=0))
            return

        nodes.append(TreeNode(id=course["course_id"], dept=course["dept"], number=course["number"], title=course["title"], units=course["units"]))

        prereqs = course.get("prereqs_parsed", {})
        if isinstance(prereqs, dict):
            prereqs = PrereqsParsed(**prereqs)

        for prereq_id in prereqs.required:
            edges.append(TreeEdge(source=prereq_id, target=cid))
            await walk_prereqs(prereq_id)

    for req_category in major.get("requirements", []):
        for course_id in req_category.get("courses", []):
            await walk_prereqs(course_id)

    return PrereqTreeResponse(root=major_id, nodes=nodes, edges=edges)