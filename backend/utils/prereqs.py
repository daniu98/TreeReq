"""Normalize scraped prereqs_parsed blobs before Pydantic validation."""

from models.course import PrereqsParsed


def _as_str_list(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, str)]
    return []


def _normalize_one_of(raw) -> list[list[str]]:
    if not raw:
        return []
    groups: list[list[str]] = []
    for item in raw:
        if isinstance(item, str):
            groups.append([item])
        elif isinstance(item, list):
            group = [x for x in item if isinstance(x, str)]
            if group:
                groups.append(group)
    return groups


def parse_prereqs(raw) -> PrereqsParsed:
    if not isinstance(raw, dict):
        return PrereqsParsed()
    return PrereqsParsed(
        required=_as_str_list(raw.get("required")),
        corequisites=_as_str_list(raw.get("corequisites")),
        one_of=_normalize_one_of(raw.get("one_of")),
        min_grade=raw.get("min_grade") if isinstance(raw.get("min_grade"), str) else None,
        recommended=_as_str_list(raw.get("recommended")),
    )
