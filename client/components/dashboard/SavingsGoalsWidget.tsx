"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SavingsGoal } from "@/types";
import { Plus, Target, Trash2 } from "lucide-react";

export default function SavingsGoalsWidget() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: "", target_amount: "", icon: "🎯", color: "#00d4ff" });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("savings_goals").select("*").order("created_at", { ascending: false });
        if (data) setGoals(data);
    };

    const addGoal = async () => {
        if (!newGoal.name || !newGoal.target_amount) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("savings_goals").insert({
            user_id: user.id,
            name: newGoal.name,
            target_amount: parseFloat(newGoal.target_amount),
            icon: newGoal.icon,
            color: newGoal.color,
        });

        setNewGoal({ name: "", target_amount: "", icon: "🎯", color: "#00d4ff" });
        setShowForm(false);
        fetchGoals();
    };

    const updateProgress = async (goalId: string, amount: number) => {
        const supabase = createClient();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newAmount = Math.max(0, goal.current_amount + amount);
        await supabase.from("savings_goals").update({ current_amount: Math.min(newAmount, goal.target_amount) }).eq("id", goalId);
        fetchGoals();
    };

    const deleteGoal = async (goalId: string) => {
        const supabase = createClient();
        await supabase.from("savings_goals").delete().eq("id", goalId);
        fetchGoals();
    };

    const goalIcons = ["🎯", "✈️", "🏠", "🚗", "💻", "📚", "🎮", "💍", "🏖️", "💰"];

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-purple-400 neon-purple-text">
                        Savings Goals
                    </h3>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Goal
                </button>
            </div>

            {/* Add Goal Form */}
            {showForm && (
                <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex gap-2">
                        {goalIcons.map(icon => (
                            <button
                                key={icon}
                                onClick={() => setNewGoal({ ...newGoal, icon })}
                                className={`text-xl p-1 rounded-lg transition-all ${newGoal.icon === icon ? "bg-cyan-400/20 scale-110" : "hover:bg-white/10"}`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Goal name (e.g., Vacation Fund)"
                        value={newGoal.name}
                        onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Target amount ($)"
                            value={newGoal.target_amount}
                            onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                        />
                        <button
                            onClick={addGoal}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm text-center">
                    <span className="text-4xl mb-3">🎯</span>
                    <p>No savings goals yet.</p>
                    <p className="text-xs mt-1">Create a goal to start tracking your progress!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map(goal => {
                        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                        const isComplete = progress >= 100;

                        return (
                            <div key={goal.id} className="relative p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-cyan-400/20 transition-all">
                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="absolute top-2 right-2 p-1 rounded-lg hover:bg-red-400/20 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{goal.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{goal.name}</p>
                                        <p className="text-xs text-gray-400">
                                            ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full rounded-full animate-progress transition-all"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            background: isComplete
                                                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                                                : `linear-gradient(90deg, ${goal.color}, #a855f7)`,
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium ${isComplete ? "text-green-400" : "text-gray-400"}`}>
                                        {isComplete ? "🎉 Complete!" : `${progress.toFixed(0)}%`}
                                    </span>
                                    {!isComplete && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => updateProgress(goal.id, 10)}
                                                className="px-2 py-0.5 rounded text-xs bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
                                            >
                                                +$10
                                            </button>
                                            <button
                                                onClick={() => updateProgress(goal.id, 50)}
                                                className="px-2 py-0.5 rounded text-xs bg-purple-400/10 text-purple-400 hover:bg-purple-400/20 transition-colors"
                                            >
                                                +$50
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
