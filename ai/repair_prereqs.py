"""
Targeted repair: find all courses where prereqs_raw has "Enforced requisite"
but prereqs_parsed is empty, then re-parse them with Gemini and update the
JSON files in place.

Usage (from the ai/ directory):
  python repair_prereqs.py                # dry run — shows what would change
  python repair_prereqs.py --apply        # write changes to JSON files

Requires GEMINI_API_KEY in environment or .env file (same dir or parent).
"""

import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    GEMINI_AVAILABLE = bool(os.getenv("GEMINI_API_KEY"))
except ImportError:
    GEMINI_AVAILABLE = False

APPLY = "--apply" in sys.argv

PREREQ_PROMPT = """You parse UCLA course prerequisite strings into JSON. Return ONLY valid JSON, nothing else.

Output format:
{"required": ["COM SCI 31"], "corequisites": [], "one_of": [], "min_grade": "C" or null, "recommended": []}

Rules:
- Course IDs must be full format: "COM SCI 31" not just "31"
- "course 31" in a COM SCI description means "COM SCI 31"
- "courses 31A, 31B" in a COM SCI description means ["COM SCI 31A", "COM SCI 31B"]
- "Mathematics 61" means "MATH 61"; "Mathematics 31A, 31B" means ["MATH 31A", "MATH 31B"]
- "Physics 1A" means "PHYSICS 1A"; "Life Sciences 7B" means "LIFESCI 7B"
- "Chemistry 20A" means "CHEM 20A"; "Statistics 101A" means "STATS 101A"
- "Program in Computing 10B" means "COMPTNG 10B"
- "Civil Engineering M20" means "C&EE M20"
- "Civil and Environmental Engineering M20" means "C&EE M20"
- "Mechanical and Aerospace Engineering 103" means "MECH&AE 103"
- "Electrical and Computer Engineering M16" means "EC ENGR M16"
- "Electrical Engineering 100" means "EC ENGR 100"
- "Enforced requisite" or "Enforced requisites" = required
- "Enforced corequisite" or "Enforced corequisites" = corequisites
- "X or Y" between courses of the SAME department = put in one_of as a group
- "X or Y" between courses of DIFFERENT departments = still put in one_of
- "and" or comma between courses = each goes in required (separate items)
- If a course is listed as "X (or Y or Z)" the parenthetical is the one_of alternative
- If no prerequisites, return {"required": []}
- Ignore "with grade of C or better" clauses and similar grade requirements
- Ignore "satisfaction of Entry-Level Writing requirement" — not a real course
- Ignore "English Composition 3" — not a STEM course we track
- Return ONLY JSON"""


def is_empty_parsed(parsed: dict) -> bool:
    return (
        not parsed.get("required")
        and not parsed.get("corequisites")
        and not parsed.get("one_of")
    )


def has_enforced_raw(raw: str) -> bool:
    return bool(re.search(r"enforced\s+requisite", raw or "", re.IGNORECASE))


def collect_affected(data_dir: Path):
    """Return list of (json_path, course_obj) for all affected courses."""
    affected = []
    for jf in sorted(data_dir.glob("*_parsed.json")):
        try:
            data = json.loads(jf.read_text(encoding="utf-8"))
        except Exception:
            continue
        for course in data.get("courses", []):
            raw = course.get("prereqs_raw", "") or ""
            parsed = course.get("prereqs_parsed") or {}
            if has_enforced_raw(raw) and is_empty_parsed(parsed):
                affected.append((jf, course))
    return affected


def parse_with_gemini(course_id: str, dept: str, prereqs_raw: str):
    """Call Gemini to re-parse a single course prereq string."""
    if not GEMINI_AVAILABLE:
        return None
    try:
        response = model.generate_content(
            f"{PREREQ_PROMPT}\n\nDepartment: {dept}\nPrerequisite string: {prereqs_raw}"
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        result = json.loads(text)
        # Validate it's a dict with expected keys
        if isinstance(result, dict):
            return result
    except Exception as e:
        print(f"    Parse error for {course_id}: {e}")
    return None


def repair_all(data_dir: Path):
    affected = collect_affected(data_dir)

    # Deduplicate by course_id so we only call Gemini once per unique course.
    unique: dict[str, tuple] = {}  # course_id -> (first jf, course obj)
    for jf, course in affected:
        cid = course["course_id"]
        if cid not in unique:
            unique[cid] = (jf, course)

    print(f"Found {len(affected)} affected entries across JSON files.")
    print(f"Unique courses to re-parse: {len(unique)}")
    print()

    if not GEMINI_AVAILABLE:
        print("WARNING: GEMINI_API_KEY not set. Showing affected courses only (no re-parsing).\n")
        for cid, (jf, course) in sorted(unique.items()):
            print(f"  {cid:<30} | {course.get('prereqs_raw', '')[:90]}")
        return

    # Re-parse unique courses in parallel.
    print(f"Re-parsing {len(unique)} courses via Gemini...")
    results: dict[str, dict] = {}

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(
                parse_with_gemini, cid, course.get("dept", ""), course.get("prereqs_raw", "")
            ): cid
            for cid, (_, course) in unique.items()
        }
        done = 0
        for future in as_completed(futures):
            cid = futures[future]
            result = future.result()
            done += 1
            if result and not is_empty_parsed(result):
                results[cid] = result
                print(f"  [{done}/{len(unique)}] {cid}: {result}")
            else:
                print(f"  [{done}/{len(unique)}] {cid}: still empty (skipped)")

    print(f"\nSuccessfully re-parsed: {len(results)}/{len(unique)} courses")

    if not APPLY:
        print("\nDry run — pass --apply to write changes to JSON files.")
        return

    # Apply changes: update all JSON files that contain affected courses.
    files_to_update: dict[Path, dict] = {}
    for jf, _ in affected:
        if jf not in files_to_update:
            files_to_update[jf] = json.loads(jf.read_text(encoding="utf-8"))

    updated_count = 0
    for jf, data in files_to_update.items():
        changed = False
        for course in data.get("courses", []):
            cid = course["course_id"]
            if cid in results:
                raw = course.get("prereqs_raw", "") or ""
                parsed = course.get("prereqs_parsed") or {}
                if has_enforced_raw(raw) and is_empty_parsed(parsed):
                    course["prereqs_parsed"] = results[cid]
                    changed = True
                    updated_count += 1
        if changed:
            jf.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"  Updated: {jf.name}")

    print(f"\nTotal course entries updated: {updated_count}")
    print("\nNext step: reload MongoDB with:")
    print("  cd backend/scripts && python load_all.py ../../ai/data/")


if __name__ == "__main__":
    data_dir = Path(__file__).parent / "data"
    repair_all(data_dir)
