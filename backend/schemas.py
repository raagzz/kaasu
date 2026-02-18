import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


# ── Categories ──────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str

class CategoryOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


# ── Tags ────────────────────────────────────────────────────

class TagCreate(BaseModel):
    name: str

class TagOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


# ── Expenses ────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    amount: Decimal
    description: str = ""
    date: Optional[datetime.date] = None
    category_id: int
    tag_ids: list[int] = []

class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[datetime.date] = None
    category_id: Optional[int] = None
    tag_ids: Optional[list[int]] = None

class ExpenseOut(BaseModel):
    id: int
    amount: Decimal
    description: str
    date: datetime.date
    category: CategoryOut
    tags: list[TagOut]
    model_config = {"from_attributes": True}


# ── Summary ─────────────────────────────────────────────────

class SummaryRow(BaseModel):
    category: str
    total: Decimal
