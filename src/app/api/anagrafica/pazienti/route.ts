import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pazienti } from "@/lib/db/schema";
import { eq, ilike, or, and, desc } from "drizzle-orm";
import { z } from "zod";

const pazienteSchema = z.object({
    codiceFiscale: z.string().min(11).max(16).toUpperCase(),
    nome: z.string().min(1).max(100),
    cognome: z.string().min(1).max(100),
    dataNascita: z.string().optional().nullable(),
    sesso: z.enum(["M", "F", "Altro"]).optional().nullable(),
    indirizzo: z.string().optional().nullable(),
    cap: z.string().max(10).optional().nullable(),
    citta: z.string().max(100).optional().nullable(),
    provincia: z.string().max(100).optional().nullable(),
    telefono: z.string().max(20).optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal("")),
    assicurazioneId: z.string().uuid().optional().nullable(),
    aziendaId: z.string().uuid().optional().nullable(),
    note: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = (page - 1) * limit;

    try {
        const conditions = [eq(pazienti.attivo, true)];

        if (search) {
            conditions.push(
                or(
                    ilike(pazienti.nome, `%${search}%`),
                    ilike(pazienti.cognome, `%${search}%`),
                    ilike(pazienti.codiceFiscale, `%${search}%`),
                    ilike(pazienti.telefono, `%${search}%`)
                ) as any
            );
        }

        const result = await db.query.pazienti.findMany({
            where: and(...conditions),
            with: {
                assicurazione: { columns: { ragioneSociale: true } },
                azienda: { columns: { ragioneSociale: true } },
            },
            orderBy: [desc(pazienti.createdAt)],
            limit,
            offset,
        });

        return NextResponse.json({ data: result, page, limit });
    } catch (error: any) {
        console.error("GET Patients error:", error);
        return NextResponse.json({ error: error.message || "Errore nel caricamento" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Clean empty strings to null for all optional fields
        const cleaned: any = {};
        for (const [k, v] of Object.entries(body)) {
            cleaned[k] = v === "" ? null : v;
        }

        const data = pazienteSchema.parse(cleaned);

        const [paziente] = await db.insert(pazienti).values({
            ...data,
            // Ensure email isn't an empty string if it passed Zod or was cleaned
            email: data.email || null,
        }).returning();

        return NextResponse.json(paziente, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        console.error("POST Patient error:", error);
        // Handle common DB errors (like unique constraint)
        const errorMessage = error.code === '23505'
            ? "Paziente già esistente (Codice Fiscale duplicato)"
            : (error.message || "Errore durante il salvataggio");
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
