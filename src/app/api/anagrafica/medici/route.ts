import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medici } from "@/lib/db/schema";
import { eq, ilike, or, and, desc } from "drizzle-orm";
import { z } from "zod";

const medicoSchema = z.object({
    codiceFiscale: z.string().min(11).max(16).toUpperCase(),
    partitaIva: z.string().max(11).optional().nullable(),
    nome: z.string().min(1).max(100),
    cognome: z.string().min(1).max(100),
    specialitaId: z.string().uuid().optional().nullable(),
    telefono: z.string().max(20).optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal("")),
    iban: z.string().max(34).optional().nullable(),
    modelloCompenso: z.enum(["percentuale", "affitto_stanza", "misto"]).default("percentuale"),
    percentuale: z.coerce.number().min(0).max(100).optional().nullable(),
    affittoFisso: z.coerce.number().min(0).optional().nullable(),
    percentualeMista: z.coerce.number().min(0).max(100).optional().nullable(),
    affittoMisto: z.coerce.number().min(0).optional().nullable(),
    note: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    try {
        const conditions = [eq(medici.attivo, true)];

        if (search) {
            conditions.push(
                or(
                    ilike(medici.nome, `%${search}%`),
                    ilike(medici.cognome, `%${search}%`),
                    ilike(medici.codiceFiscale, `%${search}%`)
                ) as any
            );
        }

        const result = await db.query.medici.findMany({
            where: and(...conditions),
            with: {
                specialita: { columns: { nome: true, coloreHex: true } },
            },
            orderBy: [desc(medici.createdAt)],
        });

        return NextResponse.json({ data: result });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = medicoSchema.parse(body);

        const [medico] = await db.insert(medici).values({
            ...data,
            email: data.email || null,
            percentuale: data.percentuale?.toString(),
            affittoFisso: data.affittoFisso?.toString(),
            percentualeMista: data.percentualeMista?.toString(),
            affittoMisto: data.affittoMisto?.toString(),
        }).returning();

        return NextResponse.json(medico, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        console.error(error);
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
