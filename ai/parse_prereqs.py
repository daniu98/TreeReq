import json
import time
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

SYSTEM_PROMPT = """You parse UCLA course prerequisite strings into JSON. Return ONLY valid JSON, nothing else.

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


def parse_prereq(prereqs_raw, dept):
    if not prereqs_raw.strip():
        return {"required": [], "corequisites": [], "one_of": [], "min_grade": None, "recommended": []}

    response = model.generate_content(
        f"{SYSTEM_PROMPT}\n\nDepartment: {dept}\nPrerequisite string: {prereqs_raw}"
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]

    return json.loads(text)


def main():
    with open("data/cs_courses_raw.json") as f:
        courses = json.load(f)

    print(f"Parsing prereqs for {len(courses)} courses...\n")

    for i, course in enumerate(courses):
        prereqs_raw = course.get("prereqs_raw", "")
        print(f"[{i+1}/{len(courses)}] {course['course_id']}: {prereqs_raw[:60]}")

        try:
            parsed = parse_prereq(prereqs_raw, course["dept"])
            course["prereqs_parsed"] = parsed
            print(f"  → {parsed}")
        except Exception as e:
            print(f"  → Error: {e}")
            course["prereqs_parsed"] = {"required": []}

        time.sleep(0.5)

    with open("data/cs_courses_parsed.json", "w") as f:
        json.dump(courses, f, indent=2)

    has_prereqs = sum(1 for c in courses if c.get("prereqs_parsed", {}).get("required"))
    print(f"\nDone! Saved to data/cs_courses_parsed.json")
    print(f"Courses with prereqs: {has_prereqs}/{len(courses)}")


if __name__ == "__main__":
    main()