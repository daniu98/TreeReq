from pydantic import BaseModel


class ElectiveGroup(BaseModel):
    choose_n: int
    courses: list[str]


class RequirementCategory(BaseModel):
    category: str
    courses: list[str] = []
    type: str = "required"
    choose_n: int | None = None
    elective_groups: list[ElectiveGroup] = []


class MajorResponse(BaseModel):
    major_id: str
    name: str
    school: str = "UCLA"
    url: str = ""
    requirements: list[RequirementCategory] = []