# Major JSON → Visual Tree Algorithm

This document describes how TreeReq turns **any** major document from MongoDB (or `*_parsed.json`) into the Figma-style degree tree: green **milestones**, grey **categories**, white **course** pills, and grey **prereq** links.

## Input format (works for every major file)

```json
{
  "major_id": "cognitive-science",
  "major_name": "Cognitive Science, B.S.",
  "requirements": [
    {
      "category": "Mathematics",
      "type": "required",
      "choose_n": null,
      "courses": ["MATH 31A", "MATH 31B", "STATS 13"]
    },
    {
      "category": "Upper Division Electives",
      "type": "elective",
      "choose_n": 3,
      "courses": ["PSYCH 120A", "PSYCH 120B", "COM SCI 31"]
    }
  ],
  "courses": [
    {
      "course_id": "MATH 31A",
      "dept": "MATH",
      "number": "31A",
      "title": "Differential and Integral Calculus",
      "units": 4,
      "prereqs_parsed": {
        "required": [],
        "corequisites": [],
        "one_of": []
      }
    }
  ]
}
```

MongoDB stores the same `requirements` on `majors`; course bodies live in `courses` and are joined at API time.

## Algorithm (5 steps)

### 1. Normalize

- Read `major_id`, `major_name` (or `name`), `requirements[]`, optional `courses[]`.
- Build `course_id → course` lookup for titles and prereqs.
- Collect all course IDs referenced in requirements (used to filter prereq edges).

### 2. Classify each requirement category into a milestone

| Milestone | Label (Figma) | Heuristic (category name contains…) |
|-----------|---------------|-------------------------------------|
| `prep` | Preparation for the Major | preparation, prep, preparatory |
| `major` | The Major | upper division, elective, required courses, breadth, … |
| `capstone` | Capstone | capstone, senior design |
| `root` | Major name | Synthetic root node (major title) |

Default unknown categories → **major** (not prep).

### 3. Build nodes

**Spine (green milestones)** — always in order:

`[Major Name] → Preparation for the Major → The Major → Capstone`

**Categories (grey circles)** — one per `requirements[]` row, parent = milestone from step 2.

**Courses (pills)** — one per `courses[]` entry in that category; status defaults to `Unfulfilled` until user progress is wired.

Electives: `choose_n` → subtitle `"Choose N"` on the category node.

### 4. Build structural edges

| kind | source → target |
|------|-----------------|
| `spine` | milestone → next milestone |
| `contains` | milestone → category, category → course |

### 5. Build prereq edges

For each course with `prereqs_parsed`:

- `required` → edge kind `prereq`
- `corequisites` → `corequisite`
- `one_of` options → `one_of` (same group id for OR styling later)

Only edges where **both** courses appear in this major’s requirement lists are included (avoids pulling in the whole UCLA catalog).

## Output shape

```json
{
  "major_id": "cognitive-science",
  "major_name": "Cognitive Science, B.S.",
  "milestones": [
    { "key": "root", "id": "milestone:root:...", "label": "Cognitive Science, B.S." },
    { "key": "prep", "id": "...", "label": "Preparation for the Major" }
  ],
  "sections": [
    {
      "milestone": { "key": "prep", "label": "Preparation for the Major" },
      "categories": [
        {
          "category": { "label": "Mathematics", "choose_n": null },
          "courses": [{ "courseName": "MATH 31A", "status": "Unfulfilled" }],
          "prereq_edges": [{ "source": "MATH 31A", "target": "MATH 31B", "kind": "prereq" }]
        }
      ]
    }
  ],
  "nodes": [ "... flat list for graph renderers ..." ],
  "edges": [ "... flat list ..." ],
  "stats": { "courses": 42, "nodes": 120, "edges": 200 }
}
```

Use **`sections`** for Figma-like layout (columns per milestone). Use **`nodes` + `edges`** for React Flow / dagre / custom SVG.

## Code locations

| Layer | Path |
|-------|------|
| Python (source of truth) | `backend/tree_builder.py` |
| API | `GET /api/majors/{major_id}/visual-tree` |
| JavaScript (same logic) | `frontend/src/lib/buildMajorVisualTree.js` |
| API client | `frontend/src/services/majorsApi.js` |

## Try it

**API** (backend running, major loaded in MongoDB):

```bash
curl http://localhost:8000/api/majors/cognitive-science/visual-tree | jq '.stats, .sections[0]'
```

**Client** (browser console on the app):

```js
import { buildVisualTreeFromJson } from './src/services/majorsApi.js'
// paste parsed JSON object
buildVisualTreeFromJson(majorJson)
```

**Python** (offline JSON file):

```bash
cd backend && python -c "
import json
from tree_builder import build_visual_tree
doc = json.load(open('../ai/data/cognitive_science_parsed.json'))
print(build_visual_tree(doc)['stats'])
"
```

## What’s next for Figma layout

The algorithm produces the **graph**. Rendering still needs:

1. **Layout** — dagre/elk layered left-to-right per milestone column (not the current linear `Tree.jsx`).
2. **User progress** — merge completed/planned courses from profile into `status` and category `completion_percentage`.
3. **OR groups** — render `one_of` edges as bundled “pick one” UI.

The current `Tree.jsx` only connects **adjacent** nodes in an array; use `sections` or a graph library for the full Figma tree.
