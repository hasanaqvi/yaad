from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LanguageCreate(BaseModel):
    name: str
    flag_emoji: Optional[str] = None


class LanguageOut(BaseModel):
    id: int
    name: str
    flag_emoji: Optional[str]
    created_at: datetime
    card_count: Optional[int] = 0

    class Config:
        from_attributes = True


class CardCreate(BaseModel):
    english: str
    translation: str
    notes: Optional[str] = None
    pronunciation: Optional[str] = None


class CardUpdate(BaseModel):
    english: Optional[str] = None
    translation: Optional[str] = None
    notes: Optional[str] = None
    pronunciation: Optional[str] = None


class CardOut(BaseModel):
    id: int
    language_id: int
    english: str
    translation: str
    notes: Optional[str]
    pronunciation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewSubmit(BaseModel):
    card_id: int
    quality: int


class ReviewLogOut(BaseModel):
    card_id: int
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review_date: datetime
    last_reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True


class DueCardOut(BaseModel):
    card: CardOut
    review_log: ReviewLogOut
