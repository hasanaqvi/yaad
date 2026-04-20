from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.LanguageOut])
def get_languages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    languages = db.query(models.Language).filter(
        models.Language.user_id == current_user.id
    ).order_by(models.Language.created_at).all()

    result = []
    for lang in languages:
        count = db.query(models.Card).filter(models.Card.language_id == lang.id).count()
        lang_out = schemas.LanguageOut.model_validate(lang)
        lang_out.card_count = count
        result.append(lang_out)
    return result


@router.post("/", response_model=schemas.LanguageOut, status_code=status.HTTP_201_CREATED)
def create_language(
    payload: schemas.LanguageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Language).filter(
        models.Language.user_id == current_user.id,
        models.Language.name == payload.name
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"You already have a '{payload.name}' deck")

    language = models.Language(
        user_id=current_user.id,
        name=payload.name,
        flag_emoji=payload.flag_emoji,
    )
    db.add(language)
    db.commit()
    db.refresh(language)
    return schemas.LanguageOut(card_count=0, **language.__dict__)


@router.delete("/{language_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_language(
    language_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    language = db.query(models.Language).filter(
        models.Language.id == language_id,
        models.Language.user_id == current_user.id,
    ).first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    db.delete(language)
    db.commit()
