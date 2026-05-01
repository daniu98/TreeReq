from pydantic import BaseModel


class RequirementCategory(BaseModel):
    category: str
    courses: list[str]
    type: str = "required"     # "required" = take all, "elective" = pick some
    choose_n: int | None = None  # how many to pick (null = take all)


class MajorResponse(BaseModel):
    major_id: str
    name: str
    school: str = "UCLA"
    url: str = ""
    requirements: list[RequirementCategory] = []