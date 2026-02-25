import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prestazioniErogate, medici, pazienti, prestazioni } from "@/lib/db/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

const prestazioneSchema = z.object({
    pazienteId: z.string().uuid(),
    medicoId: z.string().uuid(),
    prestazioneId: z.string().uuid(),
    stanzaId: z.string().uuid().optional().nullable(),
    dataErogazione: z.string(),
    prezzoApplicato: z.coerce.number().min(0),
    scontoPercentuale: z.coerce.number().min(0).max(100).default(0),
    scontoImporto: z.coerce.number().min(0).default(0),
    importoFinale: z.coerce.number().min(0),
    tipoPagante: z.enum(["privato", "assicurazione", "azienda_convenzionata"]).default("privato"),
    assicurazioneId: z.string().uuid().optional().nullable(),
    aziendaId: z.string().uuid().optional().nullable(),
    note: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const stato = searchParams.get("stato");
    const medicoId = searchParams.get("medicoId");
    const pazienteId = searchParams.get("pazienteId");
    const dal = searchParams.get("dal");
    const al = searchParams.get("al");
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = (page - 1) * limit;

    try {
        const result = await db.query.prestazioniErogate.findMany({
            where: and(
                stato ? eq(prestazioniErogate.stato, stato as any) : undefined,
                medicoId ? eq(prestazioniErogate.medicoId, medicoId) : undefined,
                pazienteId ? eq(prestazioniErogate.pazienteId, pazienteId) : undefined,
                dal ? gte(prestazioniErogate.dataErogazione, new Date(dal)) : undefined,
                al ? lte(prestazioniErogate.dataErogazione, new Date(al)) : undefined,
            ),
            with: {
                paziente: { columns: { nome: true, cognome: true, codiceFiscale: true } },
                medico: { columns: { nome: true, cognome: true } },
                prestazione: { columns: { nome: true, codice: true } },
                stanza: { columns: { nome: true, numero: true } },
            },
            orderBy: [desc(prestazioniErogate.dataErogazione)],
            limit,
            offset,
        });

        return NextResponse.json({ data: result, page, limit });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = prestazioneSchema.parse(body);

        const [prestazione] = await db.insert(prestazioniErogate).values({
            ...data,
            prezzoApplicato: data.prezzoApplicato.toString(),
            scontoPercentuale: data.scontoPercentuale.toString(),
            scontoImporto: data.scontoImporto.toString(),
            importoFinale: data.importoFinale.toString(),
            dataErogazione: new Date(data.dataErogazione),
        }).returning();

        return NextResponse.json(prestazione, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        console.error(error);
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
