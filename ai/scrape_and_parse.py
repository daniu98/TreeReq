"""
Scrape UCLA majors: requirement categories + course details + prereq parsing.
Scraping is sequential (to avoid getting blocked).
Gemini parsing runs in parallel (10 at a time).

Usage:
  python scrape_and_parse.py                          # all majors
  python scrape_and_parse.py "Computer Science"       # one major
  python scrape_and_parse.py "Mathematics" "Economics" # multiple majors
"""

import json
import time
import sys
import os
import google.generativeai as genai
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

PREREQ_PROMPT = """You parse UCLA course prerequisite strings into JSON. Return ONLY valid JSON, nothing else.

Output format:
{"required": ["COM SCI 31"], "corequisites": [], "one_of": [], "min_grade": "C" or null, "recommended": []}

Rules:
- Course IDs must be full format: "COM SCI 31" not just "31"
- "course 31" in a COM SCI description means "COM SCI 31"
- "Mathematics 61" means "MATH 61"
- "Enforced requisite" = required
- "or" between courses = one_of group
- If no prerequisites, return {"required": []}
- Return ONLY JSON"""

REQUIREMENTS_PROMPT = """You are analyzing a UCLA major requirements page. I will give you the text content of the page.

Extract the requirement categories and their courses. Return ONLY valid JSON in this format:

{
  "categories": [
    {
      "category": "Preparation for the Major",
      "type": "required",
      "choose_n": null,
      "courses": ["COM SCI 31", "COM SCI 32"]
    },
    {
      "category": "Upper Division Electives",
      "type": "elective",
      "choose_n": 5,
      "courses": ["COM SCI 118", "COM SCI 130", "COM SCI 132"]
    }
  ]
}

Rules:
- type is "required" if students must take ALL courses in the category
- type is "elective" if students choose some from a list
- choose_n is the number they must pick (null if they take all)
- Look for phrases like "Select", "Choose", "complete X courses", "X from the following"
- Course IDs must be full format: "COM SCI 31" not "31"
- If you can't determine choose_n, set it to null and type to "required"
- Return ONLY JSON"""


# ============================================================
# GEMINI PARSING (runs in parallel)
# ============================================================

def _resolve_bare_course_ids(parsed: dict, dept: str) -> dict:
    """
    Post-process Gemini output: any course ID that is just a number (or letter+number)
    without a department prefix gets the current course's department prepended.
    e.g. "102A" -> "CH ENGR 102A",  "M20" -> "MECH&AE M20"
    This fixes cases where Gemini returns bare numbers instead of full IDs.
    """
    import re
    bare_num = re.compile(r'^[A-Z]?\d+[A-Z]?$')  # e.g. 102A, M20, 31B, C135

    def fix_id(cid):
        if isinstance(cid, str) and bare_num.match(cid.strip()):
            return f"{dept} {cid.strip()}"
        return cid

    def fix_list(lst):
        if not isinstance(lst, list):
            return lst
        return [fix_id(x) if isinstance(x, str) else
                [fix_id(i) for i in x] if isinstance(x, list) else x
                for x in lst]

    return {
        **parsed,
        "required": fix_list(parsed.get("required", [])),
        "corequisites": fix_list(parsed.get("corequisites", [])),
        "one_of": [fix_list(g) if isinstance(g, list) else g for g in parsed.get("one_of", [])],
    }


def parse_prereq_single(course_id, prereqs_raw, dept):
    """Parse one prereq string. Returns (course_id, parsed_result)."""
    if not prereqs_raw.strip():
        return (course_id, {"required": [], "corequisites": [], "one_of": [], "min_grade": None, "recommended": []})
    try:
        response = model.generate_content(
            f"{PREREQ_PROMPT}\n\nDepartment: {dept}\nPrerequisite string: {prereqs_raw}"
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        result = json.loads(text)
        return (course_id, _resolve_bare_course_ids(result, dept))
    except Exception as e:
        print(f"      Parse error for {course_id}: {e}")
        return (course_id, {"required": []})


def parse_all_prereqs_parallel(courses, max_workers=10):
    """Parse all prereqs in parallel."""
    to_parse = [
        (c["course_id"], c.get("prereqs_raw", ""), c["dept"])
        for c in courses if c.get("prereqs_raw", "").strip()
    ]

    if not to_parse:
        print(f"    No prereqs to parse")
        return {}

    print(f"    Parsing {len(to_parse)} prereqs in parallel ({max_workers} workers)...")
    results = {}

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(parse_prereq_single, cid, raw, dept): cid
            for cid, raw, dept in to_parse
        }
        done = 0
        for future in as_completed(futures):
            course_id, parsed = future.result()
            results[course_id] = parsed
            done += 1
            if done % 5 == 0 or done == len(to_parse):
                print(f"      [{done}/{len(to_parse)}] parsed")

    return results


