"""Device ingest endpoints — CSV upload and provider webhooks."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session
from database import get_session
from schemas import IngestReceipt

router = APIRouter(prefix="/api/v1/ingest", tags=["ingest"])

SUPPORTED_PROVIDERS = {"freelap", "output_sports", "statsports_apex"}


@router.post("/csv", status_code=202, response_model=IngestReceipt)
async def ingest_csv(
    provider: str = Form(...),
    athlete_id: str = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(400, detail=f"Unsupported provider. Choose from: {', '.join(SUPPORTED_PROVIDERS)}")

    content = await file.read()
    lines = content.decode("utf-8").strip().split("\n")
    rows_seen = max(0, len(lines) - 1)  # header row

    # v0.1: acknowledge and queue — parse later
    return IngestReceipt(
        job_id=f"job_{uuid.uuid4().hex[:12]}",
        provider=provider,
        rows_seen=rows_seen,
        status="queued",
    )


@router.post("/webhook/{provider}", status_code=200)
async def ingest_webhook(provider: str):
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(400, detail=f"Unsupported provider")
    return {"status": "received", "provider": provider}
