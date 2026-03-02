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
    const [specialta, setSpecialta] = useState<any[]>([]);

    // Form state
    const [form, setForm] = useState({
        codiceFiscale: "", partitaIva: "", nome: "", cognome: "",
        telefono: "", email: "", iban: "", specialitaId: "",
        modelloCompenso: "percentuale",
        percentuale: "", affittoFisso: "", percentualeMista: "", affittoMisto: "",
        note: ""
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchMedici = async (q = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/anagrafica/medici?search=${encodeURIComponent(q)}`);
            const json = await res.json();
            setMedici(json.data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => fetchMedici(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (showForm) {
            fetch("/api/anagrafica/specialita")
                .then(r => r.json())
                .then(j => setSpecialta(j.data ?? []));
        }
    }, [showForm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
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
            setShowForm(false);
            fetchMedici(search);
            // Reset form
            setForm({
                codiceFiscale: "", partitaIva: "", nome: "", cognome: "",
                telefono: "", email: "", iban: "", specialitaId: "",
                modelloCompenso: "percentuale",
                percentuale: "", affittoFisso: "", percentualeMista: "", affittoMisto: "",
                note: ""
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (showForm) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 font-inter">
                <Topbar title="Nuovo Medico" subtitle="Configurazione anagrafica e contratto" />

                <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in">
                    <button
                        onClick={() => setShowForm(false)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-8 group"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        TORNA ALL'ELENCO
                    </button>

                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Scheda Professionista</h2>
                            <p className="text-slate-500 text-sm mt-1">Inserisci tutti i dati richiesti per abilitare il medico alle prestazioni.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-12">

                            {/* Anagrafica */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <UserCheck className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Dati Personali</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {[
                                        { label: "Codice Fiscale *", key: "codiceFiscale", placeholder: "ABCXYZ..." },
                                        { label: "Partita IVA", key: "partitaIva", placeholder: "01234567890" },
                                        { label: "Nome *", key: "nome", placeholder: "Mario" },
                                        { label: "Cognome *", key: "cognome", placeholder: "Rossi" },
                                        { label: "Telefono", key: "telefono", placeholder: "333 1234567" },
                                        { label: "Email", key: "email", type: "email", placeholder: "mario.rossi@esempio.it" },
                                        { label: "IBAN", key: "iban", col: 2, placeholder: "IT00..." },
                                    ].map(({ label, key, type = "text", col, placeholder }) => (
                                        <div key={key} className={col === 2 ? "md:col-span-2" : ""}>
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">{label}</label>
                                            <input type={type} value={(form as any)[key]}
                                                placeholder={placeholder}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                required={label.endsWith("*")}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300" />
                                        </div>
                                    ))}
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">Specializzazione</label>
                                        <select value={form.specialitaId} onChange={e => setForm(f => ({ ...f, specialitaId: e.target.value }))}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium">
                                            <option value="">Seleziona specialità...</option>
                                            {specialta.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Compenso */}
                            <div className="pt-10 border-t border-slate-100 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <Percent className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Modello Economico</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { val: "percentuale", label: "Percentuale", icon: Percent, desc: "Su fatturato" },
                                        { val: "affitto_stanza", label: "Affitto Stanza", icon: Home, desc: "Quota fissa" },
                                        { val: "misto", label: "Misto", icon: Layers, desc: "% + Fisso" },
                                    ].map(({ val, label, icon: Icon, desc }) => (
                                        <button key={val} type="button"
                                            onClick={() => setForm(f => ({ ...f, modelloCompenso: val }))}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] text-center transition-all border-2 ${form.modelloCompenso === val
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.03]"
                                                : "bg-white border-slate-100 text-slate-900 hover:border-indigo-200"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${form.modelloCompenso === val ? "text-white" : "text-indigo-600"}`} />
                                            <div>
                                                <span className="block text-sm font-black uppercase tracking-tight">{label}</span>
                                                <span className={`text-[10px] font-bold uppercase ${form.modelloCompenso === val ? "text-indigo-100" : "text-slate-400"}`}>{desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-200/50">
                                    {form.modelloCompenso === "percentuale" && (
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">QUOTA PERCENTUALE (%) *</label>
                                            <div className="relative">
                                                <input type="number" step="0.01" min="0" max="100"
                                                    value={form.percentuale} onChange={e => setForm(f => ({ ...f, percentuale: e.target.value }))}
                                                    className="w-full pl-6 pr-12 py-5 rounded-2xl text-2xl font-black text-slate-900 outline-none bg-white border border-slate-200 focus:border-indigo-500 transition-all font-mono" />
                                                <Percent className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                                            </div>
                                        </div>
                                    )}
                                    {form.modelloCompenso === "affitto_stanza" && (
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">AFFITTO MENSILE (€) *</label>
                                            <div className="relative">
                                                <input type="number" step="0.01" min="0"
                                                    value={form.affittoFisso} onChange={e => setForm(f => ({ ...f, affittoFisso: e.target.value }))}
                                                    className="w-full pl-6 pr-12 py-5 rounded-2xl text-2xl font-black text-slate-900 outline-none bg-white border border-slate-200 focus:border-indigo-500 transition-all font-mono" />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-indigo-600">€</span>
                                            </div>
                                        </div>
                                    )}
                                    {form.modelloCompenso === "misto" && (
                                        <>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">PERC. (%)</label>
                                                <div className="relative">
                                                    <input type="number" step="0.01" min="0" max="100"
                                                        value={form.percentualeMista} onChange={e => setForm(f => ({ ...f, percentualeMista: e.target.value }))}
                                                        className="w-full pl-5 pr-10 py-5 rounded-2xl text-xl font-black text-slate-900 outline-none bg-white border border-slate-200 focus:border-indigo-500 transition-all font-mono" />
                                                    <Percent className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">FISSO (€)</label>
                                                <div className="relative">
                                                    <input type="number" step="0.01" min="0"
                                                        value={form.affittoMisto} onChange={e => setForm(f => ({ ...f, affittoMisto: e.target.value }))}
                                                        className="w-full pl-5 pr-10 py-5 rounded-2xl text-xl font-black text-slate-900 outline-none bg-white border border-slate-200 focus:border-indigo-500 transition-all font-mono" />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-indigo-600">€</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="pt-10 border-t border-slate-100 space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-sm">Note ed Osservazioni</label>
                                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                    rows={4} placeholder="Aggiungi accordi extra, disponibilità oraria..."
                                    className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border border-slate-200 text-slate-900 outline-none resize-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-6 rounded-[2rem] bg-red-50 border border-red-100 flex items-center gap-4 text-red-600">
                                    <div className="w-1.5 h-10 bg-red-600 rounded-full shrink-0"></div>
                                    <p className="font-bold text-sm tracking-tight">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-10 py-5 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-16 py-5 rounded-2xl text-sm font-black text-white shadow-2xl shadow-indigo-200 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                                >
                                    {saving ? "Salvataggio..." : "Crea Anagrafica"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-slate-50">
            <Topbar title="Medici" subtitle="Anagrafica medici e compensi" />

            <div className="p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Cerca medico por nome o specialità..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white shrink-0 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-5 h-5" />
                        NUOVO MEDICO
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Caricamento medici...</p>
                    </div>
                ) : medici.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Plus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">Nessun medico in archivio</h3>
                        <p className="text-slate-400 text-sm mb-8">Inizia a gestire il tuo poliambulatorio aggiungendo il primo specialista.</p>
                        <button onClick={() => setShowForm(true)} className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline">
                            + Aggiungi ora
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {medici.map((m) => {
                            const Icon = MODELLO_ICONS[m.modelloCompenso] ?? Percent;
                            return (
                                <div key={m.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors"></div>

                                    <div className="relative flex items-start justify-between mb-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black"
                                            style={{ background: `${m.specialita?.coloreHex ?? "#6366f1"}15`, color: m.specialita?.coloreHex ?? "#6366f1" }}>
                                            {m.nome.charAt(0)}{m.cognome.charAt(0)}
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                                                <Icon className="w-3 h-3" />
                                                {MODELLO_LABELS[m.modelloCompenso]}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative mb-8">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">
                                            {m.cognome} {m.nome}
                                        </h3>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                            {m.specialita?.nome || "Specialista Generale"}
                                        </p>
                                    </div>

                                    <div className="relative pt-6 border-t border-slate-50 space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Phone className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-bold">{m.telefono || "Non presente"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Mail className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-medium italic truncate">{m.email || "Nessuna email"}</span>
                                        </div>
                                    </div>

                                    <div className="relative p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Parametro Contratto</p>
                                        <p className="text-lg font-black text-slate-900 font-mono">
                                            {m.modelloCompenso === "percentuale" && m.percentuale
                                                ? `${m.percentuale}%`
                                                : m.modelloCompenso === "affitto_stanza" && m.affittoFisso
                                                    ? `${formatCurrency(Number(m.affittoFisso))}`
                                                    : "Parametro Misto"}
                                        </p>
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
