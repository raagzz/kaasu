# Kaasu — All your *finances* in one place.

This repository contains a minimal starter split into two folders:

- `backend/` — FastAPI backend served with Uvicorn
- `frontend/` — Next.js frontend (use `pnpm`)

## Quick start:

### Backend (using `uv` — recommended)
```powershell
cd backend
# create a uv-managed venv and install deps
uv venv
uv add fastapi uvicorn[standard]
# run the dev server inside uv's environment
uv run -- uvicorn main:app --reload --port 8000
```


### Frontend
```powershell
cd frontend
pnpm install
pnpm dev
```

Notes
- The backend listens on port `8000` and the frontend on `3000` by default.
