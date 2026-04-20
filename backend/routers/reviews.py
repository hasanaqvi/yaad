from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from auth import get_current_user
import models, schemas
from srs import calculate_next_review

router = APIRouter()


@router.get("/due/{language_id}", response_model=List[schemas.DueCardOut])
def get_due_cards(
    language_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()

    due = (
        db.query(models.Card, models.ReviewLog)
        .join(models.ReviewLog, models.ReviewLog.card_id == models.Card.id)
        .filter(
            models.Card.language_id == language_id,
            models.Card.user_id == current_user.id,
            models.ReviewLog.next_review_date <= now,
        )
        .all()
    )

    return [
        schemas.DueCardOut(
            card=schemas.CardOut.model_validate(card),
            review_log=schemas.ReviewLogOut.model_validate(log),
        )
        for card, log in due
    ]


@router.post("/submit", response_model=schemas.ReviewLogOut)
def submit_review(
    payload: schemas.ReviewSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.quality not in (0, 3, 4, 5):
        raise HTTPException(status_code=400, detail="quality must be 0, 3, 4, or 5")

    card = db.query(models.Card).filter(
        models.Card.id == payload.card_id,
        models.Card.user_id == current_user.id,
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    log = db.query(models.ReviewLog).filter(
        models.ReviewLog.card_id == payload.card_id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Review log not found for this card")

    updated = calculate_next_review(
        quality=payload.quality,
        ease_factor=log.ease_factor,
        interval_days=log.interval_days,
        repetitions=log.repetitions,
    )

    log.ease_factor = updated["ease_factor"]
    log.interval_days = updated["interval_days"]
    log.repetitions = updated["repetitions"]
    log.next_review_date = updated["next_review_date"]
    log.last_reviewed_at = updated["last_reviewed_at"]

    db.commit()
    db.refresh(log)
    return log
