"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCategories,
  getTags,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  initDb,
  type Category,
  type Tag,
  type Expense,
} from "@/lib/api";
import { getCategoryColor, formatINR } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Pencil, Trash2, Check, X,
  IndianRupee, TrendingUp, Receipt,
  CheckSquare, Square, XCircle,
} from "lucide-react";

export default function ExpensesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Quick-add form
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [showExtra, setShowExtra] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTags, setEditTags] = useState<number[]>([]);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<"single" | "bulk">("single");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    await initDb().catch(() => { });
    const [cats, t, exps] = await Promise.all([
      getCategories(),
      getTags(),
      getExpenses({
        category_id: filterCategory ? Number(filterCategory) : undefined,
        tag_id: filterTag ? Number(filterTag) : undefined,
      }),
    ]);
    setCategories(cats);
    setTags(t);
    setExpenses(exps);
  }, [filterCategory, filterTag]);

  useEffect(() => { load(); }, [load]);

  // Computed stats
  const totalSpend = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const today = new Date().toISOString().split("T")[0];
  const todaySpend = expenses
    .filter((e) => e.date === today)
    .reduce((s, e) => s + Number(e.amount), 0);

  // Category breakdown
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category.name] = (acc[e.category.name] || 0) + Number(e.amount);
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Handlers
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    await createExpense({
      amount: Number(amount),
      category_id: Number(categoryId),
      tag_ids: selectedTags,
      description,
      date: date || undefined,
    });
    setAmount(""); setCategoryId(""); setSelectedTags([]); setDate(""); setDescription(""); setShowExtra(false);
    load();
  };

  const startEdit = (exp: Expense) => {
    setEditId(exp.id);
    setEditAmount(exp.amount);
    setEditCategoryId(String(exp.category.id));
    setEditDescription(exp.description);
    setEditDate(exp.date);
    setEditTags(exp.tags.map((t) => t.id));
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    await updateExpense(editId, {
      amount: Number(editAmount),
      category_id: Number(editCategoryId),
      tag_ids: editTags,
      description: editDescription,
      date: editDate,
    });
    setEditId(null);
    load();
  };

  // Delete single — opens confirm dialog
  const requestDeleteSingle = (id: number) => {
    setPendingDeleteId(id);
    setConfirmTarget("single");
    setConfirmOpen(true);
  };

  // Delete bulk — opens confirm dialog
  const requestDeleteBulk = () => {
    setConfirmTarget("bulk");
    setConfirmOpen(true);
  };

  // Confirmed delete
  const handleConfirmedDelete = async () => {
    if (confirmTarget === "single" && pendingDeleteId !== null) {
      await deleteExpense(pendingDeleteId);
      setPendingDeleteId(null);
    } else if (confirmTarget === "bulk") {
      await Promise.all([...selectedIds].map((id) => deleteExpense(id)));
      setSelectedIds(new Set());
      setSelectMode(false);
    }
    load();
  };

  const toggleTag = (id: number) =>
    setSelectedTags((p) => (p.includes(id) ? p.filter((t) => t !== id) : [...p, id]));
  const toggleEditTag = (id: number) =>
    setEditTags((p) => (p.includes(id) ? p.filter((t) => t !== id) : [...p, id]));

  // Multi-select helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(expenses.map((e) => e.id)));
  const clearSelection = () => { setSelectedIds(new Set()); setSelectMode(false); };

  const confirmCount = confirmTarget === "bulk" ? selectedIds.size : 1;

  return (
    <div className="space-y-6">

      {/* ── Stats Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card border border-border bg-card p-5 animate-fade-in-up delay-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-saffron" />
            <span className="text-[11px] tracking-[0.12em] uppercase font-medium">Total Spend</span>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight">₹{formatINR(totalSpend)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.length} expense{expenses.length !== 1 && "s"}</p>
        </div>

        <div className="stat-card border border-border bg-card p-5 animate-fade-in-up delay-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <IndianRupee className="h-3.5 w-3.5 text-teal" />
            <span className="text-[11px] tracking-[0.12em] uppercase font-medium">Today</span>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight">₹{formatINR(todaySpend)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.filter((e) => e.date === today).length} today</p>
        </div>

        <div className="stat-card border border-border bg-card p-5 animate-fade-in-up delay-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Receipt className="h-3.5 w-3.5 text-gold" />
            <span className="text-[11px] tracking-[0.12em] uppercase font-medium">Categories</span>
          </div>
          <p className="font-display text-2xl font-bold tracking-tight">{categories.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{Object.keys(categoryTotals).length} with expenses</p>
        </div>
      </div>

      {/* ── Quick Add ──────────────────────────────────── */}
      <form onSubmit={handleAdd} className="quick-add-bar border border-border bg-card p-4 animate-fade-in-up delay-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-saffron">
            <span className="font-display text-lg font-bold">₹</span>
          </div>
          <Input
            type="number" step="0.01" placeholder="0.00" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 bg-transparent border-border text-lg font-display font-semibold placeholder:text-muted-foreground/40 h-10"
            required
          />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-40 bg-transparent border-border h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 inline-block" style={{ background: getCategoryColor(c.name) }} />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="What did you spend on?" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 min-w-[140px] bg-transparent border-border h-10"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowExtra(!showExtra)} className="text-muted-foreground text-xs h-10">
            {showExtra ? "Less" : "More"}
          </Button>
          <Button type="submit" size="sm" className="bg-saffron text-black hover:bg-saffron/90 font-semibold px-5 h-10">
            <Plus className="h-4 w-4 mr-1" />Add
          </Button>
        </div>
        {showExtra && (
          <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-3 animate-fade-in">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40 bg-transparent border-border text-sm" />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                    className={`filter-pill text-xs px-3 py-1 border transition-all ${selectedTags.includes(t.id) ? "active" : "border-border text-muted-foreground"}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {/* ── Category Breakdown ─────────────────────────── */}
      {sortedCategories.length > 0 && (
        <div className="border border-border bg-card p-5 animate-fade-in-up delay-5">
          <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted-foreground mb-4">Breakdown</h3>
          <div className="space-y-3">
            {sortedCategories.map(([name, total], i) => {
              const pct = (total / totalSpend) * 100;
              const color = getCategoryColor(name);
              return (
                <div key={name} className={`animate-slide-left delay-${i + 1}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 inline-block" style={{ background: color }} />
                      <span className="text-sm text-foreground">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground tabular-nums">{pct.toFixed(0)}%</span>
                      <span className="text-sm font-semibold tabular-nums">₹{formatINR(total)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-secondary overflow-hidden">
                    <div className="h-full animate-bar-grow" style={{ width: `${pct}%`, backgroundColor: color, animationDelay: `${0.3 + i * 0.1}s` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 animate-fade-in-up delay-5">
        <span className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium mr-1">Filter</span>
        <button onClick={() => setFilterCategory(null)} className={`filter-pill text-xs px-3 py-1 border ${filterCategory === null ? "active" : "border-border text-muted-foreground"}`}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilterCategory(String(c.id))}
            className={`filter-pill text-xs px-3 py-1 border ${filterCategory === String(c.id) ? "active" : "border-border text-muted-foreground"}`}>
            <span className="inline-block w-1.5 h-1.5 mr-1.5" style={{ background: getCategoryColor(c.name) }} />
            {c.name}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={() => setFilterTag(null)} className={`filter-pill text-xs px-3 py-1 border ${filterTag === null ? "active" : "border-border text-muted-foreground"}`}>All tags</button>
        {tags.map((t) => (
          <button key={t.id} onClick={() => setFilterTag(String(t.id))}
            className={`filter-pill text-xs px-3 py-1 border ${filterTag === String(t.id) ? "active" : "border-border text-muted-foreground"}`}>
            {t.name}
          </button>
        ))}
      </div>

      {/* ── Expense Feed ───────────────────────────────── */}
      <div className="animate-fade-in-up delay-6">
        {/* Feed header with select toggle */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted-foreground">
            Expenses <span className="ml-2 text-foreground/60">{expenses.length}</span>
          </h3>
          <div className="flex items-center gap-2">
            {selectMode && selectedIds.size > 0 && (
              <>
                <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
                <Button size="sm" variant="ghost" onClick={selectAll} className="text-xs h-7 px-2 text-muted-foreground">
                  Select all
                </Button>
                <Button
                  size="sm"
                  onClick={requestDeleteBulk}
                  className="h-7 px-3 text-xs bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete {selectedIds.size}
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
              className={`h-7 px-2 text-xs ${selectMode ? "text-saffron" : "text-muted-foreground"}`}
            >
              {selectMode ? <XCircle className="h-3.5 w-3.5 mr-1" /> : <CheckSquare className="h-3.5 w-3.5 mr-1" />}
              {selectMode ? "Cancel" : "Select"}
            </Button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground text-sm">No expenses yet.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Use the form above to add your first expense.</p>
          </div>
        ) : (
          <div className="border border-border bg-card divide-y divide-border/50">
            {expenses.map((exp, i) => {
              const color = getCategoryColor(exp.category.name);
              const isSelected = selectedIds.has(exp.id);

              if (editId === exp.id) {
                return (
                  <div key={exp.id} className="flex items-center gap-3 p-3 bg-secondary/30">
                    <div className="cat-indicator self-stretch" style={{ background: color }} />
                    <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-24 h-8 text-xs bg-transparent border-border" />
                    <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                      <SelectTrigger className="w-32 h-8 text-xs bg-transparent border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="flex-1 h-8 text-xs bg-transparent border-border" placeholder="Description" />
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-36 h-8 text-xs bg-transparent border-border" />
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <button key={t.id} type="button" onClick={() => toggleEditTag(t.id)}
                          className={`text-[10px] px-2 py-0.5 border transition-all ${editTags.includes(t.id) ? "bg-saffron border-saffron text-black" : "border-border text-muted-foreground"}`}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-henna hover:text-henna" onClick={handleSaveEdit}><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={exp.id}
                  className={`expense-row flex items-center gap-3 px-3 py-3 animate-fade-in delay-${Math.min(i + 1, 8)} transition-colors ${isSelected ? "bg-saffron/5" : ""}`}
                  onClick={selectMode ? () => toggleSelect(exp.id) : undefined}
                  style={{ cursor: selectMode ? "pointer" : "default" }}
                >
                  {/* Checkbox or color indicator */}
                  {selectMode ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSelect(exp.id); }}
                      className="shrink-0 text-muted-foreground hover:text-saffron transition-colors"
                    >
                      {isSelected
                        ? <CheckSquare className="h-4 w-4 text-saffron" />
                        : <Square className="h-4 w-4" />
                      }
                    </button>
                  ) : (
                    <div className="cat-indicator self-stretch" style={{ background: color }} />
                  )}

                  <span className="font-display text-base font-semibold tabular-nums w-28 shrink-0">₹{formatINR(exp.amount)}</span>
                  <span className="text-xs font-medium px-2 py-0.5 shrink-0"
                    style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}>
                    {exp.category.name}
                  </span>
                  {exp.tags.map((t) => (
                    <Badge key={t.id} variant="outline" className="text-[10px] border-border text-muted-foreground">{t.name}</Badge>
                  ))}
                  <span className="text-sm text-muted-foreground flex-1 truncate">{exp.description}</span>
                  <span className="text-xs text-muted-foreground/60 tabular-nums w-24 text-right shrink-0">{exp.date}</span>

                  {/* Action buttons — only in non-select mode */}
                  {!selectMode && (
                    <div className="flex gap-0.5 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEdit(exp)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => requestDeleteSingle(exp.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Select-mode footer */}
        {selectMode && expenses.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <button onClick={selectAll} className="hover:text-foreground transition-colors">Select all {expenses.length}</button>
            {selectedIds.size > 0 && (
              <button onClick={clearSelection} className="hover:text-foreground transition-colors">Clear selection</button>
            )}
          </div>
        )}
      </div>

      {/* ── Confirm Delete Dialog ───────────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete {confirmCount} expense{confirmCount !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmTarget === "bulk"
                ? `This will permanently delete ${confirmCount} selected expense${confirmCount !== 1 ? "s" : ""}. This action cannot be undone.`
                : "This will permanently delete this expense. This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
