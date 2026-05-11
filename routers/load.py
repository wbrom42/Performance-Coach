"""Training load at /api/v1/athletes/{athlete_id}/load."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, desc
from database import get_session
from models import Athlete, LoadEntry, Checkin
from schemas import LoadBundle, LoadMetric

router = APIRouter(prefix="/api/v1/athletes/{athlete_id}/load", tags=["load"])


@router.get("", response_model=LoadBundle)
def get_load(
    athlete_id: str,
    range: str = Query(default="session"),
    session: Session = Depends(get_session),
):
    athlete = session.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")

    today = date.today()

    # Latest load entry
    latest = session.exec(
        select(LoadEntry)
        .where(LoadEntry.athlete_id == athlete_id)
        .order_by(desc(LoadEntry.date))
        .limit(1)
    ).first()

    # Previous load entry for delta
    prev = None
    if latest:
        prev = session.exec(
            select(LoadEntry)
            .where(LoadEntry.athlete_id == athlete_id, LoadEntry.date < latest.date)
            .order_by(desc(LoadEntry.date))
            .limit(1)
        ).first()

    def load_metric(
        value, label, unit, ctx=None, delta=None, prev_val=None
    ) -> LoadMetric:
        d = None
        if delta is not None:
            d = delta
        elif prev_val is not None and value is not None:
            d = round(value - prev_val, 2)
        return LoadMetric(
            label=label, value=value or 0, unit=unit, ctx=ctx, delta=d,
        )

    return LoadBundle(
        session_rpe=load_metric(
            latest.session_rpe if latest else None,
            "Session RPE", "/10",
            ctx="Today's session",
        ),
        weekly_load=load_metric(
            latest.weekly_load if latest else None,
            "Weekly load", "AU",
            ctx=f"vs {prev.weekly_load} last wk" if (prev and prev.weekly_load) else None,
            delta=round((latest.weekly_load or 0) - (prev.weekly_load or 0), 2) if (latest and prev) else None,
        ),
        gps_distance=load_metric(
            latest.gps_distance_km if latest and latest.gps_distance_km else None,
            "Total distance", "km",
            ctx="this session" if range == "session" else "this week",
        ) if (latest and latest.gps_distance_km) else None,
        hs_running=load_metric(
            latest.hs_running_m if latest and latest.hs_running_m else None,
            "High-speed running", "m",
        ) if (latest and latest.hs_running_m) else None,
        sprint_count=load_metric(
            float(latest.sprint_count) if latest and latest.sprint_count else None,
            "Sprint count", "n",
        ) if (latest and latest.sprint_count) else None,
        max_speed=load_metric(
            latest.max_speed_kmh if latest and latest.max_speed_kmh else None,
            "Max speed", "km/h",
        ) if (latest and latest.max_speed_kmh) else None,
    )
