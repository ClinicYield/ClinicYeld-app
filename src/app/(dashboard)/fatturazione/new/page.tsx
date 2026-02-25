"use client";

import { useEffect, useState, Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Plus, Trash2, Save, ArrowLeft, Loader2, User,
    FileText, Hash, Calendar, Euro, Info, AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

function NuovaFatturaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedPazienteId = searchParams.get("pazienteId");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    const [pazienti, setPazienti] = useState<any[]>([]);
    const [aziende, setAziende] = useState<any[]>([]);
    const [assicurazioni, setAssicurazioni] = useState<any[]>([]);
    const [prestazioniPendenti, setPrestazioniPendenti] = useState<any[]>([]);

    const [form, setForm] = useState({
        tipo: "fattura" as "fattura" | "nota_credito" | "proforma",
        dataEmissione: new Date().toISOString().split("T")[0],
        dataScadenza: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
        pazienteId: preSelectedPazienteId || "",
        assicurazioneId: "",
        aziendaId: "",
        intestatarioTipo: "paziente" as "paziente" | "assicurazione" | "azienda",
        metodoPagamento: "bonifico",
        note: "",
        righe: [] as any[],
    });

    useEffect(() => {
        Promise.all([
            fetch("/api/anagrafica/pazienti").then(r => r.json()),
            fetch("/api/anagrafica/aziende").then(r => r.json()),
            fetch("/api/anagrafica/assicurazioni").then(r => r.json()),
        ]).then(([p, a, as]) => {
            setPazienti(p.data ?? []);
            setAziende(a.data ?? []);
            setAssicurazioni(as.data ?? []);
            setLoadingData(false);
        });
    }, []);

    // Fetch pending services for selected patient
    useEffect(() => {
        if (form.pazienteId && form.intestatarioTipo === "paziente") {
            fetch(`/api/prestazioni-erogate?pazienteId=${form.pazienteId}&stato=erogata`)
                .then(r => r.json())
                .then(json => setPrestazioniPendenti(json.data ?? []));
        } else {
            setPrestazioniPendenti([]);
        }
    }, [form.pazienteId, form.intestatarioTipo]);

    const addRiga = (p?: any) => {
        const nuovaRiga = {
            descrizione: p ? p.prestazione.nome : "",
            quantita: 1,
            prezzoUnitario: p ? Number(p.importoFinale) : 0,
            scontoPercentuale: 0,
            imponibile: p ? Number(p.importoFinale) : 0,
            ivaPercentuale: 0,
            ivaImporto: 0,
            totale: p ? Number(p.importoFinale) : 0,
            prestazioneErogatId: p ? p.id : null,
        };
        setForm(f => ({ ...f, righe: [...f.righe, nuovaRiga] }));
    };

    const removeRiga = (idx: number) => {
        setForm(f => ({ ...f, righe: f.righe.filter((_, i) => i !== idx) }));
    };

    const updateRiga = (idx: number, fields: any) => {
        const nuoveRighe = [...form.righe];
        nuoveRighe[idx] = { ...nuoveRighe[idx], ...fields };

        // Ricalcola riga
        const r = nuoveRighe[idx];
        const base = r.quantita * r.prezzoUnitario;
        const scontato = base * (1 - r.scontoPercentuale / 100);
        r.imponibile = scontato;
        r.ivaImporto = (scontato * r.ivaPercentuale) / 100;
        r.totale = scontato + r.ivaImporto;

        setForm(f => ({ ...f, righe: nuoveRighe }));
    };

    const totaleImponibile = form.righe.reduce((acc, r) => acc + r.imponibile, 0);
    const totaleIva = form.righe.reduce((acc, r) => acc + r.ivaImporto, 0);
    const totaleFattura = totaleImponibile + totaleIva;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.righe.length === 0) {
            setError("Inserisci almeno una riga in fattura");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/fatture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    imponibile: totaleImponibile,
                    iva: totaleIva,
                    totale: totaleFattura,
                }),
            });
            if (!res.ok) throw new Error("Errore nella generazione della fattura");
            router.push("/fatturazione");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full pb-20">
            <Topbar title="Emissione Fattura" subtitle="Crea una nuova fattura o nota di credito" />

            <div className="p-6 max-w-5xl mx-auto w-full animate-fade-in">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Torna indietro
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Sinistra: Dati Testata */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-2xl p-6 space-y-4" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                    <FileText className="w-4 h-4" />
                                    <h3 className="text-sm font-semibold uppercase tracking-wider">Tipo e Date</h3>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Tipo Documento</label>
                                    <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                        style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                        <option value="fattura">Fattura</option>
                                        <option value="nota_credito">Nota di Credito</option>
                                        <option value="proforma">Proforma</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">Data Emissione</label>
                                        <input type="date" value={form.dataEmissione}
                                            onChange={e => setForm(f => ({ ...f, dataEmissione: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.1)" }} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5">Scadenza</label>
                                        <input type="date" value={form.dataScadenza}
                                            onChange={e => setForm(f => ({ ...f, dataScadenza: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.1)" }} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Intestatario</label>
                                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                                        {["paziente", "azienda", "assicurazione"].map(t => (
                                            <button key={t} type="button"
                                                onClick={() => setForm(f => ({ ...f, intestatarioTipo: t as any }))}
                                                className="px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                                                style={{
                                                    background: form.intestatarioTipo === t ? "rgba(99,102,241,0.2)" : "rgba(15,17,23,0.5)",
                                                    border: form.intestatarioTipo === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(99,102,241,0.05)",
                                                    color: form.intestatarioTipo === t ? "#a5b4fc" : "#475569"
                                                }}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>

                                    {form.intestatarioTipo === "paziente" && (
                                        <select value={form.pazienteId} onChange={e => setForm(f => ({ ...f, pazienteId: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                            <option value="">Seleziona paziente...</option>
                                            {pazienti.map(p => <option key={p.id} value={p.id}>{p.cognome} {p.nome}</option>)}
                                        </select>
                                    )}
                                    {form.intestatarioTipo === "azienda" && (
                                        <select value={form.aziendaId} onChange={e => setForm(f => ({ ...f, aziendaId: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                            <option value="">Seleziona azienda...</option>
                                            {aziende.map(a => <option key={a.id} value={a.id}>{a.ragioneSociale}</option>)}
                                        </select>
                                    )}
                                    {form.intestatarioTipo === "assicurazione" && (
                                        <select value={form.assicurazioneId} onChange={e => setForm(f => ({ ...f, assicurazioneId: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                            style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                            <option value="">Seleziona assicurazione...</option>
                                            {assicurazioni.map(as => <option key={as.id} value={as.id}>{as.ragioneSociale}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Box Totale */}
                            <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1e1b4b, #1e293b)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 text-sm">
                                        <span>Imponibile</span>
                                        <span>{formatCurrency(totaleImponibile)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 text-sm">
                                        <span>IVA</span>
                                        <span>{formatCurrency(totaleIva)}</span>
                                    </div>
                                    <div className="h-px bg-slate-700 my-2" />
                                    <div className="flex justify-between text-white font-bold text-xl">
                                        <span>Totale</span>
                                        <span className="text-indigo-400">{formatCurrency(totaleFattura)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DESTRA: Righe Fattura */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Sezione prestazioni erogate (se paziente selezionato) */}
                            {prestazioniPendenti.length > 0 && (
                                <div className="rounded-2xl p-5" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5" /> Prestazioni disponibili da fatturare
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {prestazioniPendenti.map(p => (
                                            <button key={p.id} type="button" onClick={() => addRiga(p)}
                                                className="flex flex-col items-start px-3 py-2 rounded-xl text-left transition-all hover:scale-105"
                                                style={{ background: "#1a1d2e", border: "1px solid rgba(34,197,94,0.3)" }}>
                                                <span className="text-xs font-semibold text-white">{p.prestazione.nome}</span>
                                                <span className="text-[10px] text-slate-500">{formatCurrency(Number(p.importoFinale))} — {new Date(p.dataErogazione).toLocaleDateString()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl p-6 min-h-[400px]" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-indigo-400" /> Righe Documento
                                    </h3>
                                    <button type="button" onClick={() => addRiga()}
                                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                        <Plus className="w-3 h-3" /> Aggiungi riga libera
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {form.righe.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-slate-600">
                                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-sm">Nessuna riga inserita</p>
                                            <p className="text-xs mt-1">Aggiungi una riga manuale o seleziona una prestazione</p>
                                        </div>
                                    ) : (
                                        form.righe.map((r, i) => (
                                            <div key={i} className="group p-4 rounded-xl space-y-3 transition-all hover:bg-white/5"
                                                style={{ border: "1px solid rgba(99, 102, 241, 0.05)" }}>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <input type="text" placeholder="Descrizione riga..."
                                                            value={r.descrizione} onChange={e => updateRiga(i, { descrizione: e.target.value })}
                                                            className="w-full bg-transparent text-sm text-white font-medium outline-none border-b border-transparent focus:border-indigo-500" />
                                                    </div>
                                                    <button type="button" onClick={() => removeRiga(i)}
                                                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1">Prezzo (€)</label>
                                                        <input type="number" step="0.01" value={r.prezzoUnitario}
                                                            onChange={e => updateRiga(i, { prezzoUnitario: Number(e.target.value) })}
                                                            className="w-full bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none border border-slate-800" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1">Qtà</label>
                                                        <input type="number" step="1" value={r.quantita}
                                                            onChange={e => updateRiga(i, { quantita: Number(e.target.value) })}
                                                            className="w-full bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none border border-slate-800" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1">Sc. %</label>
                                                        <input type="number" step="1" value={r.scontoPercentuale}
                                                            onChange={e => updateRiga(i, { scontoPercentuale: Number(e.target.value) })}
                                                            className="w-full bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-indigo-400 outline-none border border-slate-800" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1">IVA %</label>
                                                        <input type="number" step="1" value={r.ivaPercentuale}
                                                            onChange={e => updateRiga(i, { ivaPercentuale: Number(e.target.value) })}
                                                            className="w-full bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-slate-400 outline-none border border-slate-800" />
                                                    </div>
                                                    <div className="col-span-1 text-right">
                                                        <label className="block text-[10px] text-slate-500 mb-1">Subtotale</label>
                                                        <p className="text-sm font-bold text-white pt-1">{formatCurrency(r.totale)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="rounded-2xl p-6" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                                <label className="block text-xs text-slate-400 mb-2">Note in fattura</label>
                                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                    rows={2} className="w-full bg-transparent text-sm text-slate-300 outline-none resize-none"
                                    placeholder="Inserisci note visibili sul PDF..." />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 rounded-xl text-sm text-red-400"
                                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3">
                                <button type="button" onClick={() => router.back()}
                                    className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all">
                                    Annulla
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex items-center gap-2 px-10 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/20"
                                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Creazione...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Emetti Documento</>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default function NuovaFattura() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
            <NuovaFatturaContent />
        </Suspense>
    );
}

function CheckCircle(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}
