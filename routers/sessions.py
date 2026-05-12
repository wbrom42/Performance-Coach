"""Session plan endpoints."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from database import get_session
from models import Session, Block, Exercise
from schemas import SessionOut, BlockOut, ExerciseOut, BlockStatusIn

router = APIRouter(prefix="/api/v1/sessions", tags=["sessions"])


def _session_to_out(s: Session) -> SessionOut:
    blocks_out = []
    for b in s.blocks:
        exercises_out = [
            ExerciseOut(name=e.name, detail=e.detail)
            for e in b.exercises
        ]
        blocks_out.append(BlockOut(
            id=str(b.id),
            name=b.name,
            duration=b.duration,
            status=b.status,  # type: ignore
            tag=b.tag,
            accent=b.accent,  # type: ignore
            exercises=exercises_out,
        ))
    return SessionOut(
        id=s.id,
        date=s.date_label,
        blocks=blocks_out,
    )


@router.get("/today", response_model=SessionOut)
def get_today(
    session: Session = Depends(get_session),
    dt: Optional[str] = Query(None, alias="date", description="Date in YYYY-MM-DD format. Defaults to today."),
):
    target = date.fromisoformat(dt) if dt else date.today()
    s = session.exec(
        select(Session).where(Session.date == target)
    ).first()
    if not s:
        raise HTTPException(404, detail="No session planned for today")
    return _session_to_out(s)


@router.put("/{session_id}/blocks/{block_id}/status", response_model=BlockOut)
def update_block_status(
    session_id: str,
    block_id: int,
    body: BlockStatusIn,
    db: Session = Depends(get_session),
):
    b = db.get(Block, block_id)
    if not b or b.session_id != session_id:
        raise HTTPException(404, detail="Block not found")
    b.status = body.status
    db.commit()
    db.refresh(b)

    exercises_out = [
        ExerciseOut(name=e.name, detail=e.detail)
        for e in b.exercises
    ]
    return BlockOut(
        id=str(b.id),
        name=b.name,
        duration=b.duration,
        status=b.status,  # type: ignore
        tag=b.tag,
        accent=b.accent,  # type: ignore
        exercises=exercises_out,
    )
