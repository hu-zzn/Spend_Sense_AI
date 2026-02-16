"use client";

import { Transaction, MOOD_EMOJIS, MOOD_COLORS, MoodType } from "@/types";
import { useMemo } from "react";
import {
    calculateMoodCorrelations,
    generateEmotionalInsights,
} from "@/lib/analytics/emotionalSpending";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";

interface Props {
    transactions: Transaction[];
}

export default function EmotionalSpendingChart({ transactions }: Props) {
    const correlations = useMemo(
        () => calculateMoodCorrelations(transactions),
        [transactions]
    );
    const insights = useMemo(
        () => generateEmotionalInsights(transactions),
        [transactions]
    );

    const maxSpent = Math.max(...correlations.map(c => c.totalSpent), 1);

    const insightIcon = (type: string) => {
        switch (type) {
            case "alert": return <AlertCircle className="w-4 h-4 text-red-400" />;
            case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            default: return <Info className="w-4 h-4 text-cyan-400" />;
        }
    };

    const insightBg = (type: string) => {
        switch (type) {
            case "alert": return "bg-red-400/5 border-red-400/20";
            case "warning": return "bg-yellow-400/5 border-yellow-400/20";
            default: return "bg-cyan-400/5 border-cyan-400/20";
        }
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold neon-purple-text text-purple-400 mb-4">
                Emotional Spending
            </h3>

            {correlations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm text-center">
                    <span className="text-4xl mb-3">🧠</span>
                    <p>No mood-tagged transactions yet.</p>
                    <p className="text-xs mt-1">Log your mood when adding transactions to see patterns!</p>
                </div>
            ) : (
                <>
                    {/* Mood bars */}
                    <div className="space-y-3 mb-5">
                        {correlations.slice(0, 5).map((cor) => (
                            <div key={cor.mood} className="flex items-center gap-3">
                                <span className="text-xl w-8 text-center">{cor.emoji}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-300 capitalize">{cor.mood}</span>
                                        <span className="text-gray-400">
                                            ${cor.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0 })} ({cor.percentOfTotal.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full animate-progress"
                                            style={{
                                                width: `${(cor.totalSpent / maxSpent) * 100}%`,
                                                backgroundColor: MOOD_COLORS[cor.mood],
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Insights */}
                    <div className="space-y-2">
                        {insights.slice(0, 2).map((insight, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border ${insightBg(insight.type)}`}
                            >
                                <span className="text-lg mt-0.5">{insight.icon}</span>
                                <div>
                                    <p className="text-xs font-semibold text-white">{insight.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
