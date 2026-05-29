"""
Transform a Mongo major + prereq walk into the enriched tree shape the UI expects:
  - section hubs (Preparation for the Major / The Major / Capstone)
  - department sub-categories under each section (like the CogSci mock)
  - nodes + edges from courses.prereqs_parsed
"""

from __future__ import annotations

from collections import defaultdict

from models.course import PrereqTreeResponse, TreeNode, TreeEdge, RequirementInfo
from utils.prereqs import parse_prereqs

SECTION_ORDER = [
    "Preparation for the Major",
    "The Major",
    "Capstone",
]
KNOWN_SECTIONS = set(SECTION_ORDER)

DEPT_LABELS: dict[str, str] = {
    "MATH": "Mathematics",
    "COM SCI": "Computer Science",
    "PHYSICS": "Physics",
    "CHEM": "Chemistry",
    "CHEMISTRY": "Chemistry",
    "LING": "Linguistics",
    "PIC": "Program in Computing",
    "COMPTNG": "Program in Computing",
    "PSYCH": "Psychology",
    "PHIL": "Philosophy",
    "LIFESCI": "Life Sciences",
    "STATS": "Statistics",
    "ENGR": "Engineering",
    "EC ENGR": "Electrical Engineering",
    "C&EE": "Civil Engineering",
    "MECH&AE": "Mechanical Engineering",
    "MAT SCI": "Materials Science",
    "CHEM ENGR": "Chemical Engineering",
    "BIOENGR": "Bioengineering",
}

DEPT_SORT = [
    "MATH",
    "PHYSICS",
    "CHEM",
    "CHEMISTRY",
    "LING",
    "PIC",
    "COMPTNG",
    "COM SCI",
    "PSYCH",
    "PHIL",
    "LIFESCI",
    "STATS",
    "ENGR",
]


def _dept_sort_key(dept: str) -> tuple[int, str]:
    try:
        return (DEPT_SORT.index(dept), dept)
    except ValueError:
        return (len(DEPT_SORT), dept)


def parse_dept(course_id: str) -> str:
    if " " not in course_id:
        return course_id
    return course_id.rsplit(" ", 1)[0]


def _course_sort_key(course_id: str) -> tuple:
    dept = parse_dept(course_id)
    num = course_id.rsplit(" ", 1)[-1] if " " in course_id else ""
    digits = "".join(c for c in num if c.isdigit())
    return (_dept_sort_key(dept), int(digits) if digits else 0, num, course_id)


def _section_index(section: str) -> int:
    try:
        return SECTION_ORDER.index(section)
    except ValueError:
        return len(SECTION_ORDER)


def _dept_label(dept: str) -> str:
    return DEPT_LABELS.get(dept, dept.title())


def _category_label(section: str, dept: str, choose_n: int | None, rtype: str) -> str:
    label = _dept_label(dept)
    if section == "Capstone":
        return "Capstone" if choose_n is None else f"Capstone (choose {choose_n})"
    if rtype == "elective" and choose_n:
        return f"{label} (choose {choose_n})"
    return label


def _elective_group_label(section: str, courses: list[str], choose_n: int | str) -> str:
    """Generate a display label for an elective group based on its departments."""
    depts = list(dict.fromkeys(parse_dept(c) for c in courses))  # ordered, unique
    if len(depts) == 1:
        return f"{_dept_label(depts[0])} (choose {choose_n})"
    if len(depts) == 2:
        return f"{_dept_label(depts[0])} or {_dept_label(depts[1])} (choose {choose_n})"
    return f"Technical Breadth (choose {choose_n})"


def _expand_elective_groups(requirements: list[dict]) -> list[dict]:
    """
    Expand each requirement's elective_groups into separate requirement dicts
    alongside the requirement's required courses, so enrich_requirements sees them.
    """
    expanded: list[dict] = []
    for req in requirements:
        category = req.get("category", "")
        courses = [c for c in (req.get("courses") or []) if c]
        rtype = req.get("type", "required")
        choose_n = req.get("choose_n")

        # Required courses go in as-is (enrich_requirements splits by dept)
        if courses:
            expanded.append({
                "category": category,
                "type": rtype,
                "choose_n": choose_n,
                "courses": courses,
            })

        # Each elective_group becomes its own requirement entry, sectioned under
        # the parent category so buildHierarchy places it in the right section hub.
        for group in req.get("elective_groups") or []:
            g_courses = [c for c in (group.get("courses") or []) if c]
            g_choose_n = group.get("choose_n")
            if not g_courses or not g_choose_n:
                continue
            label = _elective_group_label(category, g_courses, g_choose_n)
            expanded.append({
                "section": category,   # parent section hub
                "category": label,
                "type": "elective",
                "choose_n": g_choose_n,
                "courses": g_courses,
            })

    return expanded


def _edges_among(course_ids: list[str], all_edges: list[dict]) -> list[tuple[str, str]]:
    id_set = set(course_ids)
    pairs = []
    for e in all_edges:
        s, t = e.get("source"), e.get("target")
        if s in id_set and t in id_set:
            pairs.append((s, t))
    return pairs


