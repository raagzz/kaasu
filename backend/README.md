# Backend — FastAPI + Uvicorn

Endpoints:
- `GET /` — greeting
- `GET /health` — health check
- `POST /items` — create an item (JSON body `{ "id": number, "name": string }`)


Using `uv` in the `backend/` folder:

```powershell
cd d:\Repositories\kaasu\backend

# (Optional) initialize a uv project (creates config files)
uv init

# Create a virtual environment managed by uv
uv venv

# Add dependencies into the project environment
uv add fastapi uvicorn[standard]

# Or sync using the existing requirements.txt
uv pip sync requirements.txt

# Run the dev server through uv (uv will prepare the env if needed)
uv run -- uvicorn main:app --reload --port 8000
```

Notes:
- `uv run` will create and reuse an isolated environment for the project and run the given command inside it.
- `uv add` installs packages into the project's environment and updates uv's lockfile.
