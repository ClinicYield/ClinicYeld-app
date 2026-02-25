"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    ClipboardList, Plus, Loader2, Search, Filter,
    ChevronRight, User, UserCheck, Calendar
} from "lucide-react";
import { formatCurrency, formatDateTime, STATI_PRESTAZIONE_LABELS, STATI_PRESTAZIONE_COLORS } from "@/lib/utils";
import Link from "next/link";

interface Prestazione {
    id: string;
    dataErogazione: string;
    importoFinale: string;
    stato: string;
    tipoPagante: string;
    paziente: { nome: string; cognome: string; codiceFiscale: string };
    medico: { nome: string; cognome: string };
    prestazione: { nome: string; codice: string };
    stanza?: { nome: string };
}

export default function PrestazioniErogate() {
    const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStato, setFiltroStato] = useState("");
    const [search, setSearch] = useState("");

    const fetchPrestazioni = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtroStato) params.set("stato", filtroStato);
        const res = await fetch(`/api/prestazioni-erogate?${params}`);
        const json = await res.json();
        setPrestazioni(json.data ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchPrestazioni(); }, [filtroStato]);

    const filtered = prestazioni.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.paziente.cognome.toLowerCase().includes(q) ||
            p.paziente.nome.toLowerCase().includes(q) ||
            p.prestazione.nome.toLowerCase().includes(q) ||
            p.medico.cognome.toLowerCase().includes(q)
        );
    });

    const tipiPagante = [
        { val: "", label: "Tutti" },
        { val: "erogata", label: "Non Fatturate" },
        { val: "fatturata", label: "Fatturate" },
        { val: "pagata", label: "Pagate" },
        { val: "insoluta", label: "Insolute" },
    ];

    const totaleImporto = filtered.reduce((acc, p) => acc + Number(p.importoFinale), 0);

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Prestazioni Erogate" subtitle="Registro di tutte le prestazioni" />

            <div className="p-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Cerca paziente, medico, prestazione..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>
                    <Link href="/prestazioni-erogate/new"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-4 h-4" />
                        Nuova Prestazione
                    </Link>
                </div>

                {/* Filtri */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                    {tipiPagante.map(s => (
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
                    <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 shrink-0">
                        <span>{filtered.length} prestazioni</span>
                        <span>·</span>
                        <span className="font-semibold text-white">{formatCurrency(totaleImporto)}</span>
                    </div>
                </div>

                {/* Tabella */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                            <ClipboardList className="w-10 h-10 mb-3" />
                            <p className="text-sm">Nessuna prestazione trovata</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                                    {["Data", "Paziente", "Prestazione", "Medico", "Stanza", "Importo", "Tipo", "Stato", ""].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => (
                                    <tr key={p.id} className="transition-colors hover:bg-white/5"
                                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none" }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                {formatDateTime(p.dataErogazione)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: "rgba(99,102,241,0.3)" }}>
                                                    {p.paziente.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{p.paziente.cognome} {p.paziente.nome}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{p.paziente.codiceFiscale}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-white">{p.prestazione.nome}</p>
                                            <p className="text-xs text-slate-500 font-mono">{p.prestazione.codice}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-300">
                                                <UserCheck className="w-3 h-3 text-slate-500" />
                                                Dr. {p.medico.cognome}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{p.stanza?.nome ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold text-white">{formatCurrency(Number(p.importoFinale))}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-400">{p.tipoPagante}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATI_PRESTAZIONE_COLORS[p.stato] ?? ""}`}>
                                                {STATI_PRESTAZIONE_LABELS[p.stato] ?? p.stato}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/prestazioni-erogate/${p.id}`}
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
            </div>
        </div>
    );
}
