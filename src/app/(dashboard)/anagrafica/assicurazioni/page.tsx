"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Shield, Plus, Loader2, Search, Building2,
    Mail, Phone, ExternalLink, Users, FileCheck
} from "lucide-react";

interface Assicurazione {
    id: string;
    ragioneSociale: string;
    codiceFiscale?: string;
    partitaIva?: string;
    email?: string;
    telefono?: string;
    sitoWeb?: string;
    attivo: boolean;
}

export default function AssicurazioniAnagrafica() {
    const [data, setData] = useState<Assicurazione[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/anagrafica/assicurazioni")
            .then(r => r.json())
            .then(json => {
                setData(json.data ?? []);
                setLoading(false);
            });
    }, []);

    const filtered = data.filter(a =>
        a.ragioneSociale.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Assicurazioni" subtitle="Enti e Fondi Sanitari convenzionati" />

            <div className="p-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Cerca ente..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.2)" }} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Plus className="w-4 h-4" />
                        Nuova Convenzione
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((item) => (
                            <div key={item.id} className="rounded-2xl p-5 card-hover group"
                                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        {item.attivo ? (
                                            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-lg uppercase font-bold tracking-tighter">Attivo</span>
                                        ) : (
                                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-lg uppercase font-bold tracking-tighter">Sospeso</span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{item.ragioneSociale}</h3>
                                <p className="text-xs text-slate-500 font-mono mb-4">{item.partitaIva || item.codiceFiscale || "--"}</p>

                                <div className="space-y-2 mb-4">
                                    {item.email && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Mail className="w-3.5 h-3.5" /> {item.email}
                                        </div>
                                    )}
                                    {item.telefono && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Phone className="w-3.5 h-3.5" /> {item.telefono}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                                    <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase text-slate-400 bg-white/5 hover:bg-white/10 transition-all">
                                        <Users className="w-3 h-3" /> Listino
                                    </button>
                                    <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase text-slate-400 bg-white/5 hover:bg-white/10 transition-all">
                                        <FileCheck className="w-3 h-3" /> Report
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-600">
                                <Shield className="w-12 h-12 mb-3 opacity-20" />
                                <p>Nessun ente assicurativo trovato</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
