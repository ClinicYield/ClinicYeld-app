"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon,
    BarChart3, Calendar, Loader2, Download
} from "lucide-react";
import { formatCurrency, MESI_ITALIANI } from "@/lib/utils";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

export default function ReportEconomico() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const annoCorrente = new Date().getFullYear();

    useEffect(() => {
        // In a real app we'd fetch specific report data here
        // For now we use the dashboard API as base and mock some trends
        fetch("/api/dashboard")
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full min-h-screen"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>;

    const barData = data.andamentoMensile.map((m: any) => ({
        name: MESI_ITALIANI[m.mese - 1].substring(0, 3),
        Fatturato: Number(m.totale),
        Margine: Number(m.totale) * 0.45, // Mock data
    }));

    const pieData = [
        { name: "Prestazioni", value: data.fatturatoMese * 0.8, color: "#6366f1" },
        { name: "Commissioni", value: data.fatturatoMese * 0.15, color: "#8b5cf6" },
        { name: "Altro", value: data.fatturatoMese * 0.05, color: "#ec4899" },
    ];

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Analisi Economica" subtitle="Rendimento e margini operativi" />

            <div className="p-6 space-y-6 animate-fade-in">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">Consuntivo {annoCorrente}</h2>
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-lg border border-indigo-500/20">Aggiornato ad oggi</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <Download className="w-3.5 h-3.5" /> Esporta PDF
                    </button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Trends */}
                    <div className="rounded-2xl p-6" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-400" /> Andamento Fatturato vs Margine
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: "#0f1117", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px" }}
                                    itemStyle={{ fontSize: "12px" }}
                                />
                                <Bar dataKey="Fatturato" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="Margine" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Distribution */}
                    <div className="rounded-2xl p-6" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                            <PieIcon className="w-4 h-4 text-indigo-400" /> Distribuzione Ricavi per Canale
                        </h3>
                        <div className="flex items-center flex-col sm:flex-row gap-6">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-4 min-w-[150px]">
                                {pieData.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400">{p.name}</p>
                                            <p className="text-sm font-bold text-white">{formatCurrency(p.value)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "EBITDA Stimato", val: "42%", trend: "+2.4%", color: "#22c55e" },
                        { label: "Costo Medici / Ricavi", val: "55%", trend: "-1.2%", color: "#6366f1" },
                        { label: "Ticket Medio", val: "€142", trend: "+€12", color: "#8b5cf6" },
                        { label: "Break-even Point", val: "Giorno 18", trend: "-2gg", color: "#ec4899" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-5" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                            <div className="flex items-baseline justify-between">
                                <p className="text-2xl font-bold text-white">{s.val}</p>
                                <span className="text-xs font-medium" style={{ color: s.color }}>{s.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
