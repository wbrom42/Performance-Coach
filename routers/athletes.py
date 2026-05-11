"""GET /api/v1/athletes and /api/v1/athletes/{id}."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func, desc
from database import get_session
from models import Athlete, Checkin, LoadEntry
from schemas import AthleteOut, AthleteDetail

router = APIRouter(prefix="/api/v1/athletes", tags=["athletes"])


@router.get("", response_model=list[AthleteOut])
def list_athletes(session: Session = Depends(get_session)):
    rows = session.exec(select(Athlete)).all()
    return rows


@router.get("/{athlete_id}", response_model=AthleteDetail)
def get_athlete(athlete_id: str, session: Session = Depends(get_session)):
    athlete = session.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")

    base = AthleteDetail(**athlete.model_dump())

    # Sessions total
    base.sessions_total = session.exec(
        select(func.count()).select_from(Checkin).where(Checkin.athlete_id == athlete_id)
    ).one()

    # Check-in streak
    today = date.today()
    streak = 0
    for i in range(365):
        d = today - timedelta(days=i)
        c = session.exec(
            select(Checkin).where(Checkin.athlete_id == athlete_id, Checkin.date == d)
        ).first()
        if c:
            streak += 1
        elif i > 0:
            break
    base.checkin_streak_days = streak

    # Weekly readiness (last 4 weeks)
    weekly = session.exec(
        select(Checkin).where(
            Checkin.athlete_id == athlete_id,
            Checkin.date >= today - timedelta(days=28),
        ).order_by(Checkin.date)
    ).all()
    if weekly:
        by_week: dict[str, list[float]] = {}
        for c in weekly:
            iso = c.date.isocalendar()
            wk = f"{iso[0]}-W{iso[1]:02d}"
            by_week.setdefault(wk, []).append(c.avg)
        base.weekly_readiness = [round(sum(v)/len(v), 1) for v in by_week.values()][-4:]

    # Weekly load (last 4 weeks)
    loads = session.exec(
        select(LoadEntry).where(
            LoadEntry.athlete_id == athlete_id,
            LoadEntry.date >= today - timedelta(days=28),
        ).order_by(LoadEntry.date)
    ).all()
    if loads:
        by_week = {}
        for l in loads:
            iso = l.date.isocalendar()
            wk = f"{iso[0]}-W{iso[1]:02d}"
            by_week.setdefault(wk, 0)
            if l.weekly_load:
                by_week[wk] = max(by_week[wk], l.weekly_load)
        base.weekly_load = [round(v) for v in by_week.values()][-4:]

    # Today's check-in
    today_c = session.exec(
        select(Checkin).where(Checkin.athlete_id == athlete_id, Checkin.date == today)
    ).first()
    if today_c:
        base.today = today_c.scores

    return base
