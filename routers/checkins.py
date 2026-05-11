"""POST/GET check-ins at /api/v1/athletes/{athlete_id}/checkins."""

from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, desc
from database import get_session
from models import Athlete, Checkin
from schemas import CheckinIn, CheckinOut, Scores

router = APIRouter(prefix="/api/v1/athletes/{athlete_id}/checkins", tags=["checkins"])


def _to_out(c: Checkin) -> CheckinOut:
    return CheckinOut(
        id=str(c.id),
        athlete_id=c.athlete_id,
        date=c.date,
        time=c.time,
        scores=Scores(
            energy=c.energy,
            sleep=c.sleep,
            soreness=c.soreness,
            motivation=c.motivation,
        ),
        avg=c.avg,
        note=c.note,
    )


@router.get("/today", response_model=CheckinOut | None)
def get_today(athlete_id: str, session: Session = Depends(get_session)):
    today = date.today()
    c = session.exec(
        select(Checkin).where(Checkin.athlete_id == athlete_id, Checkin.date == today)
    ).first()
    if c is None:
        return None
    return _to_out(c)


@router.post("", status_code=201, response_model=CheckinOut)
def upsert_checkin(athlete_id: str, body: CheckinIn, session: Session = Depends(get_session)):
    athlete = session.get(Athlete, athlete_id)
    if not athlete:
        raise HTTPException(404, detail="Athlete not found")

    today = date.today()
    existing = session.exec(
        select(Checkin).where(Checkin.athlete_id == athlete_id, Checkin.date == today)
    ).first()

    if existing:
        existing.energy = body.scores.energy
        existing.sleep = body.scores.sleep
        existing.soreness = body.scores.soreness
        existing.motivation = body.scores.motivation
        existing.note = body.note
        existing.time = datetime.now(timezone.utc)
        session.commit()
        session.refresh(existing)
        return _to_out(existing)

    c = Checkin(
        athlete_id=athlete_id,
        date=today,
        energy=body.scores.energy,
        sleep=body.scores.sleep,
        soreness=body.scores.soreness,
        motivation=body.scores.motivation,
        note=body.note,
    )
    session.add(c)
    session.commit()
    session.refresh(c)
    return _to_out(c)


@router.get("", response_model=list[CheckinOut])
def list_checkins(
    athlete_id: str,
    from_date: str = Query(default=None, alias="from"),
    to_date: str = Query(default=None, alias="to"),
    session: Session = Depends(get_session),
):
    q = select(Checkin).where(Checkin.athlete_id == athlete_id)
    if from_date:
        q = q.where(Checkin.date >= date.fromisoformat(from_date))
    if to_date:
        q = q.where(Checkin.date <= date.fromisoformat(to_date))
    q = q.order_by(Checkin.date.desc())
    rows = session.exec(q).all()
    return [_to_out(r) for r in rows]
