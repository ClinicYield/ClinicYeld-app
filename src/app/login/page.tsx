"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f1117 0%, #0d0f1a 50%, #12101f 100%)" }}>

            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/3 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
                    backgroundSize: "50px 50px"
                }}
            />

            <div className="relative w-full max-w-md px-6 animate-fade-in">
                {/* Card principale */}
                <div className="rounded-2xl p-8 border"
                    style={{
                        background: "rgba(26, 29, 46, 0.9)",
                        borderColor: "rgba(99, 102, 241, 0.2)",
                        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.05)"
                    }}>

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">ClinicYield</h1>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                            Gestione finanziaria poliambulatorio
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@clinicyield.it"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2"
                                    style={{
                                        background: "rgba(15, 17, 23, 0.8)",
                                        border: "1px solid rgba(99, 102, 241, 0.2)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                                    style={{
                                        background: "rgba(15, 17, 23, 0.8)",
                                        border: "1px solid rgba(99, 102, 241, 0.2)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:text-white"
                                    style={{ color: "#64748b" }}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl"
                                style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: loading
                                    ? "rgba(99, 102, 241, 0.5)"
                                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                boxShadow: loading ? "none" : "0 4px 20px rgba(99, 102, 241, 0.4)",
                            }}
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
                    <div className="mt-6 p-3 rounded-xl text-center"
                        style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                        <p className="text-xs" style={{ color: "#64748b" }}>
                            Demo: <span className="text-indigo-400">admin@clinicyield.it</span> / <span className="text-indigo-400">Admin123!</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs mt-6" style={{ color: "#374151" }}>
                    © 2026 ClinicYield · Sistema di gestione finanziaria sanitaria
                </p>
            </div>
        </div>
    );
}