def parse_requirements_page(page_text, major_name):
    """Use Gemini to extract requirement categories."""
    try:
        response = model.generate_content(
            f"{REQUIREMENTS_PROMPT}\n\nMajor: {major_name}\n\nPage content:\n{page_text[:8000]}"
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)
    except Exception as e:
        print(f"    Error parsing requirements: {e}")
        return None


# ============================================================
# SCRAPING (runs sequentially)
# ============================================================

def scrape_major_requirements(page, major_url, major_name):
    """Visit major catalog page, extract requirement categories."""
    print(f"  Scraping requirement structure...")
    for attempt in range(3):
        try:
            page.goto(major_url, timeout=20000)
            time.sleep(3)
            content = page.inner_text("body")
            if "403" in content or "Request blocked" in content:
                print(f"    Blocked, waiting 15s... (attempt {attempt + 1})")
                time.sleep(15)
                continue
            result = parse_requirements_page(content, major_name)
            if result and "categories" in result:
                print(f"    Found {len(result['categories'])} categories:")
                for cat in result["categories"]:
                    choose_text = f"choose {cat['choose_n']}" if cat.get("choose_n") else "all required"
                    print(f"      - {cat['category']}: {len(cat['courses'])} courses ({choose_text})")
                return result["categories"]
        except Exception as e:
            print(f"    Error: {e}, waiting 10s... (attempt {attempt + 1})")
            time.sleep(10)
    return None


def scrape_course(page, url, course_id, title):
    """Visit a course page, extract description + units + prereq text."""
    for attempt in range(3):
        try:
            page.goto(url, timeout=15000)
            time.sleep(1.5)
            content = page.inner_text("body")
            if "403" in content or "Request blocked" in content:
                print(f"      Blocked, waiting 10s... (attempt {attempt + 1})")
                time.sleep(10)
                continue

            # Units
            units = 4
            for line in content.split("\n"):
                line = line.strip()
                if "units" in line.lower() and len(line) < 15:
                    try:
                        units = float(line.split()[0])
                    except:
                        pass

            # Description
            description = ""
            for line in content.split("\n"):
                s = line.strip()
                if s.startswith("Lecture,") or s.startswith("Seminar,") or s.startswith("Laboratory,") or s.startswith("Tutorial,"):
                    description = s
                    break
            if not description:
                for line in content.split("\n"):
                    if len(line.strip()) > 100 and ("requisite" in line.lower() or "hours" in line.lower()):
                        description = line.strip()
                        break
            if not description:
                for line in content.split("\n"):
                    if len(line.strip()) > 100:
                        description = line.strip()
                        break

            # Prereq text
            prereqs_raw = ""
            desc_lower = description.lower()
            for kw in ["enforced requisite:", "enforced requisites:", "requisite:", "requisites:", "prerequisite:", "prerequisites:", "enforced corequisite:"]:
                if kw in desc_lower:
                    idx = desc_lower.index(kw)
                    rest = description[idx:]
                    prereqs_raw = rest[:rest.index(".") + 1] if "." in rest else rest
                    break

            parts = course_id.rsplit(" ", 1)
            dept = parts[0] if len(parts) > 1 else course_id
            number = parts[1] if len(parts) > 1 else ""

            return {
                "course_id": course_id, "dept": dept, "number": number,
                "title": title, "units": units, "description": description,
                "prereqs_raw": prereqs_raw,
            }
        except Exception as e:
            print(f"      Error: {e}, waiting 10s... (attempt {attempt + 1})")
            time.sleep(10)

    return {
        "course_id": course_id,
        "dept": course_id.rsplit(" ", 1)[0] if " " in course_id else course_id,
        "number": course_id.rsplit(" ", 1)[1] if " " in course_id else "",
        "title": title, "units": 4, "description": "", "prereqs_raw": "",
    }


# ============================================================
# MAIN PIPELINE
# ============================================================

def make_filename(name):
    return name.lower().replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "").replace(",", "")

def make_major_id(name):
    return name.lower().replace(" ", "-").replace("/", "-").replace("(", "").replace(")", "").replace(",", "")


