"use client";

import { useEffect, useState, useCallback } from "react";
import { getTags, createTag, deleteTag, initDb, type Tag } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Tags as TagsIcon } from "lucide-react";

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [name, setName] = useState("");

    const load = useCallback(async () => {
        await initDb().catch(() => { });
        setTags(await getTags());
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await createTag(name.trim());
        setName("");
        load();
    };

    const handleDelete = async (id: number) => {
        await deleteTag(id);
        load();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-fade-in-up delay-1">
                <div className="flex items-center gap-2 mb-1">
                    <TagsIcon className="h-4 w-4 text-teal" />
                    <h2 className="font-display text-lg font-bold tracking-tight">Tags</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                    Label expenses with tags for cross-cutting views
                </p>
                <div className="geo-line mt-4" />
            </div>

            {/* Add */}
            <form
                onSubmit={handleAdd}
                className="border border-border bg-card p-4 flex items-center gap-3 animate-fade-in-up delay-2"
            >
                <Input
                    placeholder="New tag name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-transparent border-border h-10"
                    required
                />
                <Button
                    type="submit"
                    size="sm"
                    className="bg-teal text-black hover:bg-teal/90 font-semibold px-5 h-10"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </form>

            {/* List */}
            <div className="border border-border bg-card divide-y divide-border/50 animate-fade-in-up delay-3">
                {tags.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-muted-foreground">No tags yet.</p>
                    </div>
                ) : (
                    tags.map((t, i) => (
                        <div
                            key={t.id}
                            className={`expense-row flex items-center gap-3 px-4 py-3 animate-fade-in delay-${Math.min(i + 1, 8)}`}
                        >
                            <span className="text-xs px-2.5 py-0.5 border border-teal/30 bg-teal/10 text-teal font-medium">
                                {t.name}
                            </span>
                            <span className="flex-1" />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(t.id)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
