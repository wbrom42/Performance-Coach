"""Pydantic v2 request/response schemas. Exact shapes from the API contract."""

from __future__ import annotations
from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, conint, confloat


Rating = conint(ge=1, le=5)


# ── Athlete ──
class AthleteOut(BaseModel):
    id: str
    name: str
    initials: str
    age: int
    position: str
    avatar_hue: int = Field(217, ge=0, le=360)
    height: Optional[str] = None
    weight: Optional[str] = None
    joined: Optional[str] = None


class AthleteDetail(AthleteOut):
    sessions_total: int = 0
    checkin_streak_days: int = 0
    weekly_readiness: list[float] = []
    weekly_load: list[float] = []
    today: Optional[dict] = None


# ── Check-in ──
class Scores(BaseModel):
    energy: Rating
    sleep: Rating
    soreness: Rating
    motivation: Rating


class CheckinIn(BaseModel):
    scores: Scores
    note: Optional[str] = None


class CheckinOut(BaseModel):
    id: str
    athlete_id: str
    date: date
    time: datetime
    scores: Scores
    avg: float
    note: Optional[str] = None


# ── Session ──
class ExerciseOut(BaseModel):
    name: str
    detail: str


class BlockOut(BaseModel):
    id: str
    name: str
    duration: str
    status: Literal["queued", "active", "complete"]
    tag: str
    accent: Optional[Literal["speed", "strength"]] = None
    exercises: list[ExerciseOut]


class SessionOut(BaseModel):
    id: str
    date: str
    blocks: list[BlockOut]


class BlockStatusIn(BaseModel):
    status: Literal["queued", "active", "complete"]


# ── Tests ──
class TestResultOut(BaseModel):
    id: str
    label: str
    unit: str
    direction: Literal["lower", "higher"]
    latest: float
    pr: float
    delta: float
    history: list[float]
    date: str


class TestIn(BaseModel):
    test_id: str
    value: float
    occurred_at: datetime


# ── Load ──
class LoadMetric(BaseModel):
    label: str
    value: float
    unit: str
    ctx: Optional[str] = None
    delta: Optional[float] = None


class LoadBundle(BaseModel):
    session_rpe: LoadMetric
    weekly_load: LoadMetric
    gps_distance: Optional[LoadMetric] = None
    hs_running: Optional[LoadMetric] = None
    sprint_count: Optional[LoadMetric] = None
    max_speed: Optional[LoadMetric] = None


# ── Flags ──
class FlagSignal(BaseModel):
    label: str
    value: str
    tone: Literal["good", "warn", "bad"]


class FlagOut(BaseModel):
    id: str
    kind: Literal["speed", "power", "workload", "freshness"]
    severity: Literal["ready", "warn", "caution"]
    title: str
    summary: str
    rec: str
    signals: list[FlagSignal]


# ── Ingest ──
class IngestReceipt(BaseModel):
    job_id: str
    provider: str
    rows_seen: int
    status: str