def process_major(major, context):
    major_name = major["major_name"]
    courses_info = major.get("courses", [])
    major_url = major.get("url", "")
    filename = make_filename(major_name)
    output_file = f"data/{filename}_parsed.json"

    if os.path.exists(output_file):
        print(f"\n  SKIP {major_name} — already exists")
        return output_file
    if not courses_info:
        print(f"\n  SKIP {major_name} — no courses")
        return None

    print(f"\n{'='*60}")
    print(f"  {major_name} — {len(courses_info)} courses")
    print(f"{'='*60}")

    page = context.new_page()

    # 1. Get requirement structure
    categories = None
    if major_url:
        categories = scrape_major_requirements(page, major_url, major_name)
        time.sleep(2)

    # 2. Collect all course IDs
    course_lookup = {c["course_id"]: c for c in courses_info}
    all_course_ids = set()
    if categories:
        for cat in categories:
            for cid in cat.get("courses", []):
                all_course_ids.add(cid)
    for c in courses_info:
        all_course_ids.add(c["course_id"])

    # 3. Scrape all courses (sequential)
    print(f"\n  Scraping {len(all_course_ids)} courses...")
    scraped = {}
    course_list = sorted(all_course_ids)
    for i, cid in enumerate(course_list):
        info = course_lookup.get(cid)
        title = info["title"] if info else cid
        url = info["catalog_url"] if info else f"https://catalog.registrar.ucla.edu/course/2025/{cid.replace(' ', '')}"
        print(f"    [{i+1}/{len(course_list)}] {cid}")
        scraped[cid] = scrape_course(page, url, cid, title)
        time.sleep(0.5)

    page.close()

    # 4. Parse all prereqs (parallel)
    print(f"\n  Parsing prereqs...")
    courses_list = list(scraped.values())
    parsed = parse_all_prereqs_parallel(courses_list, max_workers=10)
    for course in courses_list:
        course["prereqs_parsed"] = parsed.get(course["course_id"], {"required": []})

    # 5. Build requirements
    if categories:
        requirements = [{
            "category": cat["category"],
            "type": cat.get("type", "required"),
            "choose_n": cat.get("choose_n"),
            "courses": cat.get("courses", []),
        } for cat in categories]
    else:
        by_dept = {}
        for cid in sorted(scraped.keys()):
            dept = scraped[cid]["dept"]
            if dept not in by_dept:
                by_dept[dept] = []
            by_dept[dept].append(cid)
        requirements = [{"category": d, "type": "required", "choose_n": None, "courses": c} for d, c in by_dept.items()]

    # 6. Save
    output = {
        "major_id": make_major_id(major_name),
        "major_name": major_name,
        "url": major_url,
        "requirements": requirements,
        "courses": courses_list,
    }
    os.makedirs("data", exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2)

    has_prereqs = sum(1 for c in courses_list if c.get("prereqs_parsed", {}).get("required"))
    print(f"\n  Done! {major_name}")
    print(f"    {len(courses_list)} courses, {has_prereqs} with prereqs, {len(requirements)} categories")
    for r in requirements:
        t = f"choose {r['choose_n']}" if r.get("choose_n") else "all required"
        print(f"      - {r['category']}: {len(r['courses'])} courses ({t})")
    print(f"    Saved to {output_file}")
    return output_file


def main():
    with open("temp_data/data/processed/ucla_major_requirements.json") as f:
        data = json.load(f)
    all_majors = data["majors"]

    if len(sys.argv) > 1:
        majors_to_scrape = []
        for term in sys.argv[1:]:
            matches = [m for m in all_majors if term.lower() in m["major_name"].lower()]
            if matches:
                for m in matches:
                    if m not in majors_to_scrape:
                        majors_to_scrape.append(m)
                        print(f"  Found: {m['major_name']}")
            else:
                print(f"  No major matching '{term}'")
        if not majors_to_scrape:
            return
    else:
        majors_to_scrape = all_majors
        print(f"Scraping ALL {len(majors_to_scrape)} majors")

    print(f"\nTotal: {len(majors_to_scrape)} majors")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        output_files = []
        for major in majors_to_scrape:
            result = process_major(major, context)
            if result:
                output_files.append(result)
        browser.close()

    print(f"\n{'='*60}")
    print(f"  DONE — {len(output_files)} majors scraped")
    print(f"{'='*60}")
    print(f"\nLoad into MongoDB:")
    print(f"  cd ../backend && python scripts/load_all.py")


if __name__ == "__main__":
    main()