"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenziali non valide. Riprova.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("Errore di connessione. Riprova.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">

            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
                    backgroundSize: "64px 64px"
                }}
            />

            <div className="relative w-full max-w-md px-6 animate-fade-in">
                {/* Card principale */}
                <div className="rounded-2xl p-8 bg-white border border-slate-200 shadow-xl shadow-indigo-100/50">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-linear-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">ClinicYield</h1>
                        <p className="text-sm text-slate-500">
                            Gestione finanziaria poliambulatorio
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-700">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@clinicyield.it"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 border border-slate-200 bg-slate-50/50 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 border border-slate-200 bg-slate-50/50 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-3 px-4 rounded-xl text-white font-bold text-sm transition-all duration-200 shadow-lg",
                                loading
                                    ? "bg-indigo-400 cursor-not-allowed"
                                    : "bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200 active:scale-[0.98]"
                            )}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Accesso in corso...
                                </span>
                            ) : "Accedi"}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-xs text-slate-500">
                            Demo: <span className="font-semibold text-indigo-600">admin@clinicyield.it</span> / <span className="font-semibold text-indigo-600">Admin123!</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs mt-8 text-slate-400">
                    © 2026 ClinicYield · Sistema di gestione finanziaria sanitaria
                </p>
            </div>
        </div>
    );
}

