"""
Fix 1 (main fix): For every course that has correct prereqs_parsed in SOME files
but empty in others, copy the best-known data to all files where it is empty.

Fix 2 (normalization): Flatten one_of format inconsistency —
  bad:  one_of: ["MATH 3B", "MATH 31B"]          (list of strings)
  good: one_of: [["MATH 3B", "MATH 31B"]]         (list of lists)

This script does NOT need Gemini. Run from any directory.

Usage:
  python propagate_prereqs.py            # dry run
  python propagate_prereqs.py --apply    # write changes to JSON files
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

APPLY = "--apply" in sys.argv
DATA_DIR = Path(__file__).parent / "data"


def score(parsed: dict) -> int:
    """Higher is better. Prefer nested one_of over flat, and more data."""
    if not parsed:
        return 0
    req = parsed.get("required", [])
    coreq = parsed.get("corequisites", [])
    one_of = parsed.get("one_of", [])
    if not (req or coreq or one_of):
        return 0
    # Prefer nested one_of (list of lists)
    one_of_is_nested = one_of and isinstance(one_of[0], list)
    return (
        len(req) * 3
        + len(coreq) * 2
        + len(one_of) * 2
        + (5 if one_of_is_nested else 0)
    )


def normalize_one_of(one_of):
    """Ensure one_of is a list of lists, not a list of strings."""
    if not one_of:
        return []
    result = []
    for item in one_of:
        if isinstance(item, str):
            result.append([item])
        elif isinstance(item, list):
            result.append([x for x in item if isinstance(x, str)])
        # skip other types
    return [g for g in result if g]


def is_empty(parsed: dict) -> bool:
    p = parsed or {}
    return not (p.get("required") or p.get("corequisites") or p.get("one_of"))


def main():
    json_files = sorted(DATA_DIR.glob("*_parsed.json"))
    print(f"Scanning {len(json_files)} files...")

    # Load all data
    file_data: dict[Path, dict] = {}
    for jf in json_files:
        try:
            file_data[jf] = json.loads(jf.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  ERROR reading {jf.name}: {e}")

    # Build: course_id -> list of (score, normalized_parsed)
    course_best: dict[str, dict] = {}  # course_id -> best parsed
    course_best_score: dict[str, int] = {}

    for jf, data in file_data.items():
        for course in data.get("courses", []):
            cid = course.get("course_id", "")
            parsed = course.get("prereqs_parsed") or {}
            if is_empty(parsed):
                continue
            # Normalize one_of format
            normalized = {
                **parsed,
                "one_of": normalize_one_of(parsed.get("one_of", [])),
            }
            s = score(normalized)
            if s > course_best_score.get(cid, -1):
                course_best[cid] = normalized
                course_best_score[cid] = s

    print(f"Found best-known prereqs for {len(course_best)} unique courses")

    # Count how many files have empty prereqs for courses where we have best data
    total_updates = 0
    updates_by_file: dict[Path, list] = defaultdict(list)

    for jf, data in file_data.items():
        for course in data.get("courses", []):
            cid = course.get("course_id", "")
            parsed = course.get("prereqs_parsed") or {}
            if is_empty(parsed) and cid in course_best:
                updates_by_file[jf].append(cid)
                total_updates += 1

    # Also count normalization-only fixes (has data but wrong one_of format)
    format_fixes = 0
    for jf, data in file_data.items():
        for course in data.get("courses", []):
            cid = course.get("course_id", "")
            parsed = course.get("prereqs_parsed") or {}
            if is_empty(parsed):
                continue
            one_of = parsed.get("one_of", [])
            if one_of and isinstance(one_of[0], str):
                format_fixes += 1

    print(f"Courses to propagate (empty->has data): {total_updates}")
    print(f"one_of format fixes (flat->nested):    {format_fixes}")
    print()

    if not APPLY:
        print("=== DRY RUN — pass --apply to write changes ===\n")
        print("Files that would be updated:")
        for jf in sorted(updates_by_file):
            print(f"  {jf.name}: {len(updates_by_file[jf])} course(s): {updates_by_file[jf][:5]}{'...' if len(updates_by_file[jf]) > 5 else ''}")
        return

    # Apply: update each file
    files_written = 0
    for jf, data in file_data.items():
        changed = False
        for course in data.get("courses", []):
            cid = course.get("course_id", "")
            parsed = course.get("prereqs_parsed") or {}

            # Propagate missing data
            if is_empty(parsed) and cid in course_best:
                course["prereqs_parsed"] = course_best[cid]
                changed = True

            # Fix flat one_of format
            elif not is_empty(parsed):
                one_of = parsed.get("one_of", [])
                if one_of and isinstance(one_of[0], str):
                    course["prereqs_parsed"] = {
                        **parsed,
                        "one_of": normalize_one_of(one_of),
                    }
                    changed = True

        if changed:
            jf.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            files_written += 1
            print(f"  Updated: {jf.name}")

    print(f"\nDone. Updated {files_written} files.")
    print("\nNext: reload MongoDB from backend/scripts/:")
    print("  python load_all.py")


if __name__ == "__main__":
    main()
