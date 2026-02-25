import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
    const num = Number(amount ?? 0);
    return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
    }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "—";
    return format(new Date(date), "dd/MM/yyyy", { locale: it });
}

export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return "—";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: it });
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
    if (!date) return "—";
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it });
}

export function generateFatturaNumber(tipo: "FT" | "NC" | "PF", anno: number, progressivo: number): string {
    return `${tipo}-${anno}-${String(progressivo).padStart(4, "0")}`;
}

export function getScadenzaUrgency(dataScadenza: string | Date | null): "verde" | "giallo" | "arancio" | "rosso" | "neutro" {
    if (!dataScadenza) return "neutro";
    const giorni = differenceInDays(new Date(dataScadenza), new Date());
    if (giorni < 0) return "rosso";
    if (giorni <= 15) return "arancio";
    if (giorni <= 30) return "giallo";
    return "verde";
}

export function calcolaCompenso(
    modello: "percentuale" | "affitto_stanza" | "misto",
    fatturatoLordo: number,
    percentuale?: number | null,
    affittoFisso?: number | null,
    percentualeMista?: number | null,
    affittoMisto?: number | null
): number {
    switch (modello) {
        case "percentuale":
            return fatturatoLordo * ((percentuale ?? 0) / 100);
        case "affitto_stanza":
            return fatturatoLordo - (affittoFisso ?? 0);
        case "misto":
            return fatturatoLordo * ((percentualeMista ?? 0) / 100) - (affittoMisto ?? 0);
        default:
            return 0;
    }
}

export const MESI_ITALIANI = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export const STATI_FATTURA_LABELS: Record<string, string> = {
    bozza: "Bozza",
    emessa: "Emessa",
    inviata_sdi: "Inviata SDI",
    accettata_sdi: "Accettata SDI",
    pagata: "Pagata",
    parzialmente_pagata: "Parz. Pagata",
    scaduta: "Scaduta",
    insoluta: "Insoluta",
    annullata: "Annullata",
};

export const STATI_FATTURA_COLORS: Record<string, string> = {
    bozza: "bg-gray-100 text-gray-700",
    emessa: "bg-blue-100 text-blue-700",
    inviata_sdi: "bg-indigo-100 text-indigo-700",
    accettata_sdi: "bg-cyan-100 text-cyan-700",
    pagata: "bg-green-100 text-green-700",
    parzialmente_pagata: "bg-yellow-100 text-yellow-700",
    scaduta: "bg-orange-100 text-orange-700",
    insoluta: "bg-red-100 text-red-700",
    annullata: "bg-gray-100 text-gray-500 line-through",
};

export const METODI_PAGAMENTO_LABELS: Record<string, string> = {
    contanti: "💵 Contanti",
    pos: "💳 POS",
    bonifico: "🏦 Bonifico",
    online: "🌐 Online",
    misto: "🔀 Misto",
};

export const STATI_PRESTAZIONE_LABELS: Record<string, string> = {
    erogata: "Erogata",
    fatturata: "Fatturata",
    pagata: "Pagata",
    insoluta: "Insoluta",
    annullata: "Annullata",
};

export const STATI_PRESTAZIONE_COLORS: Record<string, string> = {
    erogata: "bg-blue-100 text-blue-700",
    fatturata: "bg-purple-100 text-purple-700",
    pagata: "bg-green-100 text-green-700",
    insoluta: "bg-red-100 text-red-700",
    annullata: "bg-gray-100 text-gray-500",
};
