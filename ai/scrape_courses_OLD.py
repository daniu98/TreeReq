import json
import time
from playwright.sync_api import sync_playwright


def scrape_course(page, url, course_id, title):
    """Visit a course page and extract description + units."""
    print(f"  Scraping {course_id}...")
    
    try:
        page.goto(url, timeout=15000)
        time.sleep(2)
        
        content = page.inner_text("body")
        
        # Find units — looks like "4 units"
        units = 4  # default
        for line in content.split("\n"):
            line = line.strip()
            if "units" in line.lower() and len(line) < 15:
                try:
                    units = float(line.split()[0])
                except:
                    pass
        
        # Find description — it's the big block of text after "Description"
        description = ""
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if line.strip().startswith("Lecture,") or line.strip().startswith("Seminar,") or line.strip().startswith("Laboratory,") or "requisite" in line.lower():
                description = line.strip()
                break
        
        # If we didn't find it that way, look for the longest paragraph
        if not description:
            for line in lines:
                if len(line.strip()) > 100:
                    description = line.strip()
                    break
        
        # Extract prereq text from description
        prereqs_raw = ""
        desc_lower = description.lower()
        for keyword in ["enforced requisite:", "requisite:", "prerequisite:", "enforced corequisite:"]:
            if keyword in desc_lower:
                idx = desc_lower.index(keyword)
                # Get text from keyword to the next period
                rest = description[idx:]
                if "." in rest:
                    prereqs_raw = rest[:rest.index(".") + 1]
                else:
                    prereqs_raw = rest
                break
        
        # Figure out department from course_id
        parts = course_id.rsplit(" ", 1)
        dept = parts[0] if len(parts) > 1 else course_id
        number = parts[1] if len(parts) > 1 else ""
        
        return {
            "course_id": course_id,
            "dept": dept,
            "number": number,
            "title": title,
            "units": units,
            "description": description,
            "prereqs_raw": prereqs_raw,
        }
    
    except Exception as e:
        print(f"    Error: {e}")
        return {
            "course_id": course_id,
            "dept": course_id.rsplit(" ", 1)[0],
            "number": course_id.rsplit(" ", 1)[1] if " " in course_id else "",
            "title": title,
            "units": 4,
            "description": "",
            "prereqs_raw": "",
        }


def main():
    # Load major requirements from the existing dataset
    with open("temp_data/data/processed/ucla_major_requirements.json") as f:
        data = json.load(f)
    
    # Find major
    major = None
    CurrentMajor = "Electrical Engineering BS"
    for m in data["majors"]:
        if CurrentMajor in m["major_name"]:
            major = m
            break

    if not major:
        print("Major not found!")
        return
    
    print(f"Scraping {major['major_name']} — {len(major['courses'])} courses")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        courses = []
        for course_info in major["courses"]:
            result = scrape_course(
                page,
                course_info["catalog_url"],
                course_info["course_id"],
                course_info["title"],
            )
            courses.append(result)
            time.sleep(1)  # be respectful, don't hammer the server
        
        browser.close()
    
    # Save results
    with open("data/" + CurrentMajor + "_courses_raw.json", "w") as f:
        json.dump(courses, f, indent=2)
    
    print(f"\nDone! Saved {len(courses)} courses to data/" + CurrentMajor +"_courses_raw.json")
    
    # Quick summary
    has_prereqs = sum(1 for c in courses if c["prereqs_raw"])
    print(f"Courses with prereqs: {has_prereqs}/{len(courses)}")


if __name__ == "__main__":
    main()