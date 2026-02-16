"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Budget, CATEGORY_ICONS, CategoryType } from "@/types";
import { calculateBudgetCompliance, calculate503020Rule } from "@/lib/analytics/smartSavings";
import { Wallet, Plus, X, Trash2, PieChart, AlertTriangle, CheckCircle2 } from "lucide-react";

const categories: CategoryType[] = [
    "food", "housing", "transport", "entertainment", "shopping",
    "utilities", "health", "education", "savings", "other"
];

export default function BudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: "food" as CategoryType, amount: "" });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const [budgetRes, txRes] = await Promise.all([
            supabase.from("budgets").select("*").eq("month", currentMonth).eq("year", currentYear),
            supabase.from("transactions").select("*").order("date", { ascending: false }),
        ]);
        if (budgetRes.data) setBudgets(budgetRes.data);
        if (txRes.data) setTransactions(txRes.data);
        setLoading(false);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addBudget = async () => {
        if (!newBudget.amount) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("budgets").upsert({
            user_id: user.id,
            category: newBudget.category,
            amount: parseFloat(newBudget.amount),
            month: currentMonth,
            year: currentYear,
        }, { onConflict: "user_id,category,month,year" });

        setNewBudget({ category: "food", amount: "" });
        setShowForm(false);
        fetchData();
    };

    const deleteBudget = async (id: string) => {
        const supabase = createClient();
        await supabase.from("budgets").delete().eq("id", id);
        fetchData();
    };

    const compliance = calculateBudgetCompliance(transactions, budgets, currentMonth, currentYear);
    const rule503020 = calculate503020Rule(transactions, currentMonth, currentYear);

    const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = compliance.reduce((sum, c) => sum + c.spent, 0);

    const statusColors = {
        safe: { bar: "from-green-400 to-emerald-500", text: "text-green-400", bg: "bg-green-400/10" },
        warning: { bar: "from-yellow-400 to-amber-500", text: "text-yellow-400", bg: "bg-yellow-400/10" },
        exceeded: { bar: "from-red-400 to-rose-500", text: "text-red-400", bg: "bg-red-400/10" },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Budget</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {now.toLocaleString("default", { month: "long", year: "numeric" })} Budget Management
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Set Budget
                </button>
            </div>

            {/* 50/30/20 Rule */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-purple-400">50/30/20 Rule</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Needs", data: rule503020.needs, target: 50, color: "from-blue-400 to-cyan-500", emoji: "🏠" },
                        { label: "Wants", data: rule503020.wants, target: 30, color: "from-purple-400 to-pink-500", emoji: "🎭" },
                        { label: "Savings", data: rule503020.savings, target: 20, color: "from-green-400 to-emerald-500", emoji: "💰" },
                    ].map(item => {
                        const isOver = item.data.percent > item.target + 5;
                        return (
                            <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{item.emoji}</span>
                                        <span className="text-sm font-semibold text-white">{item.label}</span>
                                    </div>
                                    <span className={`text-xs font-medium ${isOver ? "text-red-400" : "text-green-400"}`}>
                                        {item.data.percent.toFixed(0)}% / {item.target}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${item.color} animate-progress`}
                                        style={{ width: `${Math.min(item.data.percent, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">
                                    ${item.data.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })} spent
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Budgeted</p>
                    <p className="text-2xl font-bold text-cyan-400">
                        ${totalBudgeted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-400">
                        ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${totalBudgeted - totalSpent >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${Math.abs(totalBudgeted - totalSpent).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Add Budget Form */}
            {showForm && (
                <div className="glass-card p-6 border-cyan-400/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Set Category Budget</h3>
                        <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={newBudget.category}
                            onChange={e => setNewBudget({ ...newBudget, category: e.target.value as CategoryType })}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount ($)"
                            value={newBudget.amount}
                            onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                        />
                        <button
                            onClick={addBudget}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            {/* Category Budgets */}
            <div className="space-y-3">
                {compliance.length === 0 ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-gray-500 text-sm">
                        <Wallet className="w-10 h-10 text-gray-600 mb-3" />
                        <p>No budgets set for this month</p>
                        <p className="text-xs mt-1">Click &quot;Set Budget&quot; to create category budgets</p>
                    </div>
                ) : (
                    compliance.map(c => {
                        const colors = statusColors[c.status];
                        const budget = budgets.find(b => b.category === c.category);
                        return (
                            <div key={c.category} className="glass-card p-5 group hover:border-cyan-400/20 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">
                                            {CATEGORY_ICONS[c.category as CategoryType] || "📌"}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-white capitalize">{c.category}</p>
                                            <p className="text-xs text-gray-400">
                                                ${c.spent.toLocaleString()} / ${c.budgeted.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.bg}`}>
                                            {c.status === "exceeded" ? (
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                            ) : (
                                                <CheckCircle2 className={`w-3.5 h-3.5 ${colors.text}`} />
                                            )}
                                            <span className={`text-xs font-medium ${colors.text}`}>
                                                {c.percentUsed.toFixed(0)}%
                                            </span>
                                        </div>
                                        {budget && (
                                            <button
                                                onClick={() => deleteBudget(budget.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${colors.bar} animate-progress`}
                                        style={{ width: `${Math.min(c.percentUsed, 100)}%` }}
                                    />
                                </div>
                                {c.status === "exceeded" && (
                                    <p className="text-xs text-red-400 mt-2">
                                        ⚠️ Over budget by ${Math.abs(c.remaining).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
