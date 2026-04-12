from fastapi import FastAPI

web = FastAPI()

@web.get("/")
def home():
    return {"status": "ok", "project": "TreeReq"}