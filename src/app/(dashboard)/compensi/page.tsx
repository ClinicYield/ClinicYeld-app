"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Calculator, RefreshCw, CheckCircle2, Clock, Banknote, Loader2,
    TrendingUp, Users
} from "lucide-react";
import { formatCurrency, MESI_ITALIANI } from "@/lib/utils";

interface Compenso {
    id: string;
    periodoMese: number;
    periodoAnno: number;
    fatturatoLordo: string;
    compensoCalcolato: string;
    prestazioniCount: number;
    modelloApplicato: string;
    stato: string;
    medico: {
        id: string;
        nome: string;
        cognome: string;
        modelloCompenso: string;
        percentuale?: string;
        specialita?: { nome: string; coloreHex: string };
    };
}

const MODELLO_LABELS: Record<string, string> = {
    percentuale: "% Fatturato",
    affitto_stanza: "Affitto Stanza",
    misto: "Modello Misto",
};

const STATO_COLORS: Record<string, string> = {
    bozza: "badge-grigio",
    confermato: "badge-blu",
    pagato: "badge-verde",
};

export default function CompensiPage() {
    const [compensi, setCompensi] = useState<Compenso[]>([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const now = new Date();
    const [anno, setAnno] = useState(now.getFullYear());
    const [mese, setMese] = useState(now.getMonth() + 1);

    const fetchCompensi = async () => {
        setLoading(true);
        const res = await fetch(`/api/compensi?anno=${anno}&mese=${mese}`);
        const json = await res.json();
        setCompensi(json.data ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchCompensi(); }, [anno, mese]);

    const handleCalcola = async () => {
        setCalculating(true);
        try {
            await fetch("/api/compensi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mese, anno }),
            });
            await fetchCompensi();
        } finally {
            setCalculating(false);
        }
    };

    const totaleCompensi = compensi.reduce((acc, c) => acc + Number(c.compensoCalcolato), 0);
    const totaleFatturato = compensi.reduce((acc, c) => acc + Number(c.fatturatoLordo), 0);
    const margineStruttura = totaleFatturato - totaleCompensi;

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Compensi Medici" subtitle="Calcolo automatico compensi per periodo" />

            <div className="p-6 animate-fade-in">
                {/* Selector periodo + azione */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <select value={mese} onChange={e => setMese(Number(e.target.value))}
                        className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}>
                        {MESI_ITALIANI.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select value={anno} onChange={e => setAnno(Number(e.target.value))}
                        className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}>
                        {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <div className="flex-1" />

                    <button onClick={handleCalcola} disabled={calculating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        {calculating
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Calcolo in corso...</>
                            : <><Calculator className="w-4 h-4" /> Calcola Compensi</>}
                    </button>
                </div>

                {/* KPI compensi periodo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Fatturato Periodo", value: formatCurrency(totaleFatturato), icon: TrendingUp, color: "#6366f1" },
                        { label: "Tot. Compensi Medici", value: formatCurrency(totaleCompensi), icon: Banknote, color: "#f59e0b" },
                        { label: "Margine Struttura", value: formatCurrency(margineStruttura), icon: Calculator, color: "#22c55e" },
                    ].map(k => (
                        <div key={k.label} className="rounded-2xl p-4 flex items-center gap-4"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.color}20` }}>
                                <k.icon className="w-5 h-5" style={{ color: k.color }} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{k.label}</p>
                                <p className="text-lg font-bold text-white">{k.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lista compensi */}
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                ) : compensi.length === 0 ? (
                    <div className="rounded-2xl flex flex-col items-center justify-center h-48 text-slate-600"
                        style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                        <Calculator className="w-10 h-10 mb-3" />
                        <p className="text-sm">Nessun compenso per il periodo selezionato</p>
                        <p className="text-xs mt-1">Clicca "Calcola Compensi" per generarli</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {compensi.map(c => {
                            const percentualeFatturato = totaleFatturato > 0
                                ? (Number(c.fatturatoLordo) / totaleFatturato) * 100
                                : 0;
                            return (
                                <div key={c.id} className="rounded-2xl p-5"
                                    style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Medico info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                                                style={{ background: `${c.medico.specialita?.coloreHex ?? "#6366f1"}30`, color: c.medico.specialita?.coloreHex ?? "#6366f1" }}>
                                                {c.medico.nome.charAt(0)}{c.medico.cognome.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-white">Dr. {c.medico.cognome} {c.medico.nome}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {c.medico.specialita && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                                            style={{ background: `${c.medico.specialita.coloreHex}20`, color: c.medico.specialita.coloreHex }}>
                                                            {c.medico.specialita.nome}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-500">{MODELLO_LABELS[c.modelloApplicato] ?? c.modelloApplicato}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dati compenso */}
                                        <div className="grid grid-cols-3 gap-6 text-right shrink-0">
                                            <div>
                                                <p className="text-xs text-slate-500">Prestazioni</p>
                                                <p className="text-base font-bold text-white">{c.prestazioniCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Fatturato</p>
                                                <p className="text-base font-bold text-white">{formatCurrency(Number(c.fatturatoLordo))}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Compenso</p>
                                                <p className="text-base font-bold text-yellow-400">{formatCurrency(Number(c.compensoCalcolato))}</p>
                                            </div>
                                        </div>

                                        {/* Stato */}
                                        <div className="shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${STATO_COLORS[c.stato] ?? ""}`}>
                                                {c.stato.charAt(0).toUpperCase() + c.stato.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar fatturato */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-500">Quota fatturato</span>
                                            <span className="text-xs text-slate-400">{percentualeFatturato.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)" }}>
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentualeFatturato}%`,
                                                    background: `linear-gradient(90deg, ${c.medico.specialita?.coloreHex ?? "#6366f1"}, #8b5cf6)`,
                                                }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
