"use client";

import { useEffect, useState, useCallback } from "react";
import {
    getExpenses,
    getSummary,
    initDb,
    type SummaryRow,
    type Expense,
} from "@/lib/api";
import { getCategoryColor, formatINR } from "@/lib/colors";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

export default function SummaryPage() {
    const [rows, setRows] = useState<SummaryRow[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const load = useCallback(async () => {
        await initDb().catch(() => { });
        const [s, e] = await Promise.all([
            getSummary({
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            }),
            getExpenses({
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            }),
        ]);
        setRows(s);
        setExpenses(e);
    }, [dateFrom, dateTo]);

    useEffect(() => { load(); }, [load]);

    const total = rows.reduce((s, r) => s + Number(r.total), 0);

    // Pie chart data
    const pieData = rows.map((r) => ({
        name: r.category,
        value: Number(r.total),
    }));

    // Daily spend for bar chart
    const dailySpend = expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.date] = (acc[e.date] || 0) + Number(e.amount);
        return acc;
    }, {});
    const dailyData = Object.entries(dailySpend)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-14)
        .map(([date, total]) => ({
            date: date.slice(5), // MM-DD
            total,
        }));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-fade-in-up delay-1">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-gold" />
                    <h2 className="font-display text-lg font-bold tracking-tight">Summary</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                    Spending breakdown and trends
                </p>
                <div className="geo-line mt-4" />
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-3 animate-fade-in-up delay-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
                    Period
                </span>
                <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-40 bg-transparent border-border text-sm"
                />
                <span className="text-muted-foreground/40">—</span>
                <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-40 bg-transparent border-border text-sm"
                />
            </div>

            {/* Total */}
            <div className="border border-border bg-card p-6 animate-fade-in-up delay-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-saffron" />
                    <span className="text-[11px] tracking-[0.12em] uppercase font-medium">Total</span>
                </div>
                <p className="font-display text-4xl font-bold tracking-tight">
                    ₹{formatINR(total)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} expenses</p>
            </div>

            {/* Charts Row */}
            {rows.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Donut Chart */}
                    <div className="border border-border bg-card p-5 animate-fade-in-up delay-4">
                        <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted-foreground mb-4">
                            By Category
                        </h3>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, i) => (
                                            <Cell key={entry.name} fill={getCategoryColor(entry.name, i)} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`₹${formatINR(value)}`, "Amount"]}
                                        contentStyle={{
                                            backgroundColor: "#141416",
                                            border: "1px solid #222225",
                                            borderRadius: "0",
                                            color: "#faf7f2",
                                            fontSize: "12px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="space-y-2 mt-2">
                            {pieData.map((entry, i) => (
                                <div key={entry.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 inline-block"
                                            style={{ background: getCategoryColor(entry.name, i) }}
                                        />
                                        <span>{entry.name}</span>
                                    </div>
                                    <span className="tabular-nums font-medium">₹{formatINR(entry.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Spend Bar Chart */}
                    {dailyData.length > 0 && (
                        <div className="border border-border bg-card p-5 animate-fade-in-up delay-5">
                            <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted-foreground mb-4">
                                Daily Spend
                            </h3>
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222225" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10, fill: "#71717a" }}
                                            axisLine={{ stroke: "#222225" }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: "#71717a" }}
                                            axisLine={{ stroke: "#222225" }}
                                            tickLine={false}
                                            tickFormatter={(v) => `₹${v}`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [`₹${formatINR(value)}`, "Spent"]}
                                            contentStyle={{
                                                backgroundColor: "#141416",
                                                border: "1px solid #222225",
                                                borderRadius: "0",
                                                color: "#faf7f2",
                                                fontSize: "12px",
                                            }}
                                        />
                                        <Bar dataKey="total" fill="#ff6b35" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Breakdown Table */}
            <div className="border border-border bg-card divide-y divide-border/50 animate-fade-in-up delay-6">
                <div className="p-4">
                    <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted-foreground">
                        Detailed Breakdown
                    </h3>
                </div>
                {rows.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                        No expenses in this period.
                    </div>
                ) : (
                    <>
                        {rows.map((r, i) => {
                            const pct = total > 0 ? (Number(r.total) / total) * 100 : 0;
                            const color = getCategoryColor(r.category, i);
                            return (
                                <div key={r.category} className={`flex items-center gap-4 px-4 py-3 animate-fade-in delay-${Math.min(i + 1, 8)}`}>
                                    <span className="w-3 h-3" style={{ background: color }} />
                                    <span className="text-sm font-medium flex-1">{r.category}</span>
                                    <div className="w-32 h-1.5 bg-secondary overflow-hidden">
                                        <div
                                            className="h-full animate-bar-grow"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: color,
                                                animationDelay: `${0.4 + i * 0.1}s`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
                                        {pct.toFixed(0)}%
                                    </span>
                                    <span className="text-sm font-semibold w-28 text-right tabular-nums">
                                        ₹{formatINR(r.total)}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="flex items-center gap-4 px-4 py-3 bg-secondary/30">
                            <span className="w-3 h-3" />
                            <span className="text-sm font-bold flex-1">Total</span>
                            <div className="w-32" />
                            <span className="text-xs w-12" />
                            <span className="font-display text-base font-bold w-28 text-right tabular-nums">
                                ₹{formatINR(total)}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
