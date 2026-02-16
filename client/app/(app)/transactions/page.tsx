"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, CATEGORY_ICONS, MOOD_EMOJIS, CategoryType, MoodType } from "@/types";
import {
    Plus, Search, Filter, Trash2, Edit3, X, Check,
    ArrowUpRight, ArrowDownRight, Calendar, SlidersHorizontal
} from "lucide-react";

const categories: CategoryType[] = [
    "food", "housing", "transport", "entertainment", "shopping",
    "utilities", "health", "education", "savings", "other"
];

const moods: { value: MoodType; emoji: string; label: string }[] = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "sad", emoji: "😢", label: "Sad" },
    { value: "stressed", emoji: "😰", label: "Stressed" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "excited", emoji: "🎉", label: "Excited" },
    { value: "angry", emoji: "😡", label: "Angry" },
    { value: "anxious", emoji: "😟", label: "Anxious" },
];

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);

    const [form, setForm] = useState({
        description: "",
        amount: "",
        category: "food" as CategoryType,
        type: "expense" as "income" | "expense",
        mood: null as MoodType | null,
        date: new Date().toISOString().split("T")[0],
    });

    const fetchTransactions = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("transactions")
            .select("*")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });
        if (data) setTransactions(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleSubmit = async () => {
        if (!form.description || !form.amount) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            user_id: user.id,
            description: form.description,
            amount: parseFloat(form.amount),
            category: form.category,
            type: form.type,
            mood: form.mood,
            date: form.date,
        };

        if (editingId) {
            await supabase.from("transactions").update(payload).eq("id", editingId);
            setEditingId(null);
        } else {
            await supabase.from("transactions").insert(payload);
        }

        resetForm();
        fetchTransactions();
    };

    const deleteTransaction = async (id: string) => {
        const supabase = createClient();
        await supabase.from("transactions").delete().eq("id", id);
        fetchTransactions();
    };

    const editTransaction = (t: Transaction) => {
        setForm({
            description: t.description,
            amount: String(t.amount),
            category: t.category,
            type: t.type,
            mood: t.mood,
            date: t.date,
        });
        setEditingId(t.id);
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            description: "",
            amount: "",
            category: "food",
            type: "expense",
            mood: null,
            date: new Date().toISOString().split("T")[0],
        });
        setShowForm(false);
        setEditingId(null);
    };

    const filtered = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || t.category === filterCategory;
        const matchesType = filterType === "all" || t.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Transactions</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {transactions.length} transactions total
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Transaction
                </button>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400"
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="glass-card p-6 border-cyan-400/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                            {editingId ? "Edit Transaction" : "New Transaction"}
                        </h3>
                        <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/10">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Type Toggle */}
                        <div className="flex gap-2">
                            {(["expense", "income"] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setForm({ ...form, type })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${form.type === type
                                        ? type === "expense"
                                            ? "bg-red-400/10 border border-red-400/30 text-red-400"
                                            : "bg-green-400/10 border border-green-400/30 text-green-400"
                                        : "bg-white/5 border border-white/10 text-gray-400"
                                        }`}
                                >
                                    {type === "expense" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Description & Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Description (e.g., Groceries)"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                            />
                            <input
                                type="number"
                                placeholder="Amount ($)"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                            />
                        </div>

                        {/* Category & Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value as CategoryType })}
                                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                            />
                        </div>

                        {/* Mood Selector */}
                        <div>
                            <p className="text-xs text-gray-400 mb-2">How are you feeling? (optional)</p>
                            <div className="flex flex-wrap gap-2">
                                {moods.map(m => (
                                    <button
                                        key={m.value}
                                        onClick={() => setForm({ ...form, mood: form.mood === m.value ? null : m.value })}
                                        className={`mood-emoji flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${form.mood === m.value
                                            ? "selected bg-cyan-400/10 border border-cyan-400/30 text-white"
                                            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        <span>{m.emoji}</span>
                                        <span className="text-xs">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            <Check className="w-4 h-4" />
                            {editingId ? "Update Transaction" : "Add Transaction"}
                        </button>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="glass-card p-8 flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-gray-500 text-sm">
                        <span className="text-4xl mb-3">📝</span>
                        <p>No transactions found</p>
                        <p className="text-xs mt-1">
                            {transactions.length === 0
                                ? "Add your first transaction to get started!"
                                : "Try adjusting your search or filters"}
                        </p>
                    </div>
                ) : (
                    filtered.map(t => (
                        <div
                            key={t.id}
                            className="glass-card p-4 flex items-center gap-4 group hover:border-cyan-400/20 transition-all"
                        >
                            {/* Category Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.type === "income" ? "bg-green-400/10" : "bg-white/5"
                                }`}>
                                {t.type === "income" ? "💵" : CATEGORY_ICONS[t.category as CategoryType]}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white truncate">{t.description}</p>
                                    {t.mood && (
                                        <span className="text-sm" title={t.mood}>
                                            {MOOD_EMOJIS[t.mood]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-500 capitalize">{t.category}</span>
                                    <span className="text-xs text-gray-600">•</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(t.date).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="text-right">
                                <p className={`text-sm font-bold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                                    {t.type === "income" ? "+" : "-"}${Number(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => editTransaction(t)}
                                    className="p-1.5 rounded-lg hover:bg-cyan-400/10 transition-colors"
                                >
                                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                                </button>
                                <button
                                    onClick={() => deleteTransaction(t.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
