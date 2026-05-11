"""Test results — log and retrieve sprint/jump data."""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, desc
from database import get_session
from models import Athlete, TestResult
from schemas import TestResultOut, TestIn

router = APIRouter(prefix="/api/v1/athletes/{athlete_id}/tests", tags=["tests"])


# Config for known test types
TEST_DEFS: dict[str, dict] = {
    "10y":   {"label": "10-yard sprint",   "unit": "s", "direction": "lower"},
    "20y":   {"label": "20-yard sprint",   "unit": "s", "direction": "lower"},
    "fly10": {"label": "Fly 10-yard",      "unit": "s", "direction": "lower"},
    "cmj":   {"label": "Countermovement Jump", "unit": "cm", "direction": "higher"},
    "sj":    {"label": "Squat Jump",       "unit": "cm", "direction": "higher"},
    "rj":    {"label": "Reactive Strength", "unit": "ratio", "direction": "higher"},
}


@router.get("", response_model=list[TestResultOut])
def get_tests(
    athlete_id: str,
    test_type: str = Query(default="sprint", alias="type"),
    history: int = Query(default=5, ge=1, le=20),
    session: Session = Depends(get_session),
):
    athlete = session.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")

    # Filter test_ids by type
    type_ids = {
        "sprint": ["10y", "20y", "fly10"],
        "jump": ["cmj", "sj", "rj"],
    }.get(test_type, list(TEST_DEFS.keys()))

    results = []
    for tid in type_ids:
        defn = TEST_DEFS.get(tid)
        if not defn:
            continue

        rows = session.exec(
            select(TestResult)
            .where(TestResult.athlete_id == athlete_id, TestResult.test_id == tid)
            .order_by(desc(TestResult.occurred_at))
            .limit(history)
        ).all()

        if not rows:
            continue

        values = [r.value for r in reversed(rows)]
        direction = defn["direction"]
        pr = max(values) if direction == "higher" else min(values)
        latest = values[-1]
        prev = values[-2] if len(values) >= 2 else latest
        delta = round(latest - prev, 2)

        results.append(TestResultOut(
            id=tid,
            label=defn["label"],
            unit=defn["unit"],
            direction=direction,  # type: ignore
            latest=latest,
            pr=pr,
            delta=delta,
            history=values,
            date=rows[-1].occurred_at.strftime("%Y-%m-%d"),
        ))

    return results


@router.post("", status_code=201, response_model=TestResultOut)
def log_test(athlete_id: str, body: TestIn, session: Session = Depends(get_session)):
    athlete = session.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")

    defn = TEST_DEFS.get(body.test_id)
    if not defn:
        raise HTTPException(400, detail=f"Unknown test_id: {body.test_id}")

    tr = TestResult(
        athlete_id=athlete_id,
        test_id=body.test_id,
        value=body.value,
        label=defn["label"],
        unit=defn["unit"],
        direction=defn["direction"],
        occurred_at=body.occurred_at,
    )
    session.add(tr)
    session.commit()
    session.refresh(tr)

    # Build return with history
    rows = session.exec(
        select(TestResult)
        .where(TestResult.athlete_id == athlete_id, TestResult.test_id == body.test_id)
        .order_by(desc(TestResult.occurred_at))
        .limit(5)
    ).all()
    values = [r.value for r in reversed(rows)]
    direction = defn["direction"]
    pr = max(values) if direction == "higher" else min(values)
    prev = values[-2] if len(values) >= 2 else values[-1]
    delta = round(values[-1] - prev, 2)

    return TestResultOut(
        id=body.test_id,
        label=defn["label"],
        unit=defn["unit"],
        direction=direction,  # type: ignore
        latest=values[-1],
        pr=pr,
        delta=delta,
        history=values,
        date=body.occurred_at.strftime("%Y-%m-%d"),
    )
