"""Computed readiness flags at /api/v1/athletes/{athlete_id}/flags."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from database import get_session
from models import Athlete, Checkin, TestResult
from schemas import FlagOut, FlagSignal

router = APIRouter(prefix="/api/v1/athletes/{athlete_id}/flags", tags=["flags"])

BASELINE_10Y = 1.80  # placeholder baseline


def _compute_flags(athlete_id: str, session: Session) -> list[FlagOut]:
    """Heuristic flag engine. Runs on every read — fast and stateless for v0.1."""
    today = date.today()
    flags: list[FlagOut] = []

    # ── Gather signals ──
    # Latest check-in
    ci = session.exec(
        select(Checkin)
        .where(Checkin.athlete_id == athlete_id)
        .order_by(desc(Checkin.date))
        .limit(1)
    ).first()

    # Rolling 7-day check-in avg
    week_ci = session.exec(
        select(Checkin)
        .where(Checkin.athlete_id == athlete_id, Checkin.date >= today - timedelta(days=7))
    ).all()
    week_avg = round(sum(c.avg for c in week_ci) / len(week_ci), 2) if week_ci else None

    # Latest sprint tests
    sprints = session.exec(
        select(TestResult)
        .where(TestResult.athlete_id == athlete_id, TestResult.test_id == "10y")
        .order_by(desc(TestResult.occurred_at))
        .limit(10)
    ).all()

    # Latest CMJ
    jumps = session.exec(
        select(TestResult)
        .where(TestResult.athlete_id == athlete_id, TestResult.test_id == "cmj")
        .order_by(desc(TestResult.occurred_at))
        .limit(10)
    ).all()

    sprint_values = [r.value for r in sprints]
    jump_values = [r.value for r in jumps]

    sprint_baseline = BASELINE_10Y
    if len(sprint_values) >= 3:
        sprint_baseline = sum(sprint_values[3:]) / len(sprint_values[3:])

    cmj_rolling = sum(jump_values) / len(jump_values) if jump_values else None
    cmj_latest = jump_values[0] if jump_values else None

    soreness = ci.soreness if ci else None
    sleep = ci.sleep if ci else None

    # ── Speed flag ──
    if sprint_values and soreness is not None:
        latest_sprint = sprint_values[0]
        sprint_pct = (latest_sprint - sprint_baseline) / sprint_baseline * 100
        if sprint_pct > 2 and soreness <= 2:
            flags.append(FlagOut(
                id=f"speed-{today}",
                kind="speed",
                severity="warn",
                title="Speed decline with high soreness",
                summary=f"10y sprint {sprint_pct:+.1f}% off baseline ({sprint_baseline:.2f}s vs {latest_sprint:.2f}s) with low soreness tolerance ({soreness}/5).",
                rec="Remove max-velocity work. Prioritize recovery and low-intensity plyos.",
                signals=[
                    FlagSignal(label="10y vs baseline", value=f"{sprint_pct:+.1f}%", tone="bad"),
                    FlagSignal(label="Soreness", value=f"{soreness}/5", tone="warn"),
                ],
            ))

    # ── Power flag ──
    if cmj_latest and cmj_rolling:
        cmj_pct = (cmj_latest - cmj_rolling) / cmj_rolling * 100
        if cmj_pct <= -5:
            flags.append(FlagOut(
                id=f"power-{today}",
                kind="power",
                severity="caution",
                title="Drop in reactive strength",
                summary=f"CMJ {cmj_pct:+.1f}% vs 7-day rolling avg ({cmj_rolling:.1f}cm → {cmj_latest:.1f}cm).",
                rec="Cut lower-body volume 25–40%. Monitor with isometric mid-thigh pull.",
                signals=[
                    FlagSignal(label="CMJ vs rolling", value=f"{cmj_pct:+.1f}%", tone="bad"),
                    FlagSignal(label="Latest CMJ", value=f"{cmj_latest:.1f}cm", tone="warn"),
                ],
            ))

    # ── Freshness flag ──
    if sleep is not None and soreness is not None and cmj_latest and cmj_rolling:
        if sleep >= 4 and soreness >= 4 and cmj_latest >= cmj_rolling:
            flags.append(FlagOut(
                id=f"freshness-{today}",
                kind="freshness",
                severity="ready",
                title="Cleared for full exposure",
                summary=f"Good sleep ({sleep}/5), low soreness ({soreness}/5), CMJ at or above baseline.",
                rec="Full speed exposure. High-intensity change-of-direction and max acceleration work cleared.",
                signals=[
                    FlagSignal(label="Sleep", value=f"{sleep}/5", tone="good"),
                    FlagSignal(label="Soreness", value=f"{soreness}/5", tone="good"),
                    FlagSignal(label="CMJ vs rolling", value=f"{cmj_latest:.1f} vs {cmj_rolling:.1f}cm", tone="good"),
                ],
            ))

    return flags


@router.get("", response_model=list[FlagOut])
def get_flags(athlete_id: str, session: Session = Depends(get_session)):
    athlete = session.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")
    return _compute_flags(athlete_id, session)
