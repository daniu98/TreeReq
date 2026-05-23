#!/usr/bin/env python3
"""Print enriched requirements for computer-science-bs shape (no Mongo needed)."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from utils.tree_builder import enrich_requirements

CS_REQUIREMENTS = [
    {
        "category": "Preparation for the Major",
        "type": "required",
        "choose_n": None,
        "courses": [
            "COM SCI 1",
            "COM SCI 31",
            "COM SCI 32",
            "COM SCI 33",
            "COM SCI 35L",
            "MATH 31A",
            "MATH 31B",
            "MATH 32A",
            "MATH 32B",
            "MATH 33A",
            "MATH 33B",
            "MATH 61",
            "PHYSICS 1A",
            "PHYSICS 1B",
            "PHYSICS 1C",
        ],
    },
    {
        "category": "The Major",
        "type": "required",
        "choose_n": None,
        "courses": [
            "COM SCI 111",
            "COM SCI 131",
            "COM SCI 180",
            "COM SCI 181",
            "COM SCI 118",
            "COM SCI M152A",
        ],
    },
    {
        "category": "Capstone",
        "type": "required",
        "choose_n": 1,
        "courses": ["COM SCI 130", "COM SCI 152B"],
    },
]

SAMPLE_EDGES = [
    {"source": "MATH 31A", "target": "MATH 31B"},
    {"source": "COM SCI 31", "target": "COM SCI 32"},
    {"source": "COM SCI 32", "target": "COM SCI 33"},
    {"source": "MATH 31B", "target": "COM SCI 31"},
]

if __name__ == "__main__":
    enriched = enrich_requirements(CS_REQUIREMENTS, SAMPLE_EDGES)
    print(json.dumps(enriched, indent=2))
