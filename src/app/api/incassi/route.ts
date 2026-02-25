import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pagamenti, fatture } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const pagamentoSchema = z.object({
    fatturaId: z.string().uuid(),
    dataPagamento: z.string(),
    importo: z.coerce.number().min(0.01),
    metodo: z.enum(["contanti", "pos", "bonifico", "online", "misto"]),
    riferimento: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = pagamentoSchema.parse(body);

        const result = await db.transaction(async (tx) => {
            // Inserisci pagamento
            const [pagamento] = await tx.insert(pagamenti).values({
                fatturaId: data.fatturaId,
                dataPagamento: data.dataPagamento,
                importo: data.importo.toString(),
                metodo: data.metodo,
                riferimento: data.riferimento ?? null,
                note: data.note ?? null,
            }).returning();

            // Aggiorna totale pagato sulla fattura
            const [fatturaAggiornata] = await tx
                .update(fatture)
                .set({
                    totalePagato: sql`${fatture.totalePagato} + ${data.importo}`,
                    updatedAt: new Date(),
                })
                .where(eq(fatture.id, data.fatturaId))
                .returning();

            // Aggiorna stato fattura
            const totalePagato = Number(fatturaAggiornata.totalePagato);
            const totale = Number(fatturaAggiornata.totale);

            let nuovoStato: string;
            if (totalePagato >= totale) {
                nuovoStato = "pagata";
            } else if (totalePagato > 0) {
                nuovoStato = "parzialmente_pagata";
            } else {
                nuovoStato = fatturaAggiornata.stato as any;
            }

            if (nuovoStato !== fatturaAggiornata.stato) {
                await tx.update(fatture)
                    .set({ stato: nuovoStato as any })
                    .where(eq(fatture.id, data.fatturaId));
            }

            return pagamento;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 422 });
        }
        console.error(error);
        return NextResponse.json({ error: "Errore nel registrare il pagamento" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fatturaId = searchParams.get("fatturaId");

    try {
        const result = await db.query.pagamenti.findMany({
            where: fatturaId ? eq(pagamenti.fatturaId, fatturaId) : undefined,
            orderBy: (p, { desc }) => [desc(p.dataPagamento)],
        });
        return NextResponse.json({ data: result });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
