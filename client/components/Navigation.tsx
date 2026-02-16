"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    Settings,
    LogOut,
    User,
    Brain,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/budget", label: "Budget", icon: Wallet },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email ?? null);
        });
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return (
        <nav className="sticky top-0 z-50">
            <div className="top-gradient-line" />
            <div className="glass-card rounded-none border-x-0 border-t-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text hidden sm:block">
                                SpendSense AI
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? "text-cyan-400 bg-cyan-400/10 shadow-sm shadow-cyan-400/10"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-2xl">
                                        {userEmail && (
                                            <div className="px-3 py-2 text-xs text-gray-400 border-b border-white/10 mb-1 truncate">
                                                {userEmail}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 rounded-lg hover:bg-white/10"
                            >
                                {showMobileMenu ? (
                                    <X className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? "text-cyan-400 bg-cyan-400/10"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
}
