# Archived scripts

One-off or superseded scripts kept for reference. Not part of the regular
workflow — do not run unless you understand why.

## `cleanup_prefixed_majors.py`

Ran once on 2026-05-29 to remove 39 stale `db.majors` documents whose
`major_id` had a stray 1–2 character prefix (e.g. `a0-`, `cw-`, `g-`, `x-`)
left over from a bad scrape. The corresponding `ai/data/*_parsed.json` files
were also renamed and their `major_id` / `major_name` fields cleaned at the
same time. After running `load_all.py` to upsert the corrected entries, this
script deleted the orphaned prefixed documents.

Safe to re-run if the same regression ever reappears: it only deletes a
prefixed `major_id` when a deprefixed sibling already exists in the DB.

## `load_data_OLD.py`

Predecessor to `load_all.py`. Kept for historical reference.
