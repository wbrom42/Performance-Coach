"""FastAPI app entry point. Wires all routers, CORS, static files, and startup."""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from routers import athletes, checkins, sessions, tests, load, flags, ingest

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Performance Coach API",
    version="0.1.0",
    description="Summer soccer performance coach backend — check-ins, sessions, tests, load, flags.",
)

# CORS — allow iPhone web app from any origin during v0.1
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(athletes.router)
app.include_router(checkins.router)
app.include_router(sessions.router)
app.include_router(tests.router)
app.include_router(load.router)
app.include_router(flags.router)
app.include_router(ingest.router)

# Static frontend
static_dir = BASE_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
def landing():
    """Serve the web app."""
    index = static_dir / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return {"status": "API running", "docs": "/docs"}


@app.on_event("startup")
def startup():
    init_db()
