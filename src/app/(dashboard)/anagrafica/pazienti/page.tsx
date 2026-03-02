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
        cap: "", citta: "", provincia: "", note: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/anagrafica/pazienti", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, sesso: form.sesso || null }),
            });
            if (!res.ok) {
                const errData = await res.json();
                // If it's a Zod error array, take the first one
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-2xl rounded-2xl p-6 animate-fade-in overflow-y-auto max-h-[90vh]"
                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }}>
                <h2 className="text-lg font-semibold text-white mb-5">Nuovo Paziente</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
                        { label: "Provincia", key: "provincia" },
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
    );
}
