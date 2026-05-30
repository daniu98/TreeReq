import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import connect_db, close_db
from routers import auth_sso, courses, majors, onboarding, submit_onboarding_data, check_if_onboarded, verify_sso_token, update_data, get_data

@asynccontextmanager
async def lifespan(app):
    await connect_db()
    yield
    await close_db()


app = FastAPI(lifespan=lifespan)

# CORS — allow local dev origins by default, plus any extra origins from the
# CORS_ORIGINS env var for Vercel deployment
_default_origins = [
    "https://treereq-l93h.onrender.com",
    "https://tree-req.vercel.app",
    "https://www.treereq.me",
    "https://www.treereq.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
_extra = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"status": "ok", "project": "TreeReq"}

app.include_router(courses.router, prefix="/api")
app.include_router(majors.router, prefix="/api")
app.include_router(auth_sso.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(submit_onboarding_data.router, prefix="/api")
app.include_router(check_if_onboarded.router, prefix="/api")
app.include_router(verify_sso_token.router, prefix="/api")
app.include_router(update_data.router, prefix="/api")
app.include_router(get_data.router, prefix="/api")
