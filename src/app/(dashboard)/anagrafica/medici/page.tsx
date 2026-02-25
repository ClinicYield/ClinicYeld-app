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
        telefono: "", email: "", iban: "",
        modelloCompenso: "percentuale",
        percentuale: "", affittoFisso: "", percentualeMista: "", affittoMisto: "",
        note: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/anagrafica/medici", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Errore nel salvataggio");
            onSave();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-2xl rounded-2xl p-6 animate-fade-in overflow-y-auto max-h-[90vh]"
                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}>
                <h2 className="text-lg font-semibold text-white mb-5">Nuovo Medico</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Codice Fiscale *", key: "codiceFiscale" },
                            { label: "Partita IVA", key: "partitaIva" },
                            { label: "Nome *", key: "nome" },
                            { label: "Cognome *", key: "cognome" },
                            { label: "Telefono", key: "telefono" },
                            { label: "Email", key: "email", type: "email" },
                            { label: "IBAN", key: "iban", col: 2 },
                        ].map(({ label, key, type = "text", col }) => (
                            <div key={key} className={col === 2 ? "col-span-2" : ""}>
                                <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                                <input type={type} value={(form as any)[key]}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    required={label.endsWith("*")}
                                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>
                        ))}
                    </div>

                    {/* Modello compenso */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2">Modello Compenso *</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { val: "percentuale", label: "Percentuale", icon: Percent },
                                { val: "affitto_stanza", label: "Affitto Stanza", icon: Home },
                                { val: "misto", label: "Misto", icon: Layers },
                            ].map(({ val, label, icon: Icon }) => (
                                <button key={val} type="button"
                                    onClick={() => setForm(f => ({ ...f, modelloCompenso: val }))}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                                    style={{
                                        background: form.modelloCompenso === val ? "rgba(99,102,241,0.2)" : "rgba(15,17,23,0.5)",
                                        border: form.modelloCompenso === val ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(99,102,241,0.1)",
                                        color: form.modelloCompenso === val ? "#a5b4fc" : "#64748b"
                                    }}>
                                    <Icon className="w-4 h-4" />{label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parametri compenso */}
                    <div className="grid grid-cols-2 gap-4">
                        {form.modelloCompenso === "percentuale" && (
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-400 mb-1.5">Percentuale (%) *</label>
                                <input type="number" step="0.01" min="0" max="100"
                                    value={form.percentuale} onChange={e => setForm(f => ({ ...f, percentuale: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>
                        )}
                        {form.modelloCompenso === "affitto_stanza" && (
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-400 mb-1.5">Affitto Fisso Mensile (€) *</label>
                                <input type="number" step="0.01" min="0"
                                    value={form.affittoFisso} onChange={e => setForm(f => ({ ...f, affittoFisso: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>
                        )}
                        {form.modelloCompenso === "misto" && (
                            <>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Percentuale (%)</label>
                                    <input type="number" step="0.01" min="0" max="100"
                                        value={form.percentualeMista} onChange={e => setForm(f => ({ ...f, percentualeMista: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                        style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Affitto (€)</label>
                                    <input type="number" step="0.01" min="0"
                                        value={form.affittoMisto} onChange={e => setForm(f => ({ ...f, affittoMisto: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                        style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                                </div>
                            </>
                        )}
                    </div>

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
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            {loading ? "Salvataggio..." : "Salva Medico"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
