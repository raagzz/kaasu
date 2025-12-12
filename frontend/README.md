# Frontend — Next.js (pnpm)


Quick start:

```powershell
cd frontend
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:3000` by default.

The example frontend queries the backend health endpoint at `/health`.
It uses `NEXT_PUBLIC_API_URL` to determine the backend base URL (defaults to `http://localhost:8000`).

