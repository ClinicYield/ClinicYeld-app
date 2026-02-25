"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Calendar, AlertCircle, Clock, CheckCircle2, Loader2, Bell } from "lucide-react";
import { formatCurrency, formatDate, getScadenzaUrgency } from "@/lib/utils";

interface Scadenza {
    id: string;
    numeroFattura: string;
    totale: string;
    totalePagato: string;
    stato: string;
    dataScadenza: string;
    paziente?: { nome: string; cognome: string };
    assicurazione?: { ragioneSociale: string };
    azienda?: { ragioneSociale: string };
}

const URGENCY_CONFIG = {
    rosso: { label: "Scaduta", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444", dot: "#ef4444" },
    arancio: { label: "Entro 15gg", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", text: "#f97316", dot: "#f97316" },
    giallo: { label: "Entro 30gg", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308", dot: "#eab308" },
    verde: { label: "In Scadenza", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e", dot: "#22c55e" },
    neutro: { label: "—", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)", text: "#64748b", dot: "#64748b" },
};

export default function ScadenzarioPage() {
    const [scadenze, setScadenze] = useState<Scadenza[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScadenze = async () => {
            setLoading(true);
            // Fatture emesse/parziali/insolute con scadenza
            const [r1, r2, r3] = await Promise.all([
                fetch("/api/fatture?stato=emessa"),
                fetch("/api/fatture?stato=parzialmente_pagata"),
                fetch("/api/fatture?stato=scaduta"),
            ]);
            const [j1, j2, j3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
            const all = [...(j1.data ?? []), ...(j2.data ?? []), ...(j3.data ?? [])]
                .filter(f => f.dataScadenza)
                .sort((a, b) => new Date(a.dataScadenza).getTime() - new Date(b.dataScadenza).getTime());
            setScadenze(all);
            setLoading(false);
        };
        fetchScadenze();
    }, []);

    const grouped = scadenze.reduce((acc, s) => {
        const u = getScadenzaUrgency(s.dataScadenza);
        if (!acc[u]) acc[u] = [];
        acc[u].push(s);
        return acc;
    }, {} as Record<string, Scadenza[]>);

    const urgencyOrder = ["rosso", "arancio", "giallo", "verde"] as const;

    const getIntestatario = (s: Scadenza) => {
        if (s.paziente) return `${s.paziente.cognome} ${s.paziente.nome}`;
        if (s.assicurazione) return s.assicurazione.ragioneSociale;
        if (s.azienda) return s.azienda.ragioneSociale;
        return "—";
    };

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Scadenzario" subtitle="Monitoraggio scadenze di pagamento" />

            <div className="p-6 animate-fade-in">
                {/* Riepilogo urgenze */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {urgencyOrder.map(u => {
                        const conf = URGENCY_CONFIG[u];
                        const count = grouped[u]?.length ?? 0;
                        const totale = grouped[u]?.reduce((acc, s) => acc + Number(s.totale) - Number(s.totalePagato), 0) ?? 0;
                        return (
                            <div key={u} className="rounded-2xl p-4"
                                style={{ background: conf.bg, border: `1px solid ${conf.border}` }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: conf.dot }} />
                                    <span className="text-xs font-medium" style={{ color: conf.text }}>{conf.label}</span>
                                </div>
                                <p className="text-xl font-bold text-white">{count}</p>
                                <p className="text-xs mt-0.5" style={{ color: conf.text }}>{formatCurrency(totale)}</p>
                            </div>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {urgencyOrder.map(u => {
                            const items = grouped[u];
                            if (!items?.length) return null;
                            const conf = URGENCY_CONFIG[u];
                            return (
                                <div key={u}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full" style={{ background: conf.dot }} />
                                        <h3 className="text-sm font-semibold" style={{ color: conf.text }}>{conf.label}</h3>
                                        <span className="text-xs text-slate-500">({items.length})</span>
                                    </div>
                                    <div className="space-y-2">
                                        {items.map(s => {
                                            const residuo = Number(s.totale) - Number(s.totalePagato);
                                            return (
                                                <div key={s.id} className="rounded-xl px-4 py-3 flex items-center gap-4"
                                                    style={{ background: "#1a1d2e", border: `1px solid ${conf.border}` }}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-semibold text-indigo-300">{s.numeroFattura}</span>
                                                        </div>
                                                        <p className="text-sm text-white mt-0.5">{getIntestatario(s)}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-xs text-slate-500">Scadenza</p>
                                                        <p className="text-sm font-medium" style={{ color: conf.text }}>{formatDate(s.dataScadenza)}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-xs text-slate-500">Da pagare</p>
                                                        <p className="text-sm font-bold text-white">{formatCurrency(residuo)}</p>
                                                    </div>
                                                    <button className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: conf.text }}>
                                                        <Bell className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {scadenze.length === 0 && (
                            <div className="rounded-2xl flex flex-col items-center justify-center h-48 text-slate-600"
                                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                <CheckCircle2 className="w-10 h-10 mb-3 text-green-600" />
                                <p className="text-sm">Nessuna scadenza imminente</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
