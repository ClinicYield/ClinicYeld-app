"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    FileText, Plus, Search, Filter, Loader2, ChevronRight,
    CheckCircle2, Clock, AlertCircle, XCircle, Euro, CreditCard
} from "lucide-react";
import {
    formatCurrency, formatDate, STATI_FATTURA_LABELS, STATI_FATTURA_COLORS,
    METODI_PAGAMENTO_LABELS
} from "@/lib/utils";
import Link from "next/link";

interface Fattura {
    id: string;
    numeroFattura: string;
    tipo: string;
    dataEmissione: string;
    dataScadenza?: string;
    totale: string;
    totalePagato: string;
    stato: string;
    intestatarioTipo: string;
    paziente?: { nome: string; cognome: string };
    assicurazione?: { ragioneSociale: string };
    azienda?: { ragioneSociale: string };
    metodoPagamento?: string;
}

const STATO_ICONS: Record<string, any> = {
    pagata: CheckCircle2,
    emessa: Clock,
    insoluta: AlertCircle,
    annullata: XCircle,
};

export default function FatturazionePage() {
    const [fatture, setFatture] = useState<Fattura[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStato, setFiltroStato] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const t = setTimeout(fetchFatture, 300);
        return () => clearTimeout(t);
    }, [filtroStato]);

    const fetchFatture = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtroStato) params.set("stato", filtroStato);
        const res = await fetch(`/api/fatture?${params}`);
        const json = await res.json();
        setFatture(json.data ?? []);
        setLoading(false);
    };

    const getIntestatario = (f: Fattura) => {
        if (f.paziente) return `${f.paziente.cognome} ${f.paziente.nome}`;
        if (f.assicurazione) return f.assicurazione.ragioneSociale;
        if (f.azienda) return f.azienda.ragioneSociale;
        return "—";
    };

    const statiFiltri = [
        { val: "", label: "Tutte" },
        { val: "emessa", label: "Emesse" },
        { val: "pagata", label: "Pagate" },
        { val: "parzialmente_pagata", label: "Parz. Pagate" },
        { val: "insoluta", label: "Insolute" },
        { val: "scaduta", label: "Scadute" },
    ];

    const totaleSelezionato = fatture.reduce((acc, f) => acc + Number(f.totale), 0);
    const totalePagato = fatture.reduce((acc, f) => acc + Number(f.totalePagato), 0);

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Fatturazione" subtitle="Gestione fatture e ciclo attivo" />

            <div className="p-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Cerca fattura..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>
                    <Link href="/fatturazione/new"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-4 h-4" />
                        Nuova Fattura
                    </Link>
                </div>

                {/* Filtri stato */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {statiFiltri.map(s => (
                        <button key={s.val} onClick={() => setFiltroStato(s.val)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                            style={{
                                background: filtroStato === s.val ? "rgba(99,102,241,0.2)" : "rgba(26,29,46,1)",
                                border: filtroStato === s.val ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(99,102,241,0.1)",
                                color: filtroStato === s.val ? "#a5b4fc" : "#64748b",
                            }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Summary bar */}
                {!loading && fatture.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        {[
                            { label: "Fatture", value: fatture.length.toString(), icon: FileText, color: "#6366f1" },
                            { label: "Tot. Fatturato", value: formatCurrency(totaleSelezionato), icon: Euro, color: "#22c55e" },
                            { label: "Tot. Incassato", value: formatCurrency(totalePagato), icon: CheckCircle2, color: "#3b82f6" },
                            { label: "Residuo", value: formatCurrency(totaleSelezionato - totalePagato), icon: CreditCard, color: "#f59e0b" },
                        ].map(s => (
                            <div key={s.label} className="rounded-xl p-3 flex items-center gap-3"
                                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: `${s.color}20` }}>
                                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">{s.label}</p>
                                    <p className="text-sm font-bold text-white">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabella */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                        </div>
                    ) : fatture.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                            <FileText className="w-10 h-10 mb-3" />
                            <p className="text-sm">Nessuna fattura trovata</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                                    {["Numero", "Intestatario", "Data Emissione", "Scadenza", "Importo", "Pagato", "Stato", ""].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fatture.map((f, i) => {
                                    const residuo = Number(f.totale) - Number(f.totalePagato);
                                    return (
                                        <tr key={f.id} className="transition-colors hover:bg-white/5"
                                            style={{ borderBottom: i < fatture.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none" }}>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-indigo-300 font-semibold">{f.numeroFattura}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-white">{getIntestatario(f)}</p>
                                                <p className="text-xs text-slate-500">{f.intestatarioTipo}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">{formatDate(f.dataEmissione)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-400">{formatDate(f.dataScadenza)}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-white">{formatCurrency(Number(f.totale))}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-green-400">{formatCurrency(Number(f.totalePagato))}</span>
                                                {residuo > 0 && (
                                                    <p className="text-xs text-red-400">Res: {formatCurrency(residuo)}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATI_FATTURA_COLORS[f.stato] ?? ""}`}>
                                                    {STATI_FATTURA_LABELS[f.stato] ?? f.stato}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/fatturazione/${f.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors block">
                                                    <ChevronRight className="w-4 h-4 text-slate-500 hover:text-indigo-400" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
