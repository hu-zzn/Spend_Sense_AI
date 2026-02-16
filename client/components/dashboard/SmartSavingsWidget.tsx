"use client";

import { Transaction } from "@/types";
import { useMemo } from "react";
import { generateSavingHacks } from "@/lib/analytics/smartSavings";
import { Sparkles, ChevronRight, TrendingDown } from "lucide-react";

interface Props {
    transactions: Transaction[];
}

export default function SmartSavingsWidget({ transactions }: Props) {
    const hacks = useMemo(() => generateSavingHacks(transactions), [transactions]);

    const totalPotential = hacks.reduce((sum, h) => sum + h.potentialSavings, 0);

    const priorityColors = {
        high: "border-red-400/30 bg-red-400/5",
        medium: "border-yellow-400/30 bg-yellow-400/5",
        low: "border-green-400/30 bg-green-400/5",
    };

    const priorityDots = {
        high: "bg-red-400",
        medium: "bg-yellow-400",
        low: "bg-green-400",
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-cyan-400 neon-text">
                        Smart Saving Hacks
                    </h3>
                </div>
                {totalPotential > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-400/10 border border-green-400/20">
                        <TrendingDown className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                            Save ${totalPotential.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo
                        </span>
                    </div>
                )}
            </div>

            {hacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm text-center">
                    <span className="text-4xl mb-3">💡</span>
                    <p>Add more transactions to get personalized saving tips!</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {hacks.slice(0, 4).map((hack) => (
                        <div
                            key={hack.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${priorityColors[hack.priority]}`}
                        >
                            <span className="text-xl mt-0.5">{hack.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {hack.title}
                                    </p>
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDots[hack.priority]}`} />
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                                    {hack.description}
                                </p>
                            </div>
                            {hack.potentialSavings > 0 && (
                                <span className="text-xs font-medium text-green-400 whitespace-nowrap">
                                    -${hack.potentialSavings.toFixed(0)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
