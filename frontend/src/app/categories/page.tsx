"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories, createCategory, deleteCategory, initDb, type Category } from "@/lib/api";
import { getCategoryColor } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FolderOpen } from "lucide-react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");

    const load = useCallback(async () => {
        await initDb().catch(() => { });
        setCategories(await getCategories());
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await createCategory(name.trim());
        setName("");
        load();
    };

    const handleDelete = async (id: number) => {
        await deleteCategory(id);
        load();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-fade-in-up delay-1">
                <div className="flex items-center gap-2 mb-1">
                    <FolderOpen className="h-4 w-4 text-saffron" />
                    <h2 className="font-display text-lg font-bold tracking-tight">Categories</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                    Organize your expenses into categories
                </p>
                <div className="geo-line mt-4" />
            </div>

            {/* Add */}
            <form
                onSubmit={handleAdd}
                className="border border-border bg-card p-4 flex items-center gap-3 animate-fade-in-up delay-2"
            >
                <Input
                    placeholder="New category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-transparent border-border h-10"
                    required
                />
                <Button
                    type="submit"
                    size="sm"
                    className="bg-saffron text-black hover:bg-saffron/90 font-semibold px-5 h-10"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </form>

            {/* List */}
            <div className="border border-border bg-card divide-y divide-border/50 animate-fade-in-up delay-3">
                {categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-muted-foreground">No categories yet.</p>
                    </div>
                ) : (
                    categories.map((c, i) => {
                        const color = getCategoryColor(c.name, i);
                        return (
                            <div
                                key={c.id}
                                className={`expense-row flex items-center gap-3 px-4 py-3 animate-fade-in delay-${Math.min(i + 1, 8)}`}
                            >
                                <span className="w-3 h-3" style={{ background: color }} />
                                <span className="text-sm font-medium flex-1">{c.name}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(c.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
