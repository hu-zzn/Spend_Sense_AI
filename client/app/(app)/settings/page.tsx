"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Settings, User, DollarSign, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        currency: "USD",
        monthly_income: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
            setProfile(data);
            setForm({
                full_name: data.full_name || "",
                currency: data.currency || "USD",
                monthly_income: String(data.monthly_income || ""),
            });
        }
        setLoading(false);
    };

    const saveProfile = async () => {
        setSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("profiles").upsert({
            id: user.id,
            full_name: form.full_name,
            currency: form.currency,
            monthly_income: parseFloat(form.monthly_income) || 0,
            updated_at: new Date().toISOString(),
        });

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your profile and preferences</p>
            </div>

            {/* Profile Settings */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Profile</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                            placeholder="Your name"
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Currency</label>
                        <select
                            value={form.currency}
                            onChange={e => setForm({ ...form, currency: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="PKR">PKR (Rs)</option>
                            <option value="CAD">CAD ($)</option>
                            <option value="AUD">AUD ($)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Monthly Income</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={form.monthly_income}
                                onChange={e => setForm({ ...form, monthly_income: e.target.value })}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used for 50/30/20 rule calculations</p>
                    </div>

                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Saved!
                            </>
                        ) : saving ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* App Info */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">About</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                    <p><span className="text-gray-300 font-medium">SpendSense AI</span> — Smart Financial Wellness</p>
                    <p>Version 1.0.0</p>
                    <p className="text-xs leading-relaxed mt-3">
                        AI-powered financial wellness app with emotional spending detection,
                        smart saving recommendations, and budget management.
                    </p>
                </div>
            </div>
        </div>
    );
}
