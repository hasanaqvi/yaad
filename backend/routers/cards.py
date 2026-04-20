from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from database import get_db
from auth import get_current_user
import models, schemas
from datetime import datetime

router = APIRouter()


def get_language_or_404(language_id: int, user_id: int, db: Session) -> models.Language:
    language = db.query(models.Language).filter(
        models.Language.id == language_id,
        models.Language.user_id == user_id,
    ).first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    return language


@router.get("/library", response_model=List[schemas.CardLibraryOut])
def get_library(
    language_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = (
        db.query(models.Card, models.ReviewLog, models.Language)
        .join(models.ReviewLog, models.ReviewLog.card_id == models.Card.id)
        .join(models.Language, models.Language.id == models.Card.language_id)
        .filter(models.Card.user_id == current_user.id)
    )
    if language_id:
        query = query.filter(models.Card.language_id == language_id)
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            (models.Card.english.ilike(pattern)) |
            (models.Card.translation.ilike(pattern))
        )
    results = query.order_by(models.Language.name, models.Card.english).all()
    return [
        schemas.CardLibraryOut(
            id=card.id,
            language_id=card.language_id,
            language_name=lang.name,
            flag_emoji=lang.flag_emoji,
            english=card.english,
            translation=card.translation,
            notes=card.notes,
            interval_days=log.interval_days,
            next_review_date=log.next_review_date,
            repetitions=log.repetitions,
        )
        for card, log, lang in results
    ]


@router.get("/{language_id}", response_model=List[schemas.CardOut])
def get_cards(
    language_id: int,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    get_language_or_404(language_id, current_user.id, db)

    query = db.query(models.Card).filter(
        models.Card.language_id == language_id,
        models.Card.user_id == current_user.id,
    )

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            (models.Card.english.ilike(pattern)) |
            (models.Card.translation.ilike(pattern))
        )

    return query.order_by(models.Card.created_at.desc()).all()


@router.post("/{language_id}", response_model=schemas.CardOut, status_code=status.HTTP_201_CREATED)
def create_card(
    language_id: int,
    payload: schemas.CardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    get_language_or_404(language_id, current_user.id, db)

    english_exists = db.query(models.Card).filter(
        models.Card.language_id == language_id,
        models.Card.english.ilike(payload.english),
    ).first()
    if english_exists:
        raise HTTPException(
            status_code=409,
            detail=f"A card for '{payload.english}' already exists in this deck"
        )

    translation_exists = db.query(models.Card).filter(
        models.Card.language_id == language_id,
        models.Card.translation.ilike(payload.translation),
    ).first()
    if translation_exists:
        raise HTTPException(
            status_code=409,
            detail=f"The translation '{payload.translation}' already exists in this deck (used for '{translation_exists.english}')"
        )

    card = models.Card(
        language_id=language_id,
        user_id=current_user.id,
        english=payload.english,
        translation=payload.translation,
        notes=payload.notes,
        pronunciation=payload.pronunciation,
    )
    db.add(card)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A duplicate card already exists in this deck")

    review_log = models.ReviewLog(
        card_id=card.id,
        user_id=current_user.id,
        next_review_date=datetime.utcnow(),
    )
    db.add(review_log)
    db.commit()
    db.refresh(card)
    return card


@router.put("/{language_id}/{card_id}", response_model=schemas.CardOut)
def update_card(
    language_id: int,
    card_id: int,
    payload: schemas.CardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    get_language_or_404(language_id, current_user.id, db)

    card = db.query(models.Card).filter(
        models.Card.id == card_id,
        models.Card.user_id == current_user.id,
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if payload.english is not None:
        dup = db.query(models.Card).filter(
            models.Card.language_id == language_id,
            models.Card.english.ilike(payload.english),
            models.Card.id != card_id,
        ).first()
        if dup:
            raise HTTPException(status_code=409, detail=f"'{payload.english}' already exists in this deck")
        card.english = payload.english

    if payload.translation is not None:
        dup = db.query(models.Card).filter(
            models.Card.language_id == language_id,
            models.Card.translation.ilike(payload.translation),
            models.Card.id != card_id,
        ).first()
        if dup:
            raise HTTPException(status_code=409, detail=f"Translation '{payload.translation}' already exists in this deck")
        card.translation = payload.translation

    if payload.notes is not None:
        card.notes = payload.notes
    if payload.pronunciation is not None:
        card.pronunciation = payload.pronunciation

    db.commit()
    db.refresh(card)
    return card


@router.delete("/{language_id}/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    language_id: int,
    card_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    card = db.query(models.Card).filter(
        models.Card.id == card_id,
        models.Card.user_id == current_user.id,
        models.Card.language_id == language_id,
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
