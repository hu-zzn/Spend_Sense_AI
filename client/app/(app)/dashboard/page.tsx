"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction } from "@/types";
import SpendingCategoriesChart from "@/components/dashboard/SpendingCategoriesChart";
import ExpensePredictionChart from "@/components/dashboard/ExpensePredictionChart";
import EmotionalSpendingChart from "@/components/dashboard/EmotionalSpendingChart";
import SmartSavingsWidget from "@/components/dashboard/SmartSavingsWidget";
import QuickStats from "@/components/dashboard/QuickStats";
import SavingsGoalsWidget from "@/components/dashboard/SavingsGoalsWidget";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .order("date", { ascending: false });

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-gray-400 text-sm">Loading your financial data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Your financial wellness at a glance
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <QuickStats transactions={transactions} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Categories */}
                <SpendingCategoriesChart transactions={transactions} />

                {/* Expense Prediction */}
                <ExpensePredictionChart transactions={transactions} />

                {/* Emotional Spending */}
                <EmotionalSpendingChart transactions={transactions} />

                {/* Smart Savings */}
                <SmartSavingsWidget transactions={transactions} />
            </div>

            {/* Savings Goals */}
            <SavingsGoalsWidget />
        </div>
    );
}
