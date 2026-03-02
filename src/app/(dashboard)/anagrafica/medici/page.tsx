"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Search, Plus, UserCheck, Loader2, Percent, Home, Layers,
    Phone, Mail, ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Medico {
    id: string;
    nome: string;
    cognome: string;
    codiceFiscale: string;
    email?: string;
    telefono?: string;
    modelloCompenso: string;
    percentuale?: string;
    affittoFisso?: string;
    specialita?: { nome: string; coloreHex: string };
}

const MODELLO_ICONS: Record<string, any> = {
    percentuale: Percent,
    affitto_stanza: Home,
    misto: Layers,
};

const MODELLO_LABELS: Record<string, string> = {
    percentuale: "Percentuale",
    affitto_stanza: "Affitto Stanza",
    misto: "Misto",
};

export default function MediciPage() {
    const [medici, setMedici] = useState<Medico[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchMedici = async (q = "") => {
        setLoading(true);
        const res = await fetch(`/api/anagrafica/medici?search=${encodeURIComponent(q)}`);
        const json = await res.json();
        setMedici(json.data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        const t = setTimeout(() => fetchMedici(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Medici" subtitle="Anagrafica medici e compensi" />

            <div className="p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Cerca medico..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-4 h-4" />
                        Nuovo Medico
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {medici.map((m) => {
                            const Icon = MODELLO_ICONS[m.modelloCompenso] ?? Percent;
                            return (
                                <div key={m.id} className="rounded-2xl p-5 card-hover"
                                    style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-white"
                                                style={{ background: `${m.specialita?.coloreHex ?? "#6366f1"}30`, color: m.specialita?.coloreHex ?? "#6366f1" }}>
                                                {m.nome.charAt(0)}{m.cognome.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">Dr. {m.cognome} {m.nome}</p>
                                                {m.specialita && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                                        style={{ background: `${m.specialita.coloreHex}20`, color: m.specialita.coloreHex }}>
                                                        {m.specialita.nome}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modello compenso */}
                                    <div className="rounded-xl p-3 mb-4"
                                        style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-xs text-indigo-400 font-medium">{MODELLO_LABELS[m.modelloCompenso]}</span>
                                        </div>
                                        <p className="text-sm text-white font-semibold">
                                            {m.modelloCompenso === "percentuale" && m.percentuale
                                                ? `${m.percentuale}% sul fatturato`
                                                : m.modelloCompenso === "affitto_stanza" && m.affittoFisso
                                                    ? `${formatCurrency(Number(m.affittoFisso))} / mese`
                                                    : "Modello misto configurato"}
                                        </p>
                                    </div>

                                    {/* Contatti */}
                                    <div className="space-y-1.5">
                                        {m.telefono && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Phone className="w-3 h-3" />{m.telefono}
                                            </div>
                                        )}
                                        {m.email && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Mail className="w-3 h-3" />{m.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {showForm && (
                    <NuovoMedicoModal
                        onClose={() => setShowForm(false)}
                        onSave={() => { setShowForm(false); fetchMedici(search); }}
                    />
                )}
            </div>
        </div>
    );
}

function NuovoMedicoModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({
        codiceFiscale: "", partitaIva: "", nome: "", cognome: "",
        telefono: "", email: "", iban: "", specialitaId: "",
        modelloCompenso: "percentuale",
        percentuale: "", affittoFisso: "", percentualeMista: "", affittoMisto: "",
        note: ""
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
            const res = await fetch("/api/anagrafica/medici", {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-3xl h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-400" />
                            NUOVO MEDICO
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-inter">Inserisci i dati anagrafici e i parametri di compenso</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                        <Plus className="w-5 h-5 rotate-45" />
                    </button>
                </div>

                {/* Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    <form id="medico-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Sezione Anagrafica */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dati Anagrafici</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: "Codice Fiscale *", key: "codiceFiscale", placeholder: "ABCXYZ..." },
                                    { label: "Partita IVA", key: "partitaIva", placeholder: "01234567890" },
                                    { label: "Nome *", key: "nome", placeholder: "Es. Mario" },
                                    { label: "Cognome *", key: "cognome", placeholder: "Es. Rossi" },
                                    { label: "Telefono", key: "telefono", placeholder: "333..." },
                                    { label: "Email", key: "email", type: "email", placeholder: "mario.rossi@esempio.it" },
                                    { label: "IBAN", key: "iban", col: 2, placeholder: "IT00..." },
                                ].map(({ label, key, type = "text", col, placeholder }) => (
                                    <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                                        <input type={type} value={(form as any)[key]}
                                            placeholder={placeholder}
                                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            required={label.endsWith("*")}
                                            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none bg-slate-900/50 border border-white/10 focus:border-indigo-500/50 transition-all font-inter" />
                                    </div>
                                ))}
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Specializzazione</label>
                                    <select value={form.specialitaId} onChange={e => setForm(f => ({ ...f, specialitaId: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none bg-slate-900/50 border border-white/10 focus:border-indigo-500/50 transition-all font-inter">
                                        <option value="">Nessuna specializzazione</option>
                                        {specialta.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Sezione Compenso */}
                        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 font-inter"></span>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modello di Compenso</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                                {[
                                    { val: "percentuale", label: "Percentuale", icon: Percent, desc: "Sulla prestazione" },
                                    { val: "affitto_stanza", label: "Affitto Stanza", icon: Home, desc: "Quota fissa mensile" },
                                    { val: "misto", label: "Misto", icon: Layers, desc: "% + Fisso" },
                                ].map(({ val, label, icon: Icon, desc }) => (
                                    <button key={val} type="button"
                                        onClick={() => setForm(f => ({ ...f, modelloCompenso: val }))}
                                        className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all group"
                                        style={{
                                            background: form.modelloCompenso === val ? "#6366f1" : "rgba(15,17,23,0.5)",
                                            border: form.modelloCompenso === val ? "1px solid #6366f1" : "1px solid rgba(99,102,241,0.1)",
                                            boxShadow: form.modelloCompenso === val ? "0 10px 15px -3px rgba(99,102,241,0.3)" : "none"
                                        }}>
                                        <Icon className={`w-5 h-5 ${form.modelloCompenso === val ? "text-white" : "text-indigo-400 group-hover:text-indigo-300"}`} />
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${form.modelloCompenso === val ? "text-white" : "text-slate-300"}`}>{label}</span>
                                            <span className={`text-[10px] ${form.modelloCompenso === val ? "text-indigo-100" : "text-slate-500"}`}>{desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {form.modelloCompenso === "percentuale" && (
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Percentuale su Fatturato (%) *</label>
                                        <div className="relative">
                                            <input type="number" step="0.01" min="0" max="100"
                                                value={form.percentuale} onChange={e => setForm(f => ({ ...f, percentuale: e.target.value }))}
                                                className="w-full pl-4 pr-10 py-3 rounded-xl text-sm text-white outline-none bg-slate-900 border border-white/10 focus:border-indigo-500/50 transition-all font-mono" />
                                            <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        </div>
                                    </div>
                                )}
                                {form.modelloCompenso === "affitto_stanza" && (
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Affitto Fisso Mensile (€) *</label>
                                        <div className="relative">
                                            <input type="number" step="0.01" min="0"
                                                value={form.affittoFisso} onChange={e => setForm(f => ({ ...f, affittoFisso: e.target.value }))}
                                                className="w-full pl-4 pr-10 py-3 rounded-xl text-sm text-white outline-none bg-slate-900 border border-white/10 focus:border-indigo-500/50 transition-all font-mono" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">€</span>
                                        </div>
                                    </div>
                                )}
                                {form.modelloCompenso === "misto" && (
                                    <>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Percentuale (%)</label>
                                            <div className="relative">
                                                <input type="number" step="0.01" min="0" max="100"
                                                    value={form.percentualeMista} onChange={e => setForm(f => ({ ...f, percentualeMista: e.target.value }))}
                                                    className="w-full pl-3 pr-8 py-3 rounded-xl text-sm text-white outline-none bg-slate-900 border border-white/10 focus:border-indigo-500/50 transition-all font-mono" />
                                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Fisso (€)</label>
                                            <div className="relative">
                                                <input type="number" step="0.01" min="0"
                                                    value={form.affittoMisto} onChange={e => setForm(f => ({ ...f, affittoMisto: e.target.value }))}
                                                    className="w-full pl-3 pr-8 py-3 rounded-xl text-sm text-white outline-none bg-slate-900 border border-white/10 focus:border-indigo-500/50 transition-all font-mono" />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">€</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Note Interne</label>
                            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                rows={2} placeholder="Es. Disponibilità oraria, accordi particolari..."
                                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none bg-slate-900/50 border border-white/10 focus:border-indigo-500/50 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl text-sm text-red-400 flex items-center gap-3 bg-red-400/10 border border-red-400/20">
                                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-slate-900/40">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Annulla
                    </button>
                    <button type="submit" form="medico-form" disabled={loading}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        {loading ? "Salvataggio in corso..." : "CREA SCHEDA MEDICO"}
                    </button>
                </div>
            </div>
        </div>
    );
}
