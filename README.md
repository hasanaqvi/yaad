# Yaad

A spaced repetition flashcard app for language learning. Build decks for any language, add cards with translations and pronunciation, and review them on an adaptive schedule that shows you harder cards more often.

## Features

- **Language decks** — create a deck per language, each with its own cards and progress
- **Flashcard management** — add cards with English word, translation, pronunciation, and notes; search and edit inline
- **SRS reviews** — SM-2 algorithm schedules each card's next review based on how well you remembered it (Again / Hard / Good / Easy)
- **JWT auth** — register, log in, and keep your data private

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | FastAPI, SQLAlchemy 2, Pydantic 2 |
| Database | PostgreSQL |
| Auth | JWT (python-jose), bcrypt |
| Deployment | Frontend → Vercel, Backend → Render |

## Project Structure

```
yaad/
├── backend/
│   ├── main.py             # FastAPI app + CORS
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # JWT utilities
│   ├── srs.py              # SM-2 algorithm
│   ├── database.py         # DB connection
│   └── routers/
│       ├── auth.py
│       ├── languages.py
│       ├── cards.py
│       └── reviews.py
└── frontend/
    └── src/
        ├── api/client.js       # Axios instance + interceptors
        ├── context/AuthContext.jsx
        ├── components/
        └── pages/
            ├── Dashboard.jsx   # Language deck overview
            ├── Cards.jsx       # Card management
            └── Review.jsx      # SRS review session
```

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Get JWT token |
| GET | `/auth/me` | Yes | Current user |
| GET | `/languages/` | Yes | List decks |
| POST | `/languages/` | Yes | Create deck |
| DELETE | `/languages/{id}` | Yes | Delete deck |
| GET | `/cards/{language_id}` | Yes | List cards (supports `?search=`) |
| POST | `/cards/{language_id}` | Yes | Create card |
| PUT | `/cards/{language_id}/{card_id}` | Yes | Update card |
| DELETE | `/cards/{language_id}/{card_id}` | Yes | Delete card |
| GET | `/reviews/due/{language_id}` | Yes | Cards due for review |
| POST | `/reviews/submit` | Yes | Submit review rating |

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/yaad
SECRET_KEY=your-local-secret-key
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8001
```

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8001`.

## Deployment

**Backend (Render):** set `DATABASE_URL` and `SECRET_KEY` environment variables, point to the `backend/` directory, and use the start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.

**Frontend (Vercel):** set `VITE_API_URL` to your Render backend URL. The project is already linked under `frontend/`.

## SRS Algorithm

Reviews use an SM-2 variant. Each card tracks ease factor, interval, and repetition count:

- **Again (0)** — resets to a 1-day interval
- **Hard (3)** — keeps the current interval, reduces ease factor
- **Good (4)** — multiplies interval by ease factor
- **Easy (5)** — multiplies interval by ease factor with a bonus, increases ease factor

Minimum ease factor is 1.3. New cards start with a 1-day interval and a 2.5 ease factor.
