"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard, Users, UserCheck, Stethoscope, Building2,
    Shield, ClipboardList, FileText, Banknote, Calculator,
    Calendar, BarChart3, TrendingUp, Settings, LogOut, Activity,
    ChevronRight, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        group: "Principale",
        items: [
            { href: "/", icon: LayoutDashboard, label: "Dashboard" },
        ]
    },
    {
        group: "Anagrafica",
        items: [
            { href: "/anagrafica/pazienti", icon: Users, label: "Pazienti" },
            { href: "/anagrafica/medici", icon: UserCheck, label: "Medici" },
            { href: "/anagrafica/prestazioni", icon: Stethoscope, label: "Prestazioni" },
            { href: "/anagrafica/assicurazioni", icon: Shield, label: "Assicurazioni" },
            { href: "/anagrafica/aziende", icon: Building2, label: "Aziende Conv." },
        ]
    },
    {
        group: "Operativo",
        items: [
            { href: "/prestazioni-erogate", icon: ClipboardList, label: "Prestazioni Erogate" },
            { href: "/fatturazione", icon: FileText, label: "Fatturazione" },
            { href: "/incassi", icon: CreditCard, label: "Incassi" },
            { href: "/compensi", icon: Calculator, label: "Compensi Medici" },
            { href: "/scadenzario", icon: Calendar, label: "Scadenzario" },
        ]
    },
    {
        group: "Report",
        items: [
            { href: "/reports/economico", icon: BarChart3, label: "Report Economico" },
            { href: "/reports/medici", icon: TrendingUp, label: "Report Medici" },
            { href: "/reports/fatturato", icon: Activity, label: "Analisi Fatturato" },
        ]
    },
];

export function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
            style={{
                background: "linear-gradient(180deg, #0d0f1a 0%, #0f1117 100%)",
                borderRight: "1px solid rgba(99, 102, 241, 0.1)",
            }}>

            {/* Logo */}
            <div className="h-16 flex items-center px-6 gap-3 shrink-0"
                style={{ borderBottom: "1px solid rgba(99, 102, 241, 0.1)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                    <span className="text-white font-bold text-sm">ClinicYield</span>
                    <p className="text-xs" style={{ color: "#64748b" }}>v1.0</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((group) => (
                    <div key={group.group} className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2"
                            style={{ color: "#374151" }}>
                            {group.group}
                        </p>
                        {group.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                        active
                                            ? "text-white"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                    style={active ? {
                                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))",
                                        border: "1px solid rgba(99, 102, 241, 0.3)",
                                    } : {}}
                                >
                                    <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                                    <span className="flex-1">{item.label}</span>
                                    {active && <ChevronRight className="w-3 h-3 text-indigo-400" />}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(99, 102, 241, 0.1)" }}>
                <Link href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all mb-1">
                    <Settings className="w-4 h-4" />
                    <span>Impostazioni</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-4 h-4" />
                    <span>Esci</span>
                </button>
            </div>
        </aside>
    );
}
