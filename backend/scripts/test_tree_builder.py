#!/usr/bin/env python3
"""Quick offline test: python scripts/test_tree_builder.py"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tree_builder import build_visual_tree

SAMPLE = {
    "major_id": "cognitive-science",
    "major_name": "Cognitive Science, B.S.",
    "requirements": [
        {
            "category": "Mathematics",
            "type": "required",
            "choose_n": None,
            "courses": ["MATH 31A", "MATH 31B"],
        },
        {
            "category": "Psychology",
            "type": "required",
            "choose_n": None,
            "courses": ["PSYCH 10"],
        },
        {
            "category": "Upper Division Electives",
            "type": "elective",
            "choose_n": 2,
            "courses": ["PSYCH 120A", "PSYCH 120B", "COM SCI 31"],
        },
        {
            "category": "Capstone Research",
            "type": "required",
            "choose_n": None,
            "courses": ["PSYCH 191"],
        },
    ],
    "courses": [
        {
            "course_id": "MATH 31A",
            "dept": "MATH",
            "number": "31A",
            "title": "Calculus",
            "units": 4,
            "prereqs_parsed": {"required": [], "corequisites": [], "one_of": []},
        },
        {
            "course_id": "MATH 31B",
            "dept": "MATH",
            "number": "31B",
            "title": "Calculus",
            "units": 4,
            "prereqs_parsed": {"required": ["MATH 31A"], "corequisites": [], "one_of": []},
        },
        {
            "course_id": "PSYCH 10",
            "dept": "PSYCH",
            "number": "10",
            "title": "Intro Psych",
            "units": 4,
            "prereqs_parsed": {"required": [], "corequisites": [], "one_of": []},
        },
    ],
}


def main():
    data_path = Path(__file__).resolve().parent.parent.parent / "ai" / "data"
    parsed_files = list(data_path.glob("*_parsed.json"))
    if parsed_files:
        doc = json.loads(parsed_files[0].read_text())
        print(f"Using {parsed_files[0].name}")
    else:
        doc = SAMPLE
        print("Using built-in sample (no *_parsed.json in ai/data)")

    tree = build_visual_tree(doc)
    print(json.dumps(tree["stats"], indent=2))
    print("\nMilestones:")
    for m in tree["milestones"]:
        print(f"  - {m['key']}: {m['label']}")
    print("\nSections:")
    for sec in tree["sections"]:
        n_cats = len(sec["categories"])
        n_courses = sum(len(c["courses"]) for c in sec["categories"])
        print(f"  {sec['milestone']['label']}: {n_cats} categories, {n_courses} courses")


if __name__ == "__main__":
    main()
