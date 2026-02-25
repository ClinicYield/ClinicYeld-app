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
        <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-white/80 border-b border-border backdrop-blur-xl">

            {/* Titolo */}
            <div>
                <h1 className="text-lg font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{subtitle}</p>}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cerca transazioni, pazienti..."
                        className="pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none w-48 transition-all focus:w-72 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                </div>

                {/* Notifiche */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-slate-100 border border-slate-200">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-1" />

                {/* User */}
                <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl transition-all hover:bg-slate-100 border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-linear-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-100">
                        {session?.user?.name?.charAt(0) ?? "U"}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-xs font-bold text-slate-900 leading-none">{session?.user?.name ?? "Utente"}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1 tracking-tight">{(session?.user as any)?.role ?? "—"}</p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                </button>
            </div>
        </header>
    );
}

