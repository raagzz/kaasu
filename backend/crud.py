from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Category, Tag, Expense, expense_tags


# ── Categories ──────────────────────────────────────────────

def create_category(db: Session, name: str) -> Category:
    cat = Category(name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def list_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name).all()


def delete_category(db: Session, category_id: int) -> bool:
    cat = db.get(Category, category_id)
    if not cat:
        return False
    db.delete(cat)
    db.commit()
    return True


# ── Tags ────────────────────────────────────────────────────

def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(name=name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def list_tags(db: Session) -> list[Tag]:
    return db.query(Tag).order_by(Tag.name).all()


def delete_tag(db: Session, tag_id: int) -> bool:
    tag = db.get(Tag, tag_id)
    if not tag:
        return False
    db.delete(tag)
    db.commit()
    return True


# ── Expenses ────────────────────────────────────────────────

def add_expense(
    db: Session,
    amount: Decimal,
    category_id: int,
    tag_ids: Optional[list[int]] = None,
    description: str = "",
    expense_date: Optional[date] = None,
) -> Expense:
    exp = Expense(
        amount=amount,
        category_id=category_id,
        description=description,
        date=expense_date or date.today(),
    )
    if tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        exp.tags = tags
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def list_expenses(
    db: Session,
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> list[Expense]:
    q = db.query(Expense)
    if category_id:
        q = q.filter(Expense.category_id == category_id)
    if tag_id:
        q = q.join(expense_tags).filter(expense_tags.c.tag_id == tag_id)
    if date_from:
        q = q.filter(Expense.date >= date_from)
    if date_to:
        q = q.filter(Expense.date <= date_to)
    return q.order_by(Expense.date.desc(), Expense.id.desc()).all()


def update_expense(
    db: Session,
    expense_id: int,
    amount: Optional[Decimal] = None,
    description: Optional[str] = None,
    expense_date: Optional[date] = None,
    category_id: Optional[int] = None,
    tag_ids: Optional[list[int]] = None,
) -> Optional[Expense]:
    exp = db.get(Expense, expense_id)
    if not exp:
        return None
    if amount is not None:
        exp.amount = amount
    if description is not None:
        exp.description = description
    if expense_date is not None:
        exp.date = expense_date
    if category_id is not None:
        exp.category_id = category_id
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        exp.tags = tags
    db.commit()
    db.refresh(exp)
    return exp


def delete_expense(db: Session, expense_id: int) -> bool:
    exp = db.get(Expense, expense_id)
    if not exp:
        return False
    db.delete(exp)
    db.commit()
    return True


# ── Summary ─────────────────────────────────────────────────

def get_summary(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> list[dict]:
    q = (
        db.query(Category.name, func.sum(Expense.amount).label("total"))
        .join(Expense, Expense.category_id == Category.id)
    )
    if date_from:
        q = q.filter(Expense.date >= date_from)
    if date_to:
        q = q.filter(Expense.date <= date_to)
    rows = q.group_by(Category.name).order_by(func.sum(Expense.amount).desc()).all()
    return [{"category": row.name, "total": row.total} for row in rows]
