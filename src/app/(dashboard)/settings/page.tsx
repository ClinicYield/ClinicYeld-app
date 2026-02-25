"use client";

import { Topbar } from "@/components/layout/Topbar";
import {
    Settings, User, Lock, Database, Bell,
    Shield, Globe, Palette, Save, LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
    const sections = [
        { title: "Profilo", icon: User, desc: "Gestisci le tue informazioni personali" },
        { title: "Sicurezza", icon: Lock, desc: "Cambia password e autenticazione" },
        { title: "Database", icon: Database, desc: "Backup e configurazione Neon DB" },
        { title: "Notifiche", icon: Bell, desc: "Preferenze avvisi e scadenze" },
        { title: "Aspetto", icon: Palette, desc: "Personalizza il tema scuro" },
        { title: "Integrazioni", icon: Globe, desc: "SDI, Stripe, Nexi, Email" },
    ];

    return (
        <div className="flex flex-col min-h-full">
            <Topbar title="Impostazioni" subtitle="Configurazione di sistema e preferenze" />

            <div className="p-6 max-w-4xl animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {sections.map(s => (
                        <button key={s.title}
                            className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all hover:scale-[1.01]"
                            style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-red-400">Area Pericolosa</h3>
                            <p className="text-xs text-slate-500 mt-1">Sconnetti il tuo account o resetta la sessione corrente.</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500 transition-all">
                            <LogOut className="w-4 h-4" /> Disconnetti
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <p className="text-[10px] text-slate-600 self-center">Versione 1.0.0 (Beta) — ClinicYield Dashboard</p>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Save className="w-4 h-4" /> Salva Configurazione
                    </button>
                </div>
            </div>
        </div>
    );
}