def _order_courses_for_display(course_ids: list[str], all_edges: list[dict]) -> list[str]:
    """Order courses so prereqs appear before dependents within a category."""
    if len(course_ids) <= 1:
        return list(course_ids)

    id_set = set(course_ids)
    local_edges = _edges_among(course_ids, all_edges)
    incoming: dict[str, set[str]] = {c: set() for c in course_ids}
    for s, t in local_edges:
        incoming[t].add(s)

    roots = [c for c in course_ids if not incoming[c]]
    if not roots:
        roots = sorted(course_ids, key=_course_sort_key)

    ordered: list[str] = []
    seen: set[str] = set()

    def visit(cid: str) -> None:
        if cid in seen or cid not in id_set:
            return
        for prereq in sorted(incoming[cid], key=_course_sort_key):
            visit(prereq)
        if cid not in seen:
            seen.add(cid)
            ordered.append(cid)

    for root in sorted(roots, key=_course_sort_key):
        visit(root)

    for cid in sorted(course_ids, key=_course_sort_key):
        if cid not in seen:
            ordered.append(cid)

    return ordered


def enrich_requirements(
    raw_requirements: list[dict],
    edges: list[dict] | None = None,
) -> list[dict]:
    """
    Split flat Mongo categories (e.g. one big 'Preparation for the Major' bucket)
    into section + department sub-categories matching the CogSci mock layout.
    """
    edges = edges or []
    enriched: list[dict] = []

    for req in raw_requirements:
        category = req.get("category") or "Requirements"
        courses = [c for c in (req.get("courses") or []) if c]
        if not courses:
            continue

        rtype = req.get("type") or "required"
        choose_n = req.get("choose_n")

        if category in KNOWN_SECTIONS:
            section = category
            by_dept: dict[str, list[str]] = defaultdict(list)
            for cid in courses:
                by_dept[parse_dept(cid)].append(cid)

            if len(by_dept) == 1:
                dept = next(iter(by_dept))
                enriched.append({
                    "section": section,
                    "category": _category_label(section, dept, choose_n, rtype),
                    "type": rtype,
                    "choose_n": choose_n,
                    "courses": _order_courses_for_display(courses, edges),
                })
            else:
                for dept in sorted(by_dept.keys(), key=_dept_sort_key):
                    dept_courses = by_dept[dept]
                    enriched.append({
                        "section": section,
                        "category": _category_label(section, dept, None, rtype),
                        "type": rtype,
                        "choose_n": None,
                        "courses": _order_courses_for_display(dept_courses, edges),
                    })
                if choose_n and rtype == "elective":
                    enriched[-1]["choose_n"] = choose_n
                    enriched[-1]["category"] = _category_label(
                        section, parse_dept(courses[0]), choose_n, rtype
                    )
        elif req.get("section"):
            enriched.append({
                **req,
                "courses": _order_courses_for_display(courses, edges),
            })
        else:
            enriched.append({
                "section": "Requirements",
                "category": category,
                "type": rtype,
                "choose_n": choose_n,
                "courses": _order_courses_for_display(courses, edges),
            })

    enriched.sort(
        key=lambda r: (_section_index(r.get("section", "")), r.get("category", ""))
    )
    return enriched


async def build_major_tree(db, major_id: str) -> PrereqTreeResponse:
    major = await db.majors.find_one({"major_id": major_id})
    if not major:
        raise ValueError(f"Major '{major_id}' not found")

    nodes: list[TreeNode] = []
    edges: list[TreeEdge] = []
    visited: set[str] = set()

    # Collect all courses that are elective (from both courses lists and elective_groups)
    elective_courses: set[str] = set()
    for req in major.get("requirements", []):
        for group in req.get("elective_groups") or []:
            for cid in group.get("courses") or []:
                elective_courses.add(cid)

    async def walk_prereqs(cid: str) -> None:
        if cid in visited:
            return
        visited.add(cid)

        course = await db.courses.find_one({"course_id": cid})
        if not course:
            nodes.append(
                TreeNode(
                    id=cid,
                    dept=cid.rsplit(" ", 1)[0] if " " in cid else cid,
                    number=cid.rsplit(" ", 1)[1] if " " in cid else "?",
                    title="(not in database)",
                    units=0,
                    is_elective=cid in elective_courses,
                )
            )
            return

        nodes.append(
            TreeNode(
                id=course["course_id"],
                dept=course["dept"],
                number=course["number"],
                title=course["title"],
                units=course["units"],
                is_elective=cid in elective_courses,
            )
        )

        prereqs = parse_prereqs(course.get("prereqs_parsed"))

        for prereq_id in prereqs.required:
            edges.append(TreeEdge(source=prereq_id, target=cid))
            await walk_prereqs(prereq_id)

        for coreq_id in prereqs.corequisites:
            edges.append(TreeEdge(source=coreq_id, target=cid, type="corequisite"))
            await walk_prereqs(coreq_id)

        for group in prereqs.one_of:
            for option_id in group:
                edges.append(TreeEdge(source=option_id, target=cid, type="one_of"))
                await walk_prereqs(option_id)

    # Walk prereqs for all courses: required + elective_groups
    for req in major.get("requirements", []):
        for course_id in req.get("courses") or []:
            await walk_prereqs(course_id)
        for group in req.get("elective_groups") or []:
            for course_id in group.get("courses") or []:
                await walk_prereqs(course_id)

    edge_dicts = [{"source": e.source, "target": e.target, "type": e.type} for e in edges]
    expanded = _expand_elective_groups(major.get("requirements", []))
    enriched = enrich_requirements(expanded, edge_dicts)

    return PrereqTreeResponse(
        root=major_id,
        nodes=nodes,
        edges=edges,
        requirements=[RequirementInfo(**r) for r in enriched],
    )
