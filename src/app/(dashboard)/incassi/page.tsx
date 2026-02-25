"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    CreditCard, Plus, Loader2, Search, CheckCircle2,
    Banknote, Wifi, Building, Smartphone, Shuffle, AlertCircle
} from "lucide-react";
import { formatCurrency, formatDate, STATI_FATTURA_LABELS, STATI_FATTURA_COLORS } from "@/lib/utils";

interface Fattura {
    id: string;
    numeroFattura: string;
    totale: string;
    totalePagato: string;
    stato: string;
    dataEmissione: string;
    dataScadenza?: string;
    paziente?: { nome: string; cognome: string };
    assicurazione?: { ragioneSociale: string };
    azienda?: { ragioneSociale: string };
}

const METODO_ICONS: Record<string, any> = {
    contanti: Banknote,
    pos: CreditCard,
    bonifico: Building,
    online: Wifi,
    misto: Shuffle,
};

export default function IncassiPage() {
    const [fatture, setFatture] = useState<Fattura[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFattura, setSelectedFattura] = useState<Fattura | null>(null);
    const [showPagamentoModal, setShowPagamentoModal] = useState(false);

    const fetchFatture = async () => {
        setLoading(true);
        const res = await fetch("/api/fatture?stato=emessa");
        const json1 = await res.json();
        const res2 = await fetch("/api/fatture?stato=parzialmente_pagata");
        const json2 = await res2.json();
        const res3 = await fetch("/api/fatture?stato=insoluta");
        const json3 = await res3.json();
        setFatture([...(json1.data ?? []), ...(json2.data ?? []), ...(json3.data ?? [])]);
        setLoading(false);
    };

    useEffect(() => { fetchFatture(); }, []);

    const getIntestatario = (f: Fattura) => {
        if (f.paziente) return `${f.paziente.cognome} ${f.paziente.nome}`;
        if (f.assicurazione) return f.assicurazione.ragioneSociale;
        if (f.azienda) return f.azienda.ragioneSociale;
        return "—";
    };

    const totaleDaIncassare = fatture.reduce((acc, f) => acc + (Number(f.totale) - Number(f.totalePagato)), 0);

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Incassi" subtitle="Gestione pagamenti e incassi" />

            <div className="p-6 animate-fade-in">
                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Da Incassare", val: formatCurrency(totaleDaIncassare), color: "#f59e0b", icon: AlertCircle },
                        { label: "Fatture Aperte", val: fatture.filter(f => f.stato === "emessa").length, color: "#3b82f6", icon: CreditCard },
                        { label: "Parz. Pagate", val: fatture.filter(f => f.stato === "parzialmente_pagata").length, color: "#8b5cf6", icon: CheckCircle2 },
                        { label: "Insolute", val: fatture.filter(f => f.stato === "insoluta").length, color: "#ef4444", icon: AlertCircle },
                    ].map(k => (
                        <div key={k.label} className="rounded-2xl p-4 flex items-center gap-3"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${k.color}20` }}>
                                <k.icon className="w-4 h-4" style={{ color: k.color }} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{k.label}</p>
                                <p className="text-base font-bold text-white">{k.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lista fatture da pagare */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                        <h2 className="text-base font-semibold text-white">Fatture da Incassare</h2>
                        <span className="text-xs text-slate-500">{fatture.length} fatture</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
                    ) : fatture.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                            <CheckCircle2 className="w-10 h-10 mb-3 text-green-600" />
                            <p className="text-sm">Tutte le fatture sono state incassate! 🎉</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: "rgba(99,102,241,0.05)" }}>
                            {fatture.map(f => {
                                const residuo = Number(f.totale) - Number(f.totalePagato);
                                return (
                                    <div key={f.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs text-indigo-300 font-semibold">{f.numeroFattura}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-lg ${STATI_FATTURA_COLORS[f.stato] ?? ""}`}>
                                                    {STATI_FATTURA_LABELS[f.stato] ?? f.stato}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white font-medium">{getIntestatario(f)}</p>
                                            <p className="text-xs text-slate-500">Emessa: {formatDate(f.dataEmissione)}{f.dataScadenza ? ` · Scade: ${formatDate(f.dataScadenza)}` : ""}</p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-slate-500">Totale</p>
                                            <p className="text-sm font-semibold text-white">{formatCurrency(Number(f.totale))}</p>
                                            {Number(f.totalePagato) > 0 && (
                                                <p className="text-xs text-green-400">Pagato: {formatCurrency(Number(f.totalePagato))}</p>
                                            )}
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-slate-500">Da pagare</p>
                                            <p className="text-base font-bold text-yellow-400">{formatCurrency(residuo)}</p>
                                        </div>

                                        <button
                                            onClick={() => { setSelectedFattura(f); setShowPagamentoModal(true); }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white shrink-0 transition-all hover:opacity-90"
                                            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                                            <CreditCard className="w-3.5 h-3.5" />
                                            Registra
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {showPagamentoModal && selectedFattura && (
                    <PagamentoModal
                        fattura={selectedFattura}
                        onClose={() => { setShowPagamentoModal(false); setSelectedFattura(null); }}
                        onSave={() => { setShowPagamentoModal(false); setSelectedFattura(null); fetchFatture(); }}
                    />
                )}
            </div>
        </div>
    );
}

