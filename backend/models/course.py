from pydantic import BaseModel


class PrereqsParsed(BaseModel):
    required: list[str] = []
    corequisites: list[str] = []
    one_of: list[list[str]] = []
    min_grade: str | None = None
    recommended: list[str] = []


class CourseResponse(BaseModel):
    course_id: str
    dept: str
    number: str
    title: str
    units: float
    description: str = ""
    prereqs_raw: str = ""
    prereqs_parsed: PrereqsParsed = PrereqsParsed()


class TreeNode(BaseModel):
    id: str
    dept: str
    number: str
    title: str
    units: float
    is_elective: bool = False  # true = pick from a list, false = must take


class TreeEdge(BaseModel):
    source: str
    target: str
    type: str = "required"  # "required", "corequisite", "one_of"


class RequirementInfo(BaseModel):
    category: str
    type: str = "required"
    choose_n: int | None = None
    courses: list[str] = []


class PrereqTreeResponse(BaseModel):
    root: str
    nodes: list[TreeNode]
    edges: list[TreeEdge]
    requirements: list[RequirementInfo] = []  # tells frontend which categories are elective