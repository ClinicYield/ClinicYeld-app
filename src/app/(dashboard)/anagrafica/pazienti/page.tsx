"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Search, Plus, Filter, Users, Phone, Mail,
    Building2, Shield, ChevronRight, Loader2, UserX
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Paziente {
    id: string;
    codiceFiscale: string;
    nome: string;
    cognome: string;
    dataNascita?: string;
    telefono?: string;
    email?: string;
    citta?: string;
    assicurazione?: { ragioneSociale: string };
    azienda?: { ragioneSociale: string };
    createdAt: string;
}

export default function PazientiPage() {
    const [pazienti, setPazienti] = useState<Paziente[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchPazienti = async (q = "") => {
        setLoading(true);
        const res = await fetch(`/api/anagrafica/pazienti?search=${encodeURIComponent(q)}`);
        const json = await res.json();
        setPazienti(json.data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(() => fetchPazienti(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Pazienti" subtitle="Anagrafica pazienti" />

            <div className="p-6 animate-fade-in">
                {/* Header actions */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cerca per nome, cognome o codice fiscale..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}
                        />
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-4 h-4" />
                        Nuovo Paziente
                    </button>
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-400">
                        {loading ? "Caricamento..." : `${pazienti.length} pazienti`}
                    </span>
                </div>

                {/* Tabella */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                        </div>
                    ) : pazienti.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                            <UserX className="w-10 h-10 mb-3" />
                            <p className="text-sm">Nessun paziente trovato</p>
                            {search && <p className="text-xs mt-1">Prova con un altro termine di ricerca</p>}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                                    {["Paziente", "Cod. Fiscale", "Contatti", "Copertura", "Registrato", ""].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pazienti.map((p, i) => (
                                    <tr key={p.id}
                                        className="transition-colors hover:bg-white/5"
                                        style={{ borderBottom: i < pazienti.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none" }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                                    {p.nome.charAt(0)}{p.cognome.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{p.cognome} {p.nome}</p>
                                                    {p.citta && <p className="text-xs text-slate-500">{p.citta}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-mono text-slate-300 text-xs bg-slate-800 px-2 py-1 rounded">
                                                {p.codiceFiscale}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                {p.telefono && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Phone className="w-3 h-3" />
                                                        {p.telefono}
                                                    </div>
                                                )}
                                                {p.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Mail className="w-3 h-3" />
                                                        {p.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.assicurazione ? (
                                                <span className="flex items-center gap-1.5 text-xs badge-blu px-2 py-1 rounded-lg">
                                                    <Shield className="w-3 h-3" />
                                                    {p.assicurazione.ragioneSociale}
                                                </span>
                                            ) : p.azienda ? (
                                                <span className="flex items-center gap-1.5 text-xs badge-viola px-2 py-1 rounded-lg">
                                                    <Building2 className="w-3 h-3" />
                                                    {p.azienda.ragioneSociale}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600">Privato</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-500">{formatDate(p.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/anagrafica/pazienti/${p.id}`}
                                                className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors block">
                                                <ChevronRight className="w-4 h-4 text-slate-500 hover:text-indigo-400" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal nuovo paziente */}
                {showForm && (
                    <NuovoPazienteModal
                        onClose={() => setShowForm(false)}
                        onSave={() => { setShowForm(false); fetchPazienti(search); }}
                    />
                )}
            </div>
        </div>
    );
}

function NuovoPazienteModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({
        codiceFiscale: "", nome: "", cognome: "", dataNascita: "",
        sesso: "", telefono: "", email: "", indirizzo: "",
        cap: "", citta: "", provincia: "", note: "",
        assicurazioneId: "", aziendaId: ""
    });
    const [assicurazioni, setAssicurazioni] = useState<any[]>([]);
    const [aziende, setAziende] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAssicurazioneForm, setShowAssicurazioneForm] = useState(false);
    const [showAziendaForm, setShowAziendaForm] = useState(false);

    const refreshData = () => {
        Promise.all([
            fetch("/api/anagrafica/assicurazioni").then(r => r.json()),
            fetch("/api/anagrafica/aziende").then(r => r.json())
        ]).then(([ass, az]) => {
            setAssicurazioni(ass.data ?? []);
            setAziende(az.data ?? []);
        });
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/anagrafica/pazienti", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    sesso: form.sesso || null,
                    assicurazioneId: form.assicurazioneId || null,
                    aziendaId: form.aziendaId || null
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                const message = Array.isArray(errData.error)
                    ? errData.error[0]?.message
                    : (errData.error || "Errore nel salvataggio");
                throw new Error(message);
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
            <div className="flex min-h-full items-center justify-center font-inter" onClick={e => e.stopPropagation()}>
                <div className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 animate-fade-in"
                    style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Nuovo Paziente</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors">
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {[
                            { label: "Codice Fiscale *", key: "codiceFiscale", col: 2 },
                            { label: "Nome *", key: "nome" },
                            { label: "Cognome *", key: "cognome" },
                            { label: "Data di Nascita", key: "dataNascita", type: "date" },
                            { label: "Telefono", key: "telefono" },
                            { label: "Email", key: "email", type: "email", col: 2 },
                            { label: "Indirizzo", key: "indirizzo", col: 2 },
                            { label: "CAP", key: "cap" },
                            { label: "Città", key: "citta" },
                            { label: "Provincia (es. MI)", key: "provincia" },
                        ].map(({ label, key, type = "text", col }) => (
                            <div key={key} className={col === 2 ? "col-span-2" : ""}>
                                <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                                <input
                                    type={type}
                                    value={(form as any)[key]}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    required={label.endsWith("*")}
                                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Sesso</label>
                            <select value={form.sesso} onChange={e => setForm(f => ({ ...f, sesso: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <option value="">Non specificato</option>
                                <option value="M">Maschile</option>
                                <option value="F">Femminile</option>
                                <option value="Altro">Altro</option>
                            </select>
                        </div>

                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs text-slate-400">Assicurazione</label>
                                    <button type="button" onClick={() => setShowAssicurazioneForm(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                        <Plus className="w-2.5 h-2.5" /> Aggiungi
                                    </button>
                                </div>
                                <select value={form.assicurazioneId} onChange={e => setForm(f => ({ ...f, assicurazioneId: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Nessuna</option>
                                    {assicurazioni.map(a => <option key={a.id} value={a.id}>{a.ragioneSociale}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs text-slate-400">Azienda Conv.</label>
                                    <button type="button" onClick={() => setShowAziendaForm(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                        <Plus className="w-2.5 h-2.5" /> Aggiungi
                                    </button>
                                </div>
                                <select value={form.aziendaId} onChange={e => setForm(f => ({ ...f, aziendaId: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Nessuna</option>
                                    {aziende.map(a => <option key={a.id} value={a.id}>{a.ragioneSociale}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs text-slate-400 mb-1.5">Note</label>
                            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                                style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}
                            />
                        </div>

                        {error && (
                            <div className="col-span-2 p-3 rounded-xl text-sm text-red-400"
                                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                {error}
                            </div>
                        )}

                        <div className="col-span-2 flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                                Annulla
                            </button>
                            <button type="submit" disabled={loading}
                                className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                {loading ? "Salvataggio..." : "Salva Paziente"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showAssicurazioneForm && (
                <QuickAddModal
                    title="Nuova Assicurazione"
                    onClose={() => setShowAssicurazioneForm(false)}
                    onSave={(id) => {
                        refreshData();
                        setForm(f => ({ ...f, assicurazioneId: id }));
                        setShowAssicurazioneForm(false);
                    }}
                    api="/api/anagrafica/assicurazioni"
                />
            )}

            {showAziendaForm && (
                <QuickAddModal
                    title="Nuova Azienda"
                    onClose={() => setShowAziendaForm(false)}
                    onSave={(id) => {
                        refreshData();
                        setForm(f => ({ ...f, aziendaId: id }));
                        setShowAziendaForm(false);
                    }}
                    api="/api/anagrafica/aziende"
                />
            )}
        </div>
    );
}

function QuickAddModal({ title, onClose, onSave, api }: { title: string; onClose: () => void; onSave: (id: string) => void; api: string }) {
    const [name, setName] = useState("");
    const [piva, setPiva] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(api, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ragioneSociale: name, partitaIva: piva }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(Array.isArray(data.error) ? data.error[0].message : data.error);
            onSave(data.id);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.3)" }}>
                <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Ragione Sociale *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none bg-slate-900/50 border border-white/10" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Partita IVA * (11 cifre)</label>
                        <input type="text" value={piva} onChange={e => setPiva(e.target.value)} required
                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none bg-slate-900/50 border border-white/10" />
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="text-xs text-slate-400 px-3 py-2">Annulla</button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50">
                            {loading ? "..." : "Salva"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
