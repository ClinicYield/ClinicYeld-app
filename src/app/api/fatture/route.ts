import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fatture, righeFattura, prestazioniErogate } from "@/lib/db/schema";
import { eq, and, desc, sql, gte, lte, ilike } from "drizzle-orm";
import { z } from "zod";

const fatturaSchema = z.object({
    tipo: z.enum(["fattura", "nota_credito", "proforma"]).default("fattura"),
    dataEmissione: z.string(),
    dataScadenza: z.string().optional().nullable(),
    pazienteId: z.string().uuid().optional().nullable(),
    assicurazioneId: z.string().uuid().optional().nullable(),
    aziendaId: z.string().uuid().optional().nullable(),
    intestatarioTipo: z.enum(["paziente", "assicurazione", "azienda"]).default("paziente"),
    imponibile: z.coerce.number().min(0),
    iva: z.coerce.number().min(0).default(0),
    totale: z.coerce.number().min(0),
    metodoPagamento: z.enum(["contanti", "pos", "bonifico", "online", "misto"]).optional().nullable(),
    note: z.string().optional().nullable(),
    righe: z.array(z.object({
        descrizione: z.string().min(1),
        quantita: z.coerce.number().default(1),
        prezzoUnitario: z.coerce.number().min(0),
        scontoPercentuale: z.coerce.number().min(0).max(100).default(0),
        imponibile: z.coerce.number().min(0),
        ivaPercentuale: z.coerce.number().min(0).default(0),
        ivaImporto: z.coerce.number().min(0).default(0),
        totale: z.coerce.number().min(0),
        prestazioneErogatId: z.string().uuid().optional().nullable(),
    })),
});

async function getNextNumeroFattura(tipo: string): Promise<string> {
    const anno = new Date().getFullYear();
    const prefisso = tipo === "nota_credito" ? "NC" : tipo === "proforma" ? "PF" : "FT";

    const [last] = await db
        .select({ numero: fatture.numeroFattura })
        .from(fatture)
        .where(
            and(
                sql`${fatture.numeroFattura} LIKE ${`${prefisso}-${anno}-%`}`,
                eq(fatture.tipo, tipo as any)
            )
        )
        .orderBy(desc(fatture.numeroFattura))
        .limit(1);

    let progressivo = 1;
    if (last?.numero) {
        const parts = last.numero.split("-");
        progressivo = parseInt(parts[2]) + 1;
    }

    return `${prefisso}-${anno}-${String(progressivo).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const stato = searchParams.get("stato");
    const tipo = searchParams.get("tipo");
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = (page - 1) * limit;

    try {
        const result = await db.query.fatture.findMany({
            where: and(
                stato ? eq(fatture.stato, stato as any) : undefined,
                tipo ? eq(fatture.tipo, tipo as any) : undefined,
            ),
            with: {
                paziente: { columns: { nome: true, cognome: true, codiceFiscale: true } },
                assicurazione: { columns: { ragioneSociale: true } },
                azienda: { columns: { ragioneSociale: true } },
                righe: true,
                pagamenti: true,
            },
            orderBy: [desc(fatture.dataEmissione)],
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
        const data = fatturaSchema.parse(body);

        // Genera numero fattura progressivo
        const numeroFattura = await getNextNumeroFattura(data.tipo);

        const [fattura] = await db.transaction(async (tx) => {
            // Inserisci fattura
            const [fat] = await tx.insert(fatture).values({
                numeroFattura,
                tipo: data.tipo,
                dataEmissione: data.dataEmissione,
                dataScadenza: data.dataScadenza ?? null,
                pazienteId: data.pazienteId ?? null,
                assicurazioneId: data.assicurazioneId ?? null,
                aziendaId: data.aziendaId ?? null,
                intestatarioTipo: data.intestatarioTipo,
                imponibile: data.imponibile.toString(),
                iva: data.iva.toString(),
                totale: data.totale.toString(),
                stato: "emessa",
                metodoPagamento: data.metodoPagamento ?? null,
                note: data.note ?? null,
            }).returning();

            // Inserisci righe
            if (data.righe.length > 0) {
                await tx.insert(righeFattura).values(
                    data.righe.map((riga, idx) => ({
                        fatturaId: fat.id,
                        descrizione: riga.descrizione,
                        quantita: riga.quantita.toString(),
                        prezzoUnitario: riga.prezzoUnitario.toString(),
                        scontoPercentuale: riga.scontoPercentuale.toString(),
                        imponibile: riga.imponibile.toString(),
                        ivaPercentuale: riga.ivaPercentuale.toString(),
                        ivaImporto: riga.ivaImporto.toString(),
                        totale: riga.totale.toString(),
                        ordine: idx,
                        prestazioneErogatId: riga.prestazioneErogatId ?? null,
                    }))
                );

                // Aggiorna stato prestazioni erogate come fatturate
                const prestazioniIds = data.righe
                    .filter(r => r.prestazioneErogatId)
                    .map(r => r.prestazioneErogatId!);

                if (prestazioniIds.length > 0) {
                    await Promise.all(prestazioniIds.map(id =>
                        tx.update(prestazioniErogate)
                            .set({ stato: "fatturata" })
                            .where(eq(prestazioniErogate.id, id))
                    ));
                }
            }

            return [fat];
        });

        return NextResponse.json(fattura, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        console.error(error);
        return NextResponse.json({ error: "Errore nella creazione della fattura" }, { status: 500 });
    }
}
