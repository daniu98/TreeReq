# 🌳 TreeReq

**An interactive prerequisite tree visualizer for UCLA students.**

TreeReq transforms UCLA's complex degree requirements into a visual, interactive graph. Instead of wrestling with DARS and walls of text, students can select their major and instantly see how every course connects — which classes unlock which, what's required, and what path to take.

---

## Features

🌲 **Interactive Prereq Tree** — View your major's courses as a visual graph. See how one class unlocks the next.

🎨 **Color-Coded Progress** — Mark courses as completed. Green = done, blue = available to take, grey = still locked.

🔍 **Course Details** — Click any node to see the full course description, units, and prerequisites.

📊 **Difficulty Data** — Course difficulty scores powered by real UCLA grade distribution data.

🤖 **AI Planner** *(stretch goal)* — Generate a personalized four-year graduation plan powered by Claude AI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, React Flow, Tailwind CSS |
| Backend | FastAPI (Python), MongoDB (Motor) |
| AI / Data | Playwright (scraping), Claude API (Anthropic) |
| Auth | Firebase Auth |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Project Structure

```
TreeReq/
├── frontend/          React + React Flow app
├── backend/           FastAPI + MongoDB API
├── ai/                Scrapers + Claude prereq parser
└── README.md
```

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add your MongoDB URI
python scripts/seed_data.py   # load test data
uvicorn main:app --reload     # runs on localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # runs on localhost:5173
```

### AI / Scraper

```bash
cd ai
pip install -r requirements.txt
playwright install chromium
python scrape_catalog.py      # scrape UCLA course data
python parse_prereqs.py       # parse prereqs with Claude
```


## License

This project was built for UCLA Creative Labs and is intended for educational use by UCLA students.