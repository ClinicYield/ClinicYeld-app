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
                )}
            </div>
        </div>
    );
}
