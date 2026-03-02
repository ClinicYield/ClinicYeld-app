"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import {
    User, Calendar, Phone, Mail, MapPin, Shield,
    Building2, ArrowLeft, Loader2, Edit, Trash2,
    Clock, Plus, FileText
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PazienteDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [paziente, setPaziente] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/anagrafica/pazienti?id=${id}`)
            .then(r => r.json())
            .then(json => {
                setPaziente(json.data);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Paziente" subtitle="..." />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        </div>
    );

    if (!paziente) return (
        <div className="flex flex-col min-h-full font-inter">
            <Topbar title="Errore" subtitle="Paziente non trovato" />
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <p>Il paziente richiesto non esiste o è stato rimosso.</p>
                <button onClick={() => router.back()} className="mt-4 text-indigo-400 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Torna indietro
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full font-inter">
            <Topbar
                title={`${paziente.cognome} ${paziente.nome}`}
                subtitle={`Codice Fiscale: ${paziente.codiceFiscale}`}
            />

            <div className="p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">

                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Elenco Pazienti
                    </button>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all">
                            <Edit className="w-4 h-4" /> Modifica
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">
                            <Trash2 className="w-4 h-4" /> Elimina
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Info Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl p-8 border border-white/5 bg-[#1a1d2e] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>

                            <div className="relative flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                                <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-2xl shadow-indigo-600/20"
                                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                    {paziente.nome.charAt(0)}{paziente.cognome.charAt(0)}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none group-hover:text-indigo-400 transition-colors">
                                        {paziente.cognome} {paziente.nome}
                                    </h1>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full">
                                            <Calendar className="w-4 h-4 text-indigo-400" />
                                            Nato il {paziente.dataNascita ? formatDate(paziente.dataNascita) : "--/--/----"}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full">
                                            <User className="w-4 h-4 text-indigo-400" />
                                            {paziente.sesso || "Sesso n.d."}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full">
                                            <Clock className="w-4 h-4 text-indigo-400" />
                                            Registrato il {formatDate(paziente.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-8 border-white/5" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Contatti</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Phone className="w-4 h-4 text-indigo-400" /></div>
                                            <span className="text-sm font-medium">{paziente.telefono || "Nessun telefono"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Mail className="w-4 h-4 text-indigo-400" /></div>
                                            <span className="text-sm font-medium lowercase italic">{paziente.email || "Nessuna email"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Residenza</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 text-slate-300">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mt-0.5"><MapPin className="w-4 h-4 text-indigo-400" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{paziente.indirizzo || "Indirizzo non presente"}</span>
                                                <span className="text-xs text-slate-500 font-bold uppercase">{paziente.cap} {paziente.citta} ({paziente.provincia})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Prestazioni */}
                        <div className="rounded-3xl p-8 border border-white/5 bg-[#1a1d2e]/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                    Ultime Prestazioni
                                </h3>
                                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider bg-indigo-400/10 px-3 py-1.5 rounded-full transition-all">
                                    Vedi Tutte
                                </button>
                            </div>
                            <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/5">
                                <Plus className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">Nessuna prestazione registrata per questo paziente.</p>
                                <button className="mt-4 px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all">
                                    REGISTRA ORA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">

                        {/* Convenzione / Assicurazione */}
                        <div className="rounded-3xl p-6 border border-white/5 bg-[#1a1d2e] shadow-xl">
                            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Profilo Finanziario</h4>
                            {paziente.assicurazione ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-600/10 border border-indigo-600/20">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Assicurazione</p>
                                            <p className="text-sm font-bold text-white uppercase">{paziente.assicurazione.ragioneSociale}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">Il paziente usufruisce di tariffe agevolate in convenzione.</p>
                                </div>
                            ) : paziente.azienda ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-violet-600/10 border border-violet-600/20">
                                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-tighter">Azienda Conv.</p>
                                            <p className="text-sm font-bold text-white uppercase">{paziente.azienda.ragioneSociale}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">Paziente convenzionato tramite la propria azienda.</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 opacity-70">
                                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-white shrink-0">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Pagante</p>
                                        <p className="text-sm font-bold text-white uppercase">Privato</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Note Rapide */}
                        <div className="rounded-3xl p-6 border border-white/5 bg-[#1a1d2e] shadow-xl">
                            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Note Paziente</h4>
                            <div className="text-xs text-slate-400 line-height-relaxed">
                                {paziente.note || "Nessuna nota particolare registrata. Clicca su modifica per aggiungere informazioni cliniche o anamnesi."}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
