from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
    Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    languages = relationship("Language", back_populates="user", cascade="all, delete")
    cards = relationship("Card", back_populates="user", cascade="all, delete")
    review_logs = relationship("ReviewLog", back_populates="user", cascade="all, delete")


class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    flag_emoji = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_language_name"),
    )

    user = relationship("User", back_populates="languages")
    cards = relationship("Card", back_populates="language", cascade="all, delete")


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    english = Column(String, nullable=False)
    translation = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    pronunciation = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("language_id", "english", name="uq_language_english"),
        UniqueConstraint("language_id", "translation", name="uq_language_translation"),
    )

    language = relationship("Language", back_populates="cards")
    user = relationship("User", back_populates="cards")
    review_log = relationship("ReviewLog", back_populates="card", uselist=False, cascade="all, delete")


class ReviewLog(Base):
    __tablename__ = "review_logs"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    repetitions = Column(Integer, default=0)

    next_review_date = Column(DateTime(timezone=True), server_default=func.now())
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)

    card = relationship("Card", back_populates="review_log")
    user = relationship("User", back_populates="review_logs")
