from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Kaasu Backend")

# Development CORS - allow the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Item(BaseModel):
    id: int
    name: str


@app.get("/")
async def root():
    return {"message": "Hello from backend"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/items")
async def create_item(item: Item):
    return {"item": item}
