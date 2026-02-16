"use client";

import { Transaction, CATEGORY_COLORS, CATEGORY_ICONS, CategoryType } from "@/types";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface QuickStatsProps {
    transactions: Transaction[];
}

export default function QuickStats({ transactions }: QuickStatsProps) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const totalIncome = thisMonthTx
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = thisMonthTx
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastMonthExpense = lastMonthTx
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const savings = totalIncome - totalExpense;
    const changePercent = lastMonthExpense > 0
        ? ((totalExpense - lastMonthExpense) / lastMonthExpense * 100)
        : 0;

    // Financial wellness score (simple heuristic)
    let wellnessScore = 75;
    if (totalIncome > 0) {
        const savingsRate = savings / totalIncome;
        if (savingsRate > 0.2) wellnessScore = 90;
        else if (savingsRate > 0.1) wellnessScore = 80;
        else if (savingsRate > 0) wellnessScore = 70;
        else wellnessScore = 50;
    }

    const stats = [
        {
            title: "Total Income",
            value: `$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "from-green-400 to-emerald-500",
            shadow: "shadow-green-500/20",
            textColor: "text-green-400",
        },
        {
            title: "Total Expenses",
            value: `$${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: "from-red-400 to-rose-500",
            shadow: "shadow-red-500/20",
            textColor: "text-red-400",
            subtitle: changePercent !== 0
                ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}% from last month`
                : undefined,
        },
        {
            title: "Net Savings",
            value: `$${Math.abs(savings).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: savings >= 0 ? "from-cyan-400 to-blue-500" : "from-orange-400 to-red-500",
            shadow: savings >= 0 ? "shadow-cyan-500/20" : "shadow-orange-500/20",
            textColor: savings >= 0 ? "text-cyan-400" : "text-orange-400",
            prefix: savings < 0 ? "-" : "",
        },
        {
            title: "Wellness Score",
            value: `${wellnessScore}/100`,
            icon: Activity,
            color: wellnessScore >= 80 ? "from-purple-400 to-violet-500" : "from-yellow-400 to-amber-500",
            shadow: "shadow-purple-500/20",
            textColor: "text-purple-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.title} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                {stat.title}
                            </span>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} flex items-center justify-center shadow-lg`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${stat.textColor}`}>
                            {stat.prefix || ""}{stat.value}
                        </p>
                        {stat.subtitle && (
                            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
