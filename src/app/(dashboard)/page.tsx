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
            <div className="rounded-xl p-3 text-sm"
                style={{ background: "#1a1d2e", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                <p className="text-slate-400 mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color }}>
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
            <div className="flex items-center justify-center h-full min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
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
            color: "#6366f1",
            bg: "rgba(99, 102, 241, 0.1)",
        },
        {
            label: `Incassi ${meseCorrente}`,
            value: formatCurrency(data?.incassiMese ?? 0),
            sub: "Pagamenti ricevuti",
            icon: CreditCard,
            color: "#22c55e",
            bg: "rgba(34, 197, 94, 0.1)",
        },
        {
            label: "Crediti Aperti",
            value: formatCurrency(data?.creditiAperti ?? 0),
            sub: "Da incassare",
            icon: FileText,
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.1)",
        },
        {
            label: "Insoluti",
            value: formatCurrency(data?.insoluti.totale ?? 0),
            sub: `${data?.insoluti.conteggio ?? 0} fatture`,
            icon: AlertTriangle,
            color: "#ef4444",
            bg: "rgba(239, 68, 68, 0.1)",
        },
        {
            label: "Scadenze (30gg)",
            value: `${data?.fattureInScadenza ?? 0}`,
            sub: "Fatture in scadenza",
            icon: Clock,
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.1)",
        },
        {
            label: "Pazienti",
            value: `${data?.totalePazienti ?? 0}`,
            sub: `${data?.totaleMedici ?? 0} medici attivi`,
            icon: Users,
            color: "#8b5cf6",
            bg: "rgba(139, 92, 246, 0.1)",
        },
    ];

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Dashboard" subtitle={`Panoramica — ${meseCorrente} ${new Date().getFullYear()}`} />

            <div className="p-6 space-y-6 animate-fade-in">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {kpiCards.map((card) => (
                        <div key={card.label}
                            className="rounded-2xl p-5 card-hover cursor-default"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-400">{card.label}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                                    <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                                </div>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: card.bg }}>
                                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                                </div>
                            </div>
                            {card.trend !== undefined && (
                                <div className="mt-3 flex items-center gap-1">
                                    {card.trend >= 0
                                        ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                        : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                                    <span className={`text-xs font-medium ${card.trend >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {card.trend >= 0 ? "+" : ""}{card.trend.toFixed(1)}% vs mese precedente
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Chart + Top Medici */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Grafico andamento */}
                    <div className="xl:col-span-2 rounded-2xl p-5"
                        style={{ background: "#1a1d2e", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-semibold text-white">Andamento Fatturato</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Ultimi 12 mesi</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorFatturato" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Fatturato" stroke="#6366f1" strokeWidth={2}
                                    fill="url(#colorFatturato)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Medici */}
                    <div className="rounded-2xl p-5"
                        style={{ background: "#1a1d2e", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                        <h2 className="text-base font-semibold text-white mb-4">Top Medici</h2>
                        <p className="text-xs text-slate-500 mb-4">{meseCorrente} per fatturato</p>
                        {data?.topMedici && data.topMedici.length > 0 ? (
                            <div className="space-y-3">
                                {data.topMedici.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{
                                                background: i === 0 ? "rgba(245, 158, 11, 0.2)" : "rgba(99, 102, 241, 0.1)",
                                                color: i === 0 ? "#f59e0b" : "#6366f1"
                                            }}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{m.nome}</p>
                                            <p className="text-xs text-slate-500">{m.prestazioni} prestazioni</p>
                                        </div>
                                        <span className="text-sm font-semibold text-indigo-400 shrink-0">
                                            {formatCurrency(Number(m.fatturato))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                                <UserCheck className="w-8 h-8 mb-2" />
                                <p className="text-sm">Nessun dato disponibile</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Azioni rapide */}
                <div className="rounded-2xl p-5"
                    style={{ background: "#1a1d2e", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                    <h2 className="text-base font-semibold text-white mb-4">Azioni Rapide</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Nuova Prestazione", href: "/prestazioni-erogate/new", color: "#6366f1" },
                            { label: "Emetti Fattura", href: "/fatturazione/new", color: "#22c55e" },
                            { label: "Registra Pagamento", href: "/incassi", color: "#3b82f6" },
                            { label: "Calcola Compensi", href: "/compensi", color: "#f59e0b" },
                        ].map((action) => (
                            <a key={action.label} href={action.href}
                                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                                style={{
                                    background: `${action.color}15`,
                                    border: `1px solid ${action.color}30`,
                                }}>
                                <span className="text-sm font-medium text-white">{action.label}</span>
                                <ArrowUpRight className="w-4 h-4" style={{ color: action.color }} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
