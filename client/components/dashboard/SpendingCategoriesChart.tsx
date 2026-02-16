"use client";

import { Transaction, CATEGORY_COLORS, CATEGORY_ICONS, CategoryType } from "@/types";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    transactions: Transaction[];
}

export default function SpendingCategoriesChart({ transactions }: Props) {
    const categoryData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === "expense");
        const totals: Record<string, number> = {};

        expenses.forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
        });

        const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
        const totalSpent = sorted.reduce((sum, [, val]) => sum + val, 0);

        return {
            labels: sorted.map(([cat]) => `${CATEGORY_ICONS[cat as CategoryType]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`),
            amounts: sorted.map(([, val]) => val),
            percentages: sorted.map(([, val]) => totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(0) : "0"),
            colors: sorted.map(([cat]) => CATEGORY_COLORS[cat as CategoryType] || "#6b7280"),
            totalSpent,
            categories: sorted.map(([cat]) => cat),
        };
    }, [transactions]);

    const chartData = {
        labels: categoryData.labels,
        datasets: [
            {
                data: categoryData.amounts,
                backgroundColor: categoryData.colors.map(c => c + "cc"),
                borderColor: categoryData.colors,
                borderWidth: 2,
                hoverBorderWidth: 3,
                cutout: "65%",
                spacing: 3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                titleColor: "#00d4ff",
                bodyColor: "#e5e7eb",
                borderColor: "rgba(0, 212, 255, 0.3)",
                borderWidth: 1,
                cornerRadius: 12,
                padding: 12,
                callbacks: {
                    label: (ctx: any) => ` $${ctx.parsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                },
            },
        },
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-cyan-400 neon-text mb-4">
                Spending Categories
            </h3>

            {categoryData.amounts.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                    No spending data yet. Add some transactions!
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <Doughnut data={chartData} options={chartOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-400">Total</span>
                            <span className="text-lg font-bold text-white">
                                ${categoryData.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                        {categoryData.categories.slice(0, 6).map((cat, i) => (
                            <div key={cat} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: categoryData.colors[i] }}
                                    />
                                    <span className="text-gray-300">
                                        {CATEGORY_ICONS[cat as CategoryType]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">{categoryData.percentages[i]}%</span>
                                    <span className="text-white font-medium">
                                        ${categoryData.amounts[i].toLocaleString("en-US", { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
