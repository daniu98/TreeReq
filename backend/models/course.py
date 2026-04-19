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


class TreeEdge(BaseModel):
    source: str
    target: str
    type: str = "required"


class PrereqTreeResponse(BaseModel):
    root: str
    nodes: list[TreeNode]
    edges: list[TreeEdge]