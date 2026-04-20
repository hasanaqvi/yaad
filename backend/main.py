from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, languages, cards, reviews

app = FastAPI(title="Yaad API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yaad.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(languages.router, prefix="/languages", tags=["languages"])
app.include_router(cards.router, prefix="/cards", tags=["cards"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])


@app.get("/")
def root():
    return {"status": "Yaad API is running"}
