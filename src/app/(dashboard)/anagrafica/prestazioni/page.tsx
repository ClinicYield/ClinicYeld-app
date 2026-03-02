"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Stethoscope, Plus, Loader2, Search, Filter,
    ChevronRight, Tag, Clock, Euro, Clipboard
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Prestazione {
    id: string;
    codice: string;
    nome: string;
    descrizione?: string;
    prezzoBase: string;
    ivaPercentuale: string;
    durataMinuti?: number;
    specialita?: { nome: string; coloreHex: string };
}

export default function PrestazioniAnagrafica() {
    const [data, setData] = useState<Prestazione[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchItems = async (q = "") => {
        setLoading(true);
        const res = await fetch(`/api/anagrafica/prestazioni?search=${encodeURIComponent(q)}`);
        const json = await res.json();
        setData(json.data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        const t = setTimeout(() => fetchItems(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Catalogo Prestazioni" subtitle="Gestione servizi e tariffe base" />

            <div className="p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Cerca nel catalogo..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-4 h-4" />
                        Nuova Prestazione
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                            {data.map((item) => (
                                <div key={item.id} className="rounded-2xl p-5 card-hover flex flex-col"
                                    style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                                style={{ background: `${item.specialita?.coloreHex ?? "#6366f1"}20`, color: item.specialita?.coloreHex ?? "#6366f1" }}>
                                                <Stethoscope className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white leading-tight">{item.nome}</p>
                                                <p className="text-[10px] text-slate-500 font-mono mt-1">COD: {item.codice}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        {item.descrizione && (
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{item.descrizione}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div className="flex items-center gap-2">
                                            <Euro className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-sm font-bold text-white">{formatCurrency(Number(item.prezzoBase))}</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-end">
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="text-xs text-slate-400">{item.durataMinuti ?? "--"} min</span>
                                        </div>
                                    </div>

                                    {item.specialita && (
                                        <div className="mt-3">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                style={{ background: `${item.specialita.coloreHex}15`, color: item.specialita.coloreHex }}>
                                                {item.specialita.nome}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {showForm && <NuovaPrestazioneModal
                            onClose={() => setShowForm(false)}
                            onSave={() => { setShowForm(false); fetchItems(search); }}
                        />}
                    </>
                )}
            </div>
        </div>
    );
}

function NuovaPrestazioneModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({
        codice: "", nome: "", descrizione: "",
        specialitaId: "", prezzoBase: "", ivaPercentuale: "0",
        durataMinuti: ""
    });
    const [specialta, setSpecialta] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/anagrafica/specialita")
            .then(r => r.json())
            .then(j => setSpecialta(j.data ?? []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/anagrafica/prestazioni", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    specialitaId: form.specialitaId || null,
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.[0]?.message || "Errore nel salvataggio");
            }
            onSave();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="flex min-h-full items-center justify-center" onClick={e => e.stopPropagation()}>
                <div className="w-full max-w-xl rounded-3xl p-6 sm:p-8 animate-fade-in"
                    style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Nuova Prestazione</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors">
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Nome Prestazione *</label>
                            <input type="text" value={form.nome}
                                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                required
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                                style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Codice *</label>
                                <input type="text" value={form.codice}
                                    onChange={e => setForm(f => ({ ...f, codice: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Specializzazione</label>
                                <select value={form.specialitaId} onChange={e => setForm(f => ({ ...f, specialitaId: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Nessuna</option>
                                    {specialta.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Prezzo Base (€) *</label>
                                <input type="number" step="0.01" value={form.prezzoBase}
                                    onChange={e => setForm(f => ({ ...f, prezzoBase: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Durata (minuti)</label>
                                <input type="number" value={form.durataMinuti}
                                    onChange={e => setForm(f => ({ ...f, durataMinuti: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Descrizione</label>
                            <textarea value={form.descrizione} onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
                                style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                                Annulla
                            </button>
                            <button type="submit" disabled={loading}
                                className="px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                {loading ? "Salvataggio..." : "Salva Prestazione"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
