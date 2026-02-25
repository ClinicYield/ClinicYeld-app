"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, ChevronDown, User } from "lucide-react";

interface TopbarProps {
    title: string;
    subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
    const { data: session } = useSession();

    return (
        <header className="h-16 flex items-center justify-between px-6 shrink-0"
            style={{
                background: "rgba(13, 15, 26, 0.8)",
                borderBottom: "1px solid rgba(99, 102, 241, 0.1)",
                backdropFilter: "blur(12px)",
            }}>

            {/* Titolo */}
            <div>
                <h1 className="text-lg font-semibold text-white">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Cerca..."
                        className="pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 rounded-xl outline-none w-48 transition-all focus:w-64"
                        style={{
                            background: "rgba(15, 17, 23, 0.8)",
                            border: "1px solid rgba(99, 102, 241, 0.2)",
                        }}
                    />
                </div>

                {/* Notifiche */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/5"
                    style={{ border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
                    style={{ border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        {session?.user?.name?.charAt(0) ?? "U"}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-xs font-medium text-white leading-none">{session?.user?.name ?? "Utente"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{(session?.user as any)?.role ?? "—"}</p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-500 hidden md:block" />
                </button>
            </div>
        </header>
    );
}
