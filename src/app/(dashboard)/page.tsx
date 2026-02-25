"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    TrendingUp, TrendingDown, Euro, AlertTriangle, Clock,
    Users, UserCheck, CreditCard, FileText, ArrowUpRight, Loader2
} from "lucide-react";
import { formatCurrency, MESI_ITALIANI } from "@/lib/utils";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";


interface DashboardData {
    fatturatoMese: number;
    fatturatoMesePrecedente: number;
    incassiMese: number;
    creditiAperti: number;
    insoluti: { totale: number; conteggio: number };
    fattureInScadenza: number;
    totalePazienti: number;
    totaleMedici: number;
    andamentoMensile: Array<{ mese: number; anno: number; totale: string; conteggio: number }>;
    topMedici: Array<{ nome: string; fatturato: string; prestazioni: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl p-3 text-sm bg-white border border-slate-200 shadow-xl shadow-indigo-100/30">
                <p className="text-slate-500 font-semibold mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="font-medium" style={{ color: p.color }}>
                        {p.name}: {p.name.includes("€") || p.name === "Fatturato" || p.name === "Incassi"
                            ? formatCurrency(p.value)
                            : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard")
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    const variazioneFatturato = data
        ? data.fatturatoMesePrecedente > 0
            ? ((data.fatturatoMese - data.fatturatoMesePrecedente) / data.fatturatoMesePrecedente) * 100
            : 0
        : 0;

    const meseCorrente = MESI_ITALIANI[new Date().getMonth()];

    const chartData = data?.andamentoMensile.map(m => ({
        name: `${MESI_ITALIANI[m.mese - 1].substring(0, 3)} ${m.anno !== new Date().getFullYear() ? m.anno : ""}`,
        Fatturato: Number(m.totale),
        Fatture: Number(m.conteggio),
    })) ?? [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen bg-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Caricamento dashboard...</p>
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            label: `Fatturato ${meseCorrente}`,
            value: formatCurrency(data?.fatturatoMese ?? 0),
            sub: `vs ${formatCurrency(data?.fatturatoMesePrecedente ?? 0)} mese prec.`,
            icon: Euro,
            trend: variazioneFatturato,
            color: "#4f46e5",
            bg: "#eef2ff",
        },
        {
            label: `Incassi ${meseCorrente}`,
            value: formatCurrency(data?.incassiMese ?? 0),
            sub: "Pagamenti ricevuti",
            icon: CreditCard,
            color: "#10b981",
            bg: "#f0fdf4",
        },
        {
            label: "Crediti Aperti",
            value: formatCurrency(data?.creditiAperti ?? 0),
            sub: "Da incassare",
            icon: FileText,
            color: "#3b82f6",
            bg: "#eff6ff",
        },
        {
            label: "Insoluti",
            value: formatCurrency(data?.insoluti.totale ?? 0),
            sub: `${data?.insoluti.conteggio ?? 0} fatture`,
            icon: AlertTriangle,
            color: "#ef4444",
            bg: "#fef2f2",
        },
        {
            label: "Scadenze (30gg)",
            value: `${data?.fattureInScadenza ?? 0}`,
            sub: "Fatture in scadenza",
            icon: Clock,
            color: "#f59e0b",
            bg: "#fffbeb",
        },
        {
            label: "Pazienti",
            value: `${data?.totalePazienti ?? 0}`,
            sub: `${data?.totaleMedici ?? 0} medici attivi`,
            icon: Users,
            color: "#8b5cf6",
            bg: "#f5f3ff",
        },
    ];

    return (
        <div className="flex flex-col min-h-full bg-slate-50">
            <Topbar title="Dashboard" subtitle={`Panoramica — ${meseCorrente} ${new Date().getFullYear()}`} />

            <div className="p-6 space-y-6 animate-fade-in">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {kpiCards.map((card) => (
                        <div key={card.label}
                            className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                                    <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                                </div>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: card.bg }}>
                                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                                </div>
                            </div>
                            {card.trend !== undefined && (
                                <div className="mt-4 flex items-center gap-1.5">
                                    <div className={cn(
                                        "flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase",
                                        card.trend >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                                    )}>
                                        {card.trend >= 0
                                            ? <TrendingUp className="w-3 h-3" />
                                            : <TrendingDown className="w-3 h-3" />}
                                        {card.trend >= 0 ? "+" : ""}{card.trend.toFixed(1)}%
                                    </div>
                                    <span className="text-xs text-slate-400">vs mese precedente</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Chart + Top Medici */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Grafico andamento */}
                    <div className="xl:col-span-2 rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Andamento Fatturato</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Ultimi 12 mesi</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorFatturato" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} dx={-10} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="Fatturato" stroke="#6366f1" strokeWidth={3}
                                    fill="url(#colorFatturato)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Medici */}
                    <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Top Medici</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{meseCorrente} per fatturato</p>
                            </div>
                        </div>
                        {data?.topMedici && data.topMedici.length > 0 ? (
                            <div className="space-y-4">
                                {data.topMedici.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{
                                                background: i === 0 ? "#fffbeb" : "#f1f5f9",
                                                color: i === 0 ? "#d97706" : "#475569"
                                            }}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-900 font-bold truncate">{m.nome}</p>
                                            <p className="text-xs text-slate-400">{m.prestazioni} prestazioni</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 shrink-0">
                                            {formatCurrency(Number(m.fatturato))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <UserCheck className="w-10 h-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Nessun dato disponibile</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Azioni rapide */}
                <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 mb-6">Azioni Rapide</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Nuova Prestazione", href: "/prestazioni-erogate/new", color: "#6366f1", bg: "#eef2ff" },
                            { label: "Emetti Fattura", href: "/fatturazione/new", color: "#10b981", bg: "#f0fdf4" },
                            { label: "Registra Pagamento", href: "/incassi", color: "#3b82f6", bg: "#eff6ff" },
                            { label: "Calcola Compensi", href: "/compensi", color: "#f59e0b", bg: "#fffbeb" },
                        ].map((action) => (
                            <a key={action.label} href={action.href}
                                className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
                                style={{
                                    background: action.bg,
                                    border: `1px solid ${action.color}20`,
                                }}>
                                <span className="text-sm font-bold" style={{ color: action.color }}>{action.label}</span>
                                <ArrowUpRight className="w-5 h-5" style={{ color: action.color }} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

