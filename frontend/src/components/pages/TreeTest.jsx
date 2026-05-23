import { DegreeTree } from "../tree/DegreeTree.jsx";
import { DraggableCanvas } from "../tree/DraggableCanvas.jsx";

/**
 * Mock CogSci API response — same shape backend returns from
 * GET /api/majors/{id}/tree. Includes a `section` field on each requirement
 * so we render the section hub circles.
 */
const MOCK_RESPONSE = {
  root: "cogsci",
  nodes: [
    // Preparation for the Major
    { id: "MATH 31AL", dept: "MATH", number: "31AL", title: "Differential & Integral Calculus", units: 5, is_elective: false },
    { id: "MATH 31B",  dept: "MATH", number: "31B",  title: "Integration & Infinite Series",   units: 4, is_elective: false },
    { id: "LING 20",   dept: "LING", number: "20",   title: "Intro to Linguistics",            units: 4, is_elective: true  },
    { id: "PIC 10A",   dept: "PIC",  number: "10A",  title: "Intro to Programming",            units: 5, is_elective: false },
    { id: "PIC 10B",   dept: "PIC",  number: "10B",  title: "Intermediate Programming",        units: 5, is_elective: false },
    { id: "PIC 10C",   dept: "PIC",  number: "10C",  title: "Advanced Programming",            units: 5, is_elective: false },
    { id: "LIFESCI 15",dept: "LIFESCI", number: "15", title: "Life: Concepts & Issues",         units: 5, is_elective: true  },
    { id: "PSYCH 10",  dept: "PSYCH",number: "10",   title: "Intro Psychology",                units: 4, is_elective: false },
    { id: "PSYCH 65",  dept: "PSYCH",number: "65",   title: "Cognitive Psychology",            units: 4, is_elective: false },
    { id: "PSYCH 100A",dept: "PSYCH",number: "100A", title: "Psychological Statistics",        units: 4, is_elective: false },
    { id: "PSYCH 100B",dept: "PSYCH",number: "100B", title: "Research Methods",                units: 4, is_elective: false },
    { id: "PHIL 7",    dept: "PHIL", number: "7",    title: "Intro to Philosophy of Mind",     units: 4, is_elective: true  },
    // The Major
    { id: "PSYCH 115", dept: "PSYCH",number: "115",  title: "Cognitive Neuroscience",          units: 4, is_elective: false },
    { id: "PSYCH 120A",dept: "PSYCH",number: "120A", title: "Cognitive Psychology",            units: 4, is_elective: false },
    { id: "PSYCH 124A",dept: "PSYCH",number: "124A", title: "Memory",                          units: 4, is_elective: false },
    { id: "PSYCH 186E",dept: "PSYCH",number: "186E", title: "Computational Cognition",         units: 4, is_elective: true  },
    { id: "PHIL 124",  dept: "PHIL", number: "124",  title: "Philosophy of Mind",              units: 4, is_elective: true  },
    { id: "PSYCH 112A",dept: "PSYCH",number: "112A", title: "Learning & Behavior",             units: 4, is_elective: true  },
    { id: "PSYCH 166B",dept: "PSYCH",number: "166B", title: "Psycholinguistics",               units: 4, is_elective: true  },
    { id: "PSYCH 119Y",dept: "PSYCH",number: "119Y", title: "Decision Making",                 units: 4, is_elective: true  },
    // Capstone
    { id: "PSYCH 195B",dept: "PSYCH",number: "195B", title: "Cognitive Science Capstone",      units: 4, is_elective: false },
  ],
  edges: [
    // Math chain
    { source: "MATH 31AL", target: "MATH 31B",  type: "required" },
    // PIC chain
    { source: "PIC 10A",   target: "PIC 10B",   type: "required" },
    { source: "PIC 10B",   target: "PIC 10C",   type: "required" },
    // Psych chain
    { source: "PSYCH 10",  target: "PSYCH 100A",type: "required" },
    { source: "PSYCH 100A",target: "PSYCH 100B",type: "required" },
    // Cross-branch prereqs (out of category)
    { source: "PIC 10A",   target: "PSYCH 186E",type: "required" }, // PIC -> PSYCH 186E
    { source: "PSYCH 100B",target: "PSYCH 115", type: "required" },
    { source: "PHIL 7",    target: "PHIL 124",  type: "required" },
    { source: "PSYCH 115", target: "PSYCH 195B",type: "required" },
  ],
  requirements: [
    // Section: Preparation for the Major
    { section: "Preparation for the Major", category: "Mathematics",                    type: "required", courses: ["MATH 31AL", "MATH 31B"] },
    { section: "Preparation for the Major", category: "Chemistry, Linguistics or Physics", type: "required", courses: ["LING 20"] },
    { section: "Preparation for the Major", category: "Program in Computing",          type: "required", courses: ["PIC 10A", "PIC 10B", "PIC 10C"] },
    { section: "Preparation for the Major", category: "Life Science or Physiological Sciences", type: "required", courses: ["LIFESCI 15"] },
    { section: "Preparation for the Major", category: "Psychology",                     type: "required", courses: ["PSYCH 10", "PSYCH 65", "PSYCH 100A", "PSYCH 100B"] },
    { section: "Preparation for the Major", category: "Philosophy",                     type: "required", courses: ["PHIL 7"] },
    // Section: The Major
    { section: "The Major", category: "Required Psychology Courses", type: "required", courses: ["PSYCH 115", "PSYCH 120A", "PSYCH 124A"] },
    { section: "The Major", category: "Additional Required Courses", type: "required", courses: ["PSYCH 186E", "PHIL 124"] },
    { section: "The Major", category: "Upper Division Electives",    type: "elective", choose_n: 2, courses: ["PSYCH 112A", "PSYCH 166B", "PSYCH 119Y"] },
    // Section: Capstone
    { section: "Capstone", category: "Capstone", type: "required", courses: ["PSYCH 195B"] },
  ],
};

const CS_MAJOR_ID = "computer-science-bs";

export default function TreeTest() {
  return (
    <DraggableCanvas>
      <div style={{ padding: 48 }}>
        <DegreeTree majorId={CS_MAJOR_ID} majorName="Computer Science" />
      </div>
    </DraggableCanvas>
  );
}
