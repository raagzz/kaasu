const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api<T = unknown>(
    path: string,
    opts: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...opts,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
    return res.json();
}

// ── Types ──────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Expense {
    id: number;
    amount: string;
    description: string;
    date: string;
    category: Category;
    tags: Tag[];
}

export interface SummaryRow {
    category: string;
    total: string;
}

// ── API functions ──────────────────────────────────────

export const initDb = () => api("/api/init-db", { method: "POST" });

// Categories
export const getCategories = () => api<Category[]>("/api/categories");
export const createCategory = (name: string) =>
    api<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
export const deleteCategory = (id: number) =>
    api(`/api/categories/${id}`, { method: "DELETE" });

// Tags
export const getTags = () => api<Tag[]>("/api/tags");
export const createTag = (name: string) =>
    api<Tag>("/api/tags", { method: "POST", body: JSON.stringify({ name }) });
export const deleteTag = (id: number) =>
    api(`/api/tags/${id}`, { method: "DELETE" });

// Expenses
export const getExpenses = (params?: {
    category_id?: number;
    tag_id?: number;
    date_from?: string;
    date_to?: string;
}) => {
    const qs = new URLSearchParams();
    if (params?.category_id) qs.set("category_id", String(params.category_id));
    if (params?.tag_id) qs.set("tag_id", String(params.tag_id));
    if (params?.date_from) qs.set("date_from", params.date_from);
    if (params?.date_to) qs.set("date_to", params.date_to);
    const q = qs.toString();
    return api<Expense[]>(`/api/expenses${q ? `?${q}` : ""}`);
};

export const createExpense = (data: {
    amount: number;
    category_id: number;
    tag_ids: number[];
    description: string;
    date?: string;
}) => api<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(data) });

export const updateExpense = (
    id: number,
    data: {
        amount?: number;
        category_id?: number;
        tag_ids?: number[];
        description?: string;
        date?: string;
    }
) => api<Expense>(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteExpense = (id: number) =>
    api(`/api/expenses/${id}`, { method: "DELETE" });

// Summary
export const getSummary = (params?: { date_from?: string; date_to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.date_from) qs.set("date_from", params.date_from);
    if (params?.date_to) qs.set("date_to", params.date_to);
    const q = qs.toString();
    return api<SummaryRow[]>(`/api/summary${q ? `?${q}` : ""}`);
};
