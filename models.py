"""SQLModel ORM models. Re-exported by database.py."""

from datetime import date, datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, JSON, Relationship


# ── Athlete ──
class Athlete(SQLModel, table=True):
    id: str = Field(primary_key=True, max_length=32)  # "tristan", "kennedy"
    name: str
    initials: str
    age: int
    position: str
    avatar_hue: int = 217
    height: Optional[str] = None
    weight: Optional[str] = None
    joined: Optional[str] = None


# ── Check-in ──
class Checkin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    athlete_id: str = Field(foreign_key="athlete.id", index=True)
    date: date
    time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    energy: int = Field(ge=1, le=5)
    sleep: int = Field(ge=1, le=5)
    soreness: int = Field(ge=1, le=5)  # 5 = no soreness
    motivation: int = Field(ge=1, le=5)
    note: Optional[str] = None

    @property
    def avg(self) -> float:
        return round((self.energy + self.sleep + self.soreness + self.motivation) / 4, 2)

    @property
    def scores(self) -> dict:
        return {
            "energy": self.energy,
            "sleep": self.sleep,
            "soreness": self.soreness,
            "motivation": self.motivation,
        }


# ── Session / Blocks / Exercises ──
class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    block_id: int = Field(foreign_key="block.id", index=True)
    name: str
    detail: str
    sort_order: int = 0


class Block(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(foreign_key="session.id", index=True)
    name: str
    duration: str
    status: str = Field(default="queued")  # queued | active | complete
    tag: str = ""
    accent: Optional[str] = None           # speed | strength | None
    sort_order: int = 0
    exercises: List["Exercise"] = Relationship(sa_relationship_kwargs={"order_by": "Exercise.sort_order"})


class Session(SQLModel, table=True):
    id: str = Field(primary_key=True)       # "ses_2026_05_13"
    date_label: str                         # "Wednesday, May 13"
    date: date
    blocks: List[Block] = Relationship(sa_relationship_kwargs={"order_by": "Block.sort_order"})


# ── Tests ──
class TestResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    athlete_id: str = Field(foreign_key="athlete.id", index=True)
    test_id: str     # "10y", "20y", "fly10", "cmj"
    value: float
    label: str = ""
    unit: str = ""
    direction: str = "lower"  # lower = better, higher = better
    occurred_at: datetime


# ── Training Load ──
class LoadEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    athlete_id: str = Field(foreign_key="athlete.id", index=True)
    date: date
    session_rpe: Optional[float] = None
    weekly_load: Optional[float] = None
    gps_distance_km: Optional[float] = None
    hs_running_m: Optional[float] = None
    sprint_count: Optional[int] = None
    max_speed_kmh: Optional[float] = None


# ── Flags (computed, persisted for audit) ──
class Flag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    athlete_id: str = Field(foreign_key="athlete.id", index=True)
    date: date
    kind: str      # speed | power | workload | freshness
    severity: str  # ready | warn | caution
    title: str
    summary: str
    rec: str
    signals: str = Field(default="[]", sa_column=Column(JSON))  # list[dict]


# ── Pain Reports ──
class PainReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    athlete_id: str = Field(foreign_key="athlete.id", index=True)
    date: date
    location: str
    side: Optional[str] = None  # left | right | bilateral | midline
    severity: int = Field(ge=1, le=10)
    pain_type: str = "tight"  # tight | sore | sharp | dull | throbbing | other
    affects_running: bool = False
    affects_cutting: bool = False
    trend: str = "new"  # new | same | better | worse
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Weekly Adjustment Packets ──
class WeeklyAdjustmentPacket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    athlete_id: str = Field(foreign_key="athlete.id", index=True)
    week_start: date
    week_end: date
    overall_status: str   # progressing | holding | needs_attention | deload_recommended
    risk_level: str       # low | medium | high
    headline: str
    key_wins: str = Field(default="[]", sa_column=Column(JSON))
    concerns: str = Field(default="[]", sa_column=Column(JSON))
    training_adjustments: str = Field(default="[]", sa_column=Column(JSON))
    athlete_message: str = ""
    coach_notes: str = ""
    parent_summary: Optional[str] = None
    next_week_focus: str = Field(default="[]", sa_column=Column(JSON))
    plan_change_explanation: Optional[str] = None
    do_not_do: str = Field(default="[]", sa_column=Column(JSON))
    confidence: str = "medium"  # low | medium | high
    raw_input: Optional[str] = Field(default=None, sa_column=Column(JSON))
    raw_output: Optional[str] = Field(default=None, sa_column=Column(JSON))
    coach_status: str = Field(default="pending")  # pending | approved | edited | ignored
    coach_reviewed_at: Optional[datetime] = None
    coach_edits: Optional[str] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
