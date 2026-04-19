from pydantic import BaseModel


class RequirementCategory(BaseModel):
    category: str
    courses: list[str]


class MajorResponse(BaseModel):
    major_id: str
    name: str
    school: str
    requirements: list[RequirementCategory] = []