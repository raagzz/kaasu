<div align="center">

# ₹ Kaasu

**A personal expense tracker, local-first.**


</div>

---


## Features

- **Expenses** — Add, edit, delete with amount, category, tags, date, description
- **Multi-select** — Select multiple expenses and bulk-delete with confirmation
- **Categories & Tags** — User-defined, color-coded
- **Filters** — Filter by category or tag
- **Summary** — Spending breakdown by category with charts and date range

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python · FastAPI · SQLAlchemy · PostgreSQL |
| Frontend | Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Recharts |
| Package managers | `uv` (Python) · `pnpm` (Node) |

## Prerequisites

| Tool | Install (macOS) | Purpose |
|---|---|---|
| **PostgreSQL 14+** | `brew install postgresql@14 && brew services start postgresql@14` | Database |
| **Python 3.11+** | `brew install python` | Backend runtime |
| **uv** | `curl -LsSf https://astral.sh/uv/install.sh \| sh` | Python package manager |
| **Node.js 18+** | `brew install node` | Frontend runtime |
| **pnpm** | `npm install -g pnpm` | Frontend package manager |

## Setup

### 1. Clone

```bash
git clone https://github.com/raagzz/kaasu.git
cd kaasu
```

### 2. PostgreSQL

```bash
# Start PostgreSQL (if not already running)
brew services start postgresql@14

# Create the database
createdb kaasu

# Find your Postgres username (usually your macOS username)
psql -c "SELECT current_user;"
```

### 3. Backend

```bash
cd backend

# Copy the env template and fill in your username
cp .env.example .env
# Edit .env: replace YOUR_USERNAME with the output from the psql command above

# Install dependencies
uv sync

# Start the server
uv run uvicorn main:app --reload --port 8000
```

The backend runs at **http://localhost:8000**.  
API docs are available at **http://localhost:8000/docs**.

On first request, the frontend automatically initializes the database tables. You can also trigger it manually:

```bash
curl -X POST http://localhost:8000/api/init-db
```

### 4. Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
pnpm install

# (Optional) copy env template — only needed if backend runs on a different port
cp .env.local.example .env.local

# Start the dev server
pnpm dev
```

The frontend runs at **http://localhost:3000**.

## Project Structure

```
kaasu/
├── backend/
│   ├── main.py          # FastAPI app & all API routes
│   ├── db.py            # Database engine & session factory
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database CRUD operations
│   ├── pyproject.toml   # Python dependencies (managed by uv)
│   ├── .env             # Your local config (not committed)
│   └── .env.example     # Template — copy to .env
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── page.tsx         # Expenses dashboard
│   │   │   ├── categories/      # Categories management
│   │   │   ├── tags/            # Tags management
│   │   │   └── summary/         # Spending summary & charts
│   │   ├── components/      # UI components
│   │   │   └── floating-nav.tsx # Top navigation bar
│   │   └── lib/
│   │       ├── api.ts       # Backend API client
│   │       └── colors.ts    # Category color palette
│   ├── .env.local           # Your local config (not committed)
│   └── .env.local.example   # Template — copy to .env.local
└── README.md
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://localhost/kaasu` | PostgreSQL connection string |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allowed origins |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/init-db` | Initialize database tables |
| `GET/POST` | `/api/categories` | List / create categories |
| `DELETE` | `/api/categories/{id}` | Delete a category |
| `GET/POST` | `/api/tags` | List / create tags |
| `DELETE` | `/api/tags/{id}` | Delete a tag |
| `GET/POST` | `/api/expenses` | List (with filters) / create expenses |
| `PUT` | `/api/expenses/{id}` | Update an expense |
| `DELETE` | `/api/expenses/{id}` | Delete an expense |
| `GET` | `/api/summary` | Spending summary by category |

Query params for `GET /api/expenses` and `GET /api/summary`: `category_id`, `tag_id`, `date_from`, `date_to`

## License

MIT
