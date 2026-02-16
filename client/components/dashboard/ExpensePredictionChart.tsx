"use client";

import { Transaction } from "@/types";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from "chart.js";
import { predictMonthlySpending } from "@/lib/analytics/smartSavings";
import { TrendingUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface Props {
    transactions: Transaction[];
}

export default function ExpensePredictionChart({ transactions }: Props) {
    const chartData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get last 6 months of data
        const monthlyData: { label: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            let month = currentMonth - i;
            let year = currentYear;
            if (month < 0) {
                month += 12;
                year -= 1;
            }
            const monthName = new Date(year, month).toLocaleString("default", { month: "short" });
            const monthExpenses = transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === month && d.getFullYear() === year && t.type === "expense";
                })
                .reduce((sum, t) => sum + Number(t.amount), 0);

            monthlyData.push({ label: monthName, amount: monthExpenses });
        }

        // Predict next 2 months using simple moving average
        const amounts = monthlyData.map(d => d.amount).filter(a => a > 0);
        const avg = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

        const futureMonths = [];
        for (let i = 1; i <= 2; i++) {
            let month = currentMonth + i;
            let year = currentYear;
            if (month > 11) {
                month -= 12;
                year += 1;
            }
            const monthName = new Date(year, month).toLocaleString("default", { month: "short" });
            futureMonths.push({ label: monthName, amount: avg * (1 + (Math.random() * 0.1 - 0.05)) });
        }

        return {
            labels: [...monthlyData.map(d => d.label), ...futureMonths.map(d => d.label)],
            actual: [...monthlyData.map(d => d.amount), null, null],
            predicted: [
                ...Array(monthlyData.length - 1).fill(null),
                monthlyData[monthlyData.length - 1]?.amount || 0,
                ...futureMonths.map(d => Math.round(d.amount)),
            ],
        };
    }, [transactions]);

    const predicted = predictMonthlySpending(transactions);

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: "Current Spending",
                data: chartData.actual,
                borderColor: "#a855f7",
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                borderWidth: 2.5,
                pointBackgroundColor: "#a855f7",
                pointBorderColor: "#a855f7",
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true,
                spanGaps: false,
            },
            {
                label: "Predicted Spending",
                data: chartData.predicted,
                borderColor: "#00d4ff",
                backgroundColor: "rgba(0, 212, 255, 0.05)",
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: "#00d4ff",
                pointBorderColor: "#00d4ff",
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true,
                spanGaps: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "#9ca3af", font: { size: 11 } },
            },
            y: {
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: {
                    color: "#9ca3af",
                    font: { size: 11 },
                    callback: (v: any) => `$${v.toLocaleString()}`,
                },
            },
        },
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
                    label: (ctx: any) => {
                        const label = ctx.dataset.label || "";
                        return ` ${label}: $${ctx.parsed.y?.toLocaleString() || 0}`;
                    },
                },
            },
        },
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400 neon-text">
                    Expense Prediction
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-cyan-400 font-medium">
                        Est. ${predicted > 0 ? predicted.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"} this month
                    </span>
                </div>
            </div>

            <div className="h-56">
                <Line data={data} options={options} />
            </div>

            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-purple-500 rounded-full" />
                    <span className="text-xs text-gray-400">Current Spending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 border-t-2 border-dashed border-cyan-400" />
                    <span className="text-xs text-gray-400">Predicted Spending</span>
                </div>
            </div>
        </div>
    );
}
