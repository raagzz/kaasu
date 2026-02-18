# Backend — FastAPI + SQLAlchemy + PostgreSQL

See the root [README](../README.md) for full setup instructions.

## Running

```bash
uv sync
uv run uvicorn main:app --reload --port 8000
```

## Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app with all API routes |
| `db.py` | Database engine, session factory, `init_db()` |
| `models.py` | SQLAlchemy models (Category, Tag, Expense) |
| `schemas.py` | Pydantic request/response schemas |
| `crud.py` | CRUD operations + summary query |
| `.env` | `DATABASE_URL` (not committed) |
