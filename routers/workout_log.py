"""Manual workout log — POST/GET at /api/v1/log."""

from __future__ import annotations

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, desc
from database import get_session
from models import Athlete, WorkoutLog
from pydantic import BaseModel, Field
from typing import Optional, Literal


router = APIRouter(prefix="/api/v1/log", tags=["log"])


# ── Schema ──

class WorkoutLogIn(BaseModel):
    athlete_id: str = Field(max_length=32)
    date: str = Field(default_factory=lambda: date.today().isoformat())
    session_type: Literal["speed", "strength", "mixed", "game", "recovery", "other"]
    duration_min: int = Field(ge=1, le=300)
    rpe: int = Field(ge=1, le=10)
    notes: Optional[str] = None


class WorkoutLogOut(BaseModel):
    id: int
    athlete_id: str
    date: str
    session_type: str
    duration_min: int
    rpe: int
    notes: Optional[str] = None
    created_at: str


# ── Endpoints ──

@router.post("/workout", status_code=201, response_model=WorkoutLogOut)
def log_workout(body: WorkoutLogIn, session: Session = Depends(get_session)):
    """Log a completed workout."""
    athlete = session.get(Athlete, body.athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")

    log = WorkoutLog(
        athlete_id=body.athlete_id,
        date=date.fromisoformat(body.date),
        session_type=body.session_type,
        duration_min=body.duration_min,
        rpe=body.rpe,
        notes=body.notes,
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return _to_out(log)


@router.get("/workouts", response_model=list[WorkoutLogOut])
def list_workouts(
    athlete_id: str | None = Query(None),
    days: int = Query(default=14, ge=1, le=90),
    session: Session = Depends(get_session),
):
    """List recent workout logs."""
    q = select(WorkoutLog).order_by(desc(WorkoutLog.date), desc(WorkoutLog.id))
    if athlete_id:
        q = q.where(WorkoutLog.athlete_id == athlete_id)

    cutoff = date.today() - timedelta(days=days)
    q = q.where(WorkoutLog.date >= cutoff)

    rows = session.exec(q.limit(50)).all()
    return [_to_out(r) for r in rows]


@router.get("/workouts/today", response_model=list[WorkoutLogOut])
def today_workouts(
    athlete_id: str | None = Query(None),
    session: Session = Depends(get_session),
):
    """Get today's logged workouts."""
    q = select(WorkoutLog).where(WorkoutLog.date == date.today())
    q = q.order_by(WorkoutLog.created_at.desc())
    if athlete_id:
        q = q.where(WorkoutLog.athlete_id == athlete_id)
    rows = session.exec(q).all()
    return [_to_out(r) for r in rows]


def _to_out(w: WorkoutLog) -> WorkoutLogOut:
    return WorkoutLogOut(
        id=w.id,
        athlete_id=w.athlete_id,
        date=w.date.isoformat(),
        session_type=w.session_type,
        duration_min=w.duration_min,
        rpe=w.rpe,
        notes=w.notes,
        created_at=w.created_at.isoformat(),
    )
