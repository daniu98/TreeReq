"""
Build a Figma-style visual degree tree from any major JSON document.

Works with:
  - MongoDB `majors` docs (+ optional embedded or separate `courses`)
  - `ai/data/{major}_parsed.json` files from scrape_and_parse.py

Input shape (minimal):
  {
    "major_id": "cognitive-science",
    "major_name": "Cognitive Science, B.S.",   # or "name"
    "requirements": [
      { "category": "Mathematics", "type": "required", "choose_n": null, "courses": ["MATH 31A", ...] }
    ],
    "courses": [  # optional; enriches titles/prereqs. If omitted, course_id is used as label.
      { "course_id": "MATH 31A", "dept": "MATH", "number": "31A", "title": "...", "prereqs_parsed": {...} }
    ]
  }
"""

from __future__ import annotations

import re
from typing import Any

# Ordered milestone spine (Figma green nodes)
MILESTONE_ORDER = ("root", "prep", "major", "capstone")
MILESTONE_LABELS = {
    "root": None,  # filled from major name
    "prep": "Preparation for the Major",
    "major": "The Major",
    "capstone": "Capstone",
}

PREP_KEYWORDS = (
    "preparation for the major",
    "preparation for major",
    "prep for the major",
    "preparatory",
    "preparation",
    "prep ",
    "lower division preparation",
)
CAPSTONE_KEYWORDS = (
    "capstone",
    "senior capstone",
    "design project",
    "senior design",
)
MAJOR_KEYWORDS = (
    "the major",
    "upper division",
    "required course",
    "required courses",
    "breadth",
    "concentration",
    "core course",
    "elective",
    "electives",
)


def _slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "node"


def _course_lookup(courses: list[dict[str, Any]] | None) -> dict[str, dict[str, Any]]:
    lookup: dict[str, dict[str, Any]] = {}
    for c in courses or []:
        cid = c.get("course_id")
        if cid:
            lookup[cid] = c
    return lookup


def milestone_header_key(category_name: str) -> str | None:
    """If the category row is a section header (often with no courses), return milestone key."""
    n = (category_name or "").lower().strip()
    if n in ("preparation for the major", "preparation for major", "prep for the major"):
        return "prep"
    if n in ("the major", "major requirements", "major"):
        return "major"
    if n == "capstone" or n.startswith("capstone "):
        return "capstone"
    if any(k in n for k in CAPSTONE_KEYWORDS) and len(n) < 40:
        return "capstone"
    if any(k in n for k in PREP_KEYWORDS) and len(n) < 50:
        return "prep"
    return None


def classify_milestone(category_name: str, req_type: str = "required") -> str:
    """Keyword fallback when sequential context is unavailable."""
    n = (category_name or "").lower().strip()
    if any(k in n for k in CAPSTONE_KEYWORDS):
        return "capstone"
    if any(k in n for k in PREP_KEYWORDS):
        return "prep"
    if any(k in n for k in MAJOR_KEYWORDS):
        return "major"
    if req_type == "elective":
        return "major"
    return "major"


