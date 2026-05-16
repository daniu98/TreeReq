"""
Onboarding helpers: AP exams (from ap_credits), UCLA courses (from courses). IB: empty until data exists.
"""

from fastapi import APIRouter

from config.database import get_db

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

# Upper bound for course dropdown; raise if the catalog grows beyond this.
_MAX_UCLA_COURSES = 20_000


@router.get("/academic-options")
async def academic_options():
    db = get_db()
    ap_raw = await db.ap_credits.distinct("ap_exam")
    ap_exams = sorted(e for e in ap_raw if e)
    ap_options = [{"value": e, "label": f"AP {e}"} for e in ap_exams]

    cursor = (
        db.courses.find({}, {"course_id": 1, "title": 1, "_id": 0})
        .sort("course_id", 1)
        .limit(_MAX_UCLA_COURSES)
    )
    course_docs = await cursor.to_list(length=_MAX_UCLA_COURSES)
    ucla_options = []
    for c in course_docs:
        cid = c.get("course_id")
        if not cid:
            continue
        title = (c.get("title") or "").strip()
        label = f"{cid} — {title}" if title else cid
        ucla_options.append({"value": cid, "label": label})

    return {
        "apExams": ap_options,
        "ibExams": [],
        "uclaCourses": ucla_options,
    }
