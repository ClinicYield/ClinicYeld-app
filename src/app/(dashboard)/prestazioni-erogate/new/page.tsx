"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Search, Save, ArrowLeft, Loader2, User, UserCheck,
    Stethoscope, Home, Info, AlertCircle, Plus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function NuovaPrestazioneErogata() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Data for selects
    const [pazienti, setPazienti] = useState<any[]>([]);
    const [medici, setMedici] = useState<any[]>([]);
    const [prestazioni, setPrestazioni] = useState<any[]>([]);
    const [stanze, setStanze] = useState<any[]>([]);

    const [form, setForm] = useState({
        pazienteId: "",
        medicoId: "",
        prestazioneId: "",
        stanzaId: "",
        dataErogazione: new Date().toISOString().split("T")[0],
        prezzoApplicato: 0,
        scontoPercentuale: 0,
        scontoImporto: 0,
        importoFinale: 0,
        tipoPagante: "privato",
        note: "",
    });

    useEffect(() => {
        // Initial fetch for data
        Promise.all([
            fetch("/api/anagrafica/pazienti").then(r => r.json()),
            fetch("/api/anagrafica/medici").then(r => r.json()),
            fetch("/api/anagrafica/prestazioni").then(r => r.json()),
            fetch("/api/anagrafica/stanze").then(r => r.json()),
        ]).then(([p, m, pr, s]) => {
            setPazienti(p.data ?? []);
            setMedici(m.data ?? []);
            setPrestazioni(pr.data ?? []);
            setStanze(s.data ?? []);
        });
    }, []);

    const handlePrestazioneChange = (id: string) => {
        const selected = prestazioni.find(p => p.id === id);
        if (selected) {
            const prezzo = Number(selected.prezzoBase);
            setForm(f => ({
                ...f,
                prestazioneId: id,
                prezzoApplicato: prezzo,
                importoFinale: prezzo,
                scontoPercentuale: 0,
                scontoImporto: 0
            }));
        } else {
            setForm(f => ({ ...f, prestazioneId: id }));
        }
    };

    const calculateFinal = (prezzo: number, scontoPerc: number, scontoImp: number) => {
        let final = prezzo;
        if (scontoPerc > 0) final = final * (1 - scontoPerc / 100);
        if (scontoImp > 0) final = final - scontoImp;
        return Math.max(0, final);
    };

    useEffect(() => {
        const final = calculateFinal(form.prezzoApplicato, form.scontoPercentuale, form.scontoImporto);
        setForm(f => ({ ...f, importoFinale: final }));
    }, [form.prezzoApplicato, form.scontoPercentuale, form.scontoImporto]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.pazienteId || !form.medicoId || !form.prestazioneId) {
            setError("Paziente, Medico e Prestazione sono obbligatori");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/prestazioni-erogate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    stanzaId: form.stanzaId || null,
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.[0]?.message || "Errore nel salvataggio");
            }
            router.push("/prestazioni-erogate");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full pb-20">
            <Topbar title="Nuova Prestazione" subtitle="Registra un'attività erogata" />

            <div className="p-6 max-w-4xl mx-auto w-full animate-fade-in">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Torna indietro
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Sezione Anagrafica */}
                        <div className="rounded-2xl p-6 space-y-4" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                <User className="w-4 h-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Paziente e Medico</h3>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Paziente *</label>
                                <select value={form.pazienteId} onChange={e => setForm(f => ({ ...f, pazienteId: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Seleziona paziente...</option>
                                    {pazienti.map(p => (
                                        <option key={p.id} value={p.id}>{p.cognome} {p.nome} ({p.codiceFiscale})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Medico Esecutore *</label>
                                <select value={form.medicoId} onChange={e => setForm(f => ({ ...f, medicoId: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Seleziona medico...</option>
                                    {medici.map(m => (
                                        <option key={m.id} value={m.id}>Dr. {m.cognome} {m.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Stanza (opzionale)</label>
                                <select value={form.stanzaId} onChange={e => setForm(f => ({ ...f, stanzaId: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Nessuna stanza</option>
                                    {stanze.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome} {s.numero ? `(${s.numero})` : ""}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sezione Prestazione */}
                        <div className="rounded-2xl p-6 space-y-4" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                <Stethoscope className="w-4 h-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Dettagli Prestazione</h3>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Prestazione *</label>
                                <select value={form.prestazioneId} onChange={e => handlePrestazioneChange(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                    <option value="">Seleziona prestazione...</option>
                                    {prestazioni.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome} ({formatCurrency(Number(p.prezzoBase))})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Data Erogazione *</label>
                                <input type="date" value={form.dataErogazione}
                                    onChange={e => setForm(f => ({ ...f, dataErogazione: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                                    style={{ background: "rgba(15,17,23,0.8)", border: "1px solid rgba(99,102,241,0.2)" }} />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Tipo Pagante</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["privato", "assicurazione"].map(t => (
                                        <button key={t} type="button"
                                            onClick={() => setForm(f => ({ ...f, tipoPagante: t }))}
                                            className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                                            style={{
                                                background: form.tipoPagante === t ? "rgba(99,102,241,0.2)" : "rgba(15,17,23,0.5)",
                                                border: form.tipoPagante === t ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(99,102,241,0.1)",
                                                color: form.tipoPagante === t ? "#a5b4fc" : "#64748b"
                                            }}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sezione Pricing */}
                        <div className="md:col-span-2 rounded-2xl p-6" style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <div className="flex items-center gap-2 mb-4 text-indigo-400">
                                <Info className="w-4 h-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Riepilogo Economico</h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Prezzo Base (€)</label>
                                    <input type="number" step="0.01" value={form.prezzoApplicato}
                                        onChange={e => setForm(f => ({ ...f, prezzoApplicato: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm text-white font-bold outline-none"
                                        style={{ background: "rgba(15,17,23,0.5)", border: "1px solid rgba(99,102,241,0.1)" }} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Sconto (%)</label>
                                    <input type="number" step="1" min="0" max="100" value={form.scontoPercentuale}
                                        onChange={e => setForm(f => ({ ...f, scontoPercentuale: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                        style={{ background: "rgba(15,17,23,0.5)", border: "1px solid rgba(34,197,94,0.2)" }} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Sconto Importo (€)</label>
                                    <input type="number" step="0.01" value={form.scontoImporto}
                                        onChange={e => setForm(f => ({ ...f, scontoImporto: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                                        style={{ background: "rgba(15,17,23,0.5)", border: "1px solid rgba(34,197,94,0.2)" }} />
                                </div>
                                <div className="flex flex-col justify-end text-right">
                                    <p className="text-xs text-slate-500 mb-1">Totale Finale</p>
                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(form.importoFinale)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-400 mb-1.5">Note aggiuntive</label>
                            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                rows={3} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
                                style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}
                                placeholder="Inserisci eventuali note cliniche o amministrative..." />
                        </div>

                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 rounded-xl text-sm text-red-400"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all">
                            Annulla
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Salvataggio...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Registra Prestazione</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