def assign_requirements_to_milestones(requirements: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """
    Assign flat UCLA requirement rows to prep / major / capstone.

    Catalog pages list section headers ("Preparation for the Major") then subject
    categories ("Mathematics", "Chemistry") — subjects inherit the active section.
    """
    buckets: dict[str, list[dict[str, Any]]] = {k: [] for k in ("prep", "major", "capstone")}
    active: str | None = None

    for idx, req in enumerate(requirements):
        cat_name = req.get("category") or f"Requirement {idx + 1}"
        courses = req.get("courses") or []
        header = milestone_header_key(cat_name)

        if header and len(courses) == 0:
            active = header
            continue

        if header:
            active = header
            milestone = header
        else:
            milestone = (
                active
                if active is not None
                else classify_milestone(cat_name, req.get("type") or "required")
            )

        buckets[milestone].append({**req, "category": cat_name, "_index": idx})

    return buckets


def _parse_prereqs(course: dict[str, Any]) -> dict[str, Any]:
    raw = course.get("prereqs_parsed") or {}
    if not isinstance(raw, dict):
        return {"required": [], "corequisites": [], "one_of": []}
    return {
        "required": list(raw.get("required") or []),
        "corequisites": list(raw.get("corequisites") or []),
        "one_of": [list(g) if isinstance(g, (list, tuple)) else [g] for g in (raw.get("one_of") or [])],
    }


def _course_node_id(category_key: str, course_id: str) -> str:
    return f"course:{_slug(category_key)}:{_slug(course_id)}"


def _category_node_id(milestone_key: str, category_name: str, index: int) -> str:
    return f"cat:{milestone_key}:{_slug(category_name)}:{index}"


def build_visual_tree(major_doc: dict[str, Any]) -> dict[str, Any]:
    """
    Transform a major document into a hierarchical visual tree + edge list.

    Returns a dict suitable for JSON API responses and mirroring in JS.
    """
    major_id = major_doc.get("major_id") or _slug(major_doc.get("major_name") or major_doc.get("name") or "major")
    major_name = major_doc.get("major_name") or major_doc.get("name") or major_id
    requirements = major_doc.get("requirements") or []
    lookup = _course_lookup(major_doc.get("courses"))

    # All course ids referenced in this major (for filtering prereq edges)
    major_course_ids: set[str] = set()
    for req in requirements:
        for cid in req.get("courses") or []:
            if cid:
                major_course_ids.add(cid)

    elective_ids: set[str] = set()
    for req in requirements:
        if req.get("type") == "elective" or req.get("choose_n"):
            for cid in req.get("courses") or []:
                elective_ids.add(cid)

    buckets = assign_requirements_to_milestones(requirements)

    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    sections: list[dict[str, Any]] = []
    edge_seq = 0

    def add_edge(source: str, target: str, kind: str, **extra: Any) -> None:
        nonlocal edge_seq
        edges.append({"id": f"e{edge_seq}", "source": source, "target": target, "kind": kind, **extra})
        edge_seq += 1

    # Root milestone node
    root_id = f"milestone:root:{major_id}"
    nodes.append({
        "id": root_id,
        "kind": "milestone",
        "role": "root",
        "milestone_key": "root",
        "label": major_name,
        "completion_percentage": None,
    })

    prev_milestone_id = root_id
    milestone_chain: list[dict[str, str]] = [{"key": "root", "id": root_id, "label": major_name}]
    course_id_to_node: dict[str, str] = {}
    pending_prereq_edges: list[dict[str, Any]] = []

    for m_key in ("prep", "major", "capstone"):
        m_id = f"milestone:{m_key}:{major_id}"
        m_label = MILESTONE_LABELS[m_key] or major_name
        nodes.append({
            "id": m_id,
            "kind": "milestone",
            "role": "spine",
            "milestone_key": m_key,
            "label": m_label,
            "completion_percentage": None,
        })
        milestone_chain.append({"key": m_key, "id": m_id, "label": m_label})
        add_edge(prev_milestone_id, m_id, "spine")
        prev_milestone_id = m_id

        section_categories: list[dict[str, Any]] = []
        cat_list = buckets[m_key]

        for cat_idx, req in enumerate(cat_list):
            cat_name = req["category"]
            cat_key = _category_node_id(m_key, cat_name, cat_idx)
            choose_n = req.get("choose_n")
            req_type = req.get("type") or "required"
            course_ids = list(dict.fromkeys(req.get("courses") or []))  # preserve order, dedupe

            subtitle = None
            if choose_n:
                subtitle = f"Choose {choose_n}"
            elif req_type == "elective":
                subtitle = "Elective"

            nodes.append({
                "id": cat_key,
                "kind": "category",
                "milestone_key": m_key,
                "label": cat_name,
                "subtitle": subtitle,
                "type": req_type,
                "choose_n": choose_n,
                "completion_percentage": 0,
            })
            add_edge(m_id, cat_key, "contains")

            course_nodes: list[dict[str, Any]] = []
            cat_prereq_edges: list[dict[str, Any]] = []

            for course_id in course_ids:
                info = lookup.get(course_id) or {}
                dept = info.get("dept") or (course_id.rsplit(" ", 1)[0] if " " in course_id else course_id)
                title = info.get("title") or course_id
                units = info.get("units", 0)
                n_id = _course_node_id(cat_key, course_id)

                nodes.append({
                    "id": n_id,
                    "kind": "course",
                    "milestone_key": m_key,
                    "category_key": cat_key,
                    "course_id": course_id,
                    "label": course_id,
                    "title": title,
                    "department": dept,
                    "units": units,
                    "status": "Unfulfilled",
                    "is_elective": course_id in elective_ids,
                    "choose_n": choose_n if choose_n else None,
                })
                add_edge(cat_key, n_id, "contains")

                ui_course = {
                    "id": n_id,
                    "course_id": course_id,
                    "courseName": course_id,
                    "department": dept,
                    "title": title,
                    "status": "Unfulfilled",
                    "is_elective": course_id in elective_ids,
                }
                course_nodes.append(ui_course)
                course_id_to_node[course_id] = n_id

                prereqs = _parse_prereqs(info)
                for prereq_id in prereqs["required"]:
                    if prereq_id in major_course_ids:
                        pending_prereq_edges.append({
                            "source": prereq_id,
                            "target": course_id,
                            "kind": "prereq",
                        })
                        cat_prereq_edges.append({
                            "source": prereq_id,
                            "target": course_id,
                            "kind": "prereq",
                        })
                for prereq_id in prereqs["corequisites"]:
                    if prereq_id in major_course_ids:
                        pending_prereq_edges.append({
                            "source": prereq_id,
                            "target": course_id,
                            "kind": "corequisite",
                        })
                        cat_prereq_edges.append({
                            "source": prereq_id,
                            "target": course_id,
                            "kind": "corequisite",
                        })
                for group in prereqs["one_of"]:
                    for option_id in group:
                        if option_id in major_course_ids:
                            pending_prereq_edges.append({
                                "source": option_id,
                                "target": course_id,
                                "kind": "one_of",
                                "group": group,
                            })
                            cat_prereq_edges.append({
                                "source": option_id,
                                "target": course_id,
                                "kind": "one_of",
                            })

            section_categories.append({
                "category": {
                    "id": cat_key,
                    "label": cat_name,
                    "type": req_type,
                    "choose_n": choose_n,
                    "subtitle": subtitle,
                    "completion_percentage": 0,
                },
                "courses": course_nodes,
                "prereq_edges": cat_prereq_edges,
            })

        sections.append({
            "milestone": {"key": m_key, "id": m_id, "label": m_label},
            "categories": section_categories,
        })

    for pe in pending_prereq_edges:
        src = course_id_to_node.get(pe["source"])
        tgt = course_id_to_node.get(pe["target"])
        if src and tgt:
            add_edge(src, tgt, pe["kind"], group=pe.get("group"))

    return {
        "major_id": major_id,
        "major_name": major_name,
        "milestones": milestone_chain,
        "nodes": nodes,
        "edges": edges,
        "sections": sections,
        "stats": {
            "requirement_categories": len(requirements),
            "courses": len(major_course_ids),
            "nodes": len(nodes),
            "edges": len(edges),
        },
    }


def build_visual_tree_from_db(major_doc: dict[str, Any], course_docs: list[dict[str, Any]]) -> dict[str, Any]:
    """Merge Mongo major + course collection rows then build."""
    merged = {**major_doc, "courses": course_docs}
    if "major_name" not in merged and "name" in merged:
        merged["major_name"] = merged["name"]
    return build_visual_tree(merged)
