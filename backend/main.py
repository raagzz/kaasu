import os
import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from db import get_db, init_db
import crud
from schemas import (
    CategoryCreate, CategoryOut,
    TagCreate, TagOut,
    ExpenseCreate, ExpenseUpdate, ExpenseOut,
    SummaryRow,
)

app = FastAPI(title="Kaasu Backend")

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health / Init ───────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/init-db")
def initialize_db():
    init_db()
    return {"status": "tables created"}


# ── Categories ──────────────────────────────────────────────

@app.post("/api/categories", response_model=CategoryOut)
def create_category(body: CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, body.name)


@app.get("/api/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return crud.list_categories(db)


@app.delete("/api/categories/{category_id}")
def remove_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(404, "Category not found")
    return {"status": "deleted"}


# ── Tags ────────────────────────────────────────────────────

@app.post("/api/tags", response_model=TagOut)
def create_tag(body: TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db, body.name)


@app.get("/api/tags", response_model=list[TagOut])
def get_tags(db: Session = Depends(get_db)):
    return crud.list_tags(db)


@app.delete("/api/tags/{tag_id}")
def remove_tag(tag_id: int, db: Session = Depends(get_db)):
    if not crud.delete_tag(db, tag_id):
        raise HTTPException(404, "Tag not found")
    return {"status": "deleted"}


# ── Expenses ────────────────────────────────────────────────

@app.post("/api/expenses", response_model=ExpenseOut)
def create_expense(body: ExpenseCreate, db: Session = Depends(get_db)):
    return crud.add_expense(
        db,
        amount=body.amount,
        category_id=body.category_id,
        tag_ids=body.tag_ids,
        description=body.description,
        expense_date=body.date,
    )


@app.get("/api/expenses", response_model=list[ExpenseOut])
def get_expenses(
    category_id: Optional[int] = Query(None),
    tag_id: Optional[int] = Query(None),
    date_from: Optional[datetime.date] = Query(None),
    date_to: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.list_expenses(db, category_id, tag_id, date_from, date_to)


@app.put("/api/expenses/{expense_id}", response_model=ExpenseOut)
def edit_expense(expense_id: int, body: ExpenseUpdate, db: Session = Depends(get_db)):
    exp = crud.update_expense(
        db,
        expense_id,
        amount=body.amount,
        description=body.description,
        expense_date=body.date,
        category_id=body.category_id,
        tag_ids=body.tag_ids,
    )
    if not exp:
        raise HTTPException(404, "Expense not found")
    return exp


@app.delete("/api/expenses/{expense_id}")
def remove_expense(expense_id: int, db: Session = Depends(get_db)):
    if not crud.delete_expense(db, expense_id):
        raise HTTPException(404, "Expense not found")
    return {"status": "deleted"}


# ── Summary ─────────────────────────────────────────────────

@app.get("/api/summary", response_model=list[SummaryRow])
def get_summary(
    date_from: Optional[datetime.date] = Query(None),
    date_to: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_summary(db, date_from, date_to)
