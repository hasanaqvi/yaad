# Yaad — يَاد

A spaced repetition flashcard app for language learning. Build decks for any language, add cards with translations, and review them on an adaptive schedule that surfaces harder cards more often.

## Features

- **Language decks** — create a deck per language with a flag emoji; rename or delete at any time
- **Keyboard-first card entry** — Enter advances through fields, saves on the last one; form stays open for rapid bulk adding
- **SRS reviews** — SM-2 algorithm with a 3D flip card; rate Again / Hard / Good / Easy or skip to the end of the queue
- **Review keyboard shortcuts** — `Space`/`Enter` to flip, `1`–`4` to rate
- **Library** — filterable table of all cards across every deck; inline edit or delete any row
- **Profile** — progress overview (Total Cards, Due Today) and a breakdown by tier: New / Learning / Reviewing / Mastered
- **Dark mode** — navbar toggle + system preference; preference saved to `localStorage`
- **JWT auth** — register, log in, token auto-refreshes on each request

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router 7, Axios |
| Backend | FastAPI, SQLAlchemy 2, Pydantic 2 |
| Database | PostgreSQL |
| Auth | JWT (python-jose), bcrypt |
| Fonts | Inter (UI), Amiri (Urdu logo) via Google Fonts |
| Deployment | Frontend → Vercel, Backend → Render |

## Project Structure

```
yaad/
├── vercel.json             # Tells Vercel to build from frontend/
├── backend/
│   ├── main.py             # FastAPI app + CORS
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # JWT utilities
│   ├── srs.py              # SM-2 algorithm
│   ├── database.py         # DB connection
│   └── routers/
│       ├── auth.py         # /auth routes + /auth/stats
│       ├── languages.py    # /languages routes
│       ├── cards.py        # /cards routes + /cards/library
│       └── reviews.py      # /reviews routes
└── frontend/
    └── src/
        ├── api/client.js           # Axios instance + auth interceptor
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx    # Dark mode state + localStorage
        ├── components/
        │   ├── Navbar.jsx
        │   └── PrivateRoute.jsx
        └── pages/
            ├── Dashboard.jsx   # Hero layout, stat cards, deck list
            ├── Cards.jsx       # Keyboard-driven card entry
            ├── Review.jsx      # 3D flip card, keyboard shortcuts
            ├── Library.jsx     # Cross-deck table with inline editing
            └── Profile.jsx     # Stats, progress tiers, language table
```

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Get JWT token |
| GET | `/auth/me` | Yes | Current user |
| GET | `/auth/stats` | Yes | Aggregate stats (total, due, tiers) |
| GET | `/languages/` | Yes | List decks (includes `card_count`, `due_count`, `mastered_count`) |
| POST | `/languages/` | Yes | Create deck |
| PUT | `/languages/{id}` | Yes | Rename deck or change flag |
| DELETE | `/languages/{id}` | Yes | Delete deck (cascades to cards) |
| GET | `/cards/{language_id}` | Yes | List cards for a deck (`?search=`) |
| GET | `/cards/library` | Yes | All cards across decks (`?language_id=`, `?search=`) |
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

**Backend (Render):** set `DATABASE_URL` and `SECRET_KEY` as environment variables, set the root directory to `backend/`, and use `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command.

**Frontend (Vercel):** set `VITE_API_URL` to your Render backend URL. The `vercel.json` at the repo root points Vercel at the `frontend/` subdirectory automatically.

## SRS Algorithm

Reviews use an SM-2 variant. Each card tracks ease factor, interval, and repetition count:

- **Again (0)** — resets to a 1-day interval
- **Hard (3)** — keeps the current interval, reduces ease factor
- **Good (4)** — multiplies interval by ease factor
- **Easy (5)** — multiplies interval by ease factor with a bonus, increases ease factor

Minimum ease factor is 1.3. New cards start with a 1-day interval and a 2.5 ease factor.

Card progress tiers used in the Profile and Library views:

| Tier | Condition |
|---|---|
| New | `repetitions == 0` |
| Learning | `repetitions > 0` and `interval < 7 days` |
| Reviewing | `7 ≤ interval < 21 days` |
| Mastered | `interval ≥ 21 days` |