function PagamentoModal({ fattura, onClose, onSave }: {
    fattura: any; onClose: () => void; onSave: () => void;
}) {
    const residuo = Number(fattura.totale) - Number(fattura.totalePagato);
    const [form, setForm] = useState({
        importo: residuo.toString(),
        metodo: "contanti",
        dataPagamento: new Date().toISOString().split("T")[0],
        riferimento: "",
        note: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const metodi = [
        { val: "contanti", label: "Contanti", icon: Banknote },
        { val: "pos", label: "POS", icon: CreditCard },
        { val: "bonifico", label: "Bonifico", icon: Building },
        { val: "online", label: "Online", icon: Wifi },
        { val: "misto", label: "Misto", icon: Shuffle },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/incassi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, fatturaId: fattura.id }),
            });
            if (!res.ok) throw new Error("Errore nella registrazione");
            onSave();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in"
                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}>
                <h2 className="text-lg font-semibold text-white mb-2">Registra Pagamento</h2>
                <div className="flex items-center gap-2 mb-5">
                    <span className="font-mono text-xs text-indigo-300">{fattura.numeroFattura}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-sm text-slate-300">Residuo: <strong className="text-yellow-400">{formatCurrency(residuo)}</strong></span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Importo (€) *</label>
                        <input type="number" step="0.01" min="0.01" max={residuo}
                            value={form.importo} onChange={e => setForm(f => ({ ...f, importo: e.target.value }))}
                            required
                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-2">Metodo di Pagamento *</label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {metodi.map(m => (
                                <button key={m.val} type="button"
                                    onClick={() => setForm(f => ({ ...f, metodo: m.val }))}
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all"
                                    style={{
                                        background: form.metodo === m.val ? "rgba(99,102,241,0.2)" : "rgba(15,17,23,0.5)",
                                        border: form.metodo === m.val ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(99,102,241,0.1)",
                                        color: form.metodo === m.val ? "#a5b4fc" : "#64748b"
                                    }}>
                                    <m.icon className="w-4 h-4" />
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Data Pagamento *</label>
                        <input type="date" value={form.dataPagamento}
                            onChange={e => setForm(f => ({ ...f, dataPagamento: e.target.value }))}
                            required className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>

                    {["bonifico", "pos", "online"].includes(form.metodo) && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Riferimento / Transazione</label>
                            <input type="text" value={form.riferimento}
                                onChange={e => setForm(f => ({ ...f, riferimento: e.target.value }))}
                                placeholder="es. TR-20260225-001"
                                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                            Annulla
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 rounded-xl text-sm font-medium text-white"
                            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                            {loading ? "Registrazione..." : "Conferma Pagamento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
