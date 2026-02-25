import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fatture, pagamenti, prestazioniErogate, pazienti, medici } from "@/lib/db/schema";
import { sql, eq, gte, lte, and, count, sum } from "drizzle-orm";

export async function GET() {
    try {
        const now = new Date();
        const meseCorrente = now.getMonth() + 1;
        const anno = now.getFullYear();
        const inizioMese = new Date(anno, now.getMonth(), 1).toISOString().split("T")[0];
        const fineMese = new Date(anno, now.getMonth() + 1, 0).toISOString().split("T")[0];
        const mesePrecedenteInizio = new Date(anno, now.getMonth() - 1, 1).toISOString().split("T")[0];
        const mesePrecedenteFine = new Date(anno, now.getMonth(), 0).toISOString().split("T")[0];
        const oggi = now.toISOString().split("T")[0];
        const tra30giorni = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];

        // Fatturato mese corrente
        const [fatturatoMese] = await db
            .select({ totale: sum(fatture.totale) })
            .from(fatture)
            .where(
                and(
                    gte(fatture.dataEmissione, inizioMese),
                    lte(fatture.dataEmissione, fineMese),
                    sql`${fatture.stato} != 'annullata'`
                )
            );

        // Fatturato mese precedente
        const [fatturatoMesePrecedente] = await db
            .select({ totale: sum(fatture.totale) })
            .from(fatture)
            .where(
                and(
                    gte(fatture.dataEmissione, mesePrecedenteInizio),
                    lte(fatture.dataEmissione, mesePrecedenteFine),
                    sql`${fatture.stato} != 'annullata'`
                )
            );

        // Incassi mese corrente
        const [incassiMese] = await db
            .select({ totale: sum(pagamenti.importo) })
            .from(pagamenti)
            .where(
                and(
                    gte(pagamenti.dataPagamento, inizioMese),
                    lte(pagamenti.dataPagamento, fineMese)
                )
            );

        // Crediti aperti totali
        const creditiAperti = await db
            .select({ totale: sum(sql`${fatture.totale} - ${fatture.totalePagato}`) })
            .from(fatture)
            .where(
                sql`${fatture.stato} IN ('emessa', 'parzialmente_pagata', 'scaduta', 'inviata_sdi', 'accettata_sdi')`
            );

        // Insoluti totali
        const [insoluti] = await db
            .select({ totale: sum(sql`${fatture.totale} - ${fatture.totalePagato}`), conteggio: count() })
            .from(fatture)
            .where(eq(fatture.stato, "insoluta"));

        // Fatture in scadenza
        const [fattureScadenza] = await db
            .select({ conteggio: count() })
            .from(fatture)
            .where(
                and(
                    gte(fatture.dataScadenza, oggi),
                    lte(fatture.dataScadenza, tra30giorni),
                    sql`${fatture.stato} IN ('emessa', 'parzialmente_pagata')`
                )
            );

        // Totale pazienti
        const [totalePazienti] = await db
            .select({ conteggio: count() })
            .from(pazienti)
            .where(eq(pazienti.attivo, true));

        // Totale medici
        const [totaleMedici] = await db
            .select({ conteggio: count() })
            .from(medici)
            .where(eq(medici.attivo, true));

        // Andamento mensile ultimi 12 mesi
        const andamentoMensile = await db
            .select({
                mese: sql<number>`EXTRACT(MONTH FROM ${fatture.dataEmissione}::date)`,
                anno: sql<number>`EXTRACT(YEAR FROM ${fatture.dataEmissione}::date)`,
                totale: sum(fatture.totale),
                conteggio: count(),
            })
            .from(fatture)
            .where(
                and(
                    gte(fatture.dataEmissione, new Date(anno - 1, now.getMonth(), 1).toISOString().split("T")[0]),
                    sql`${fatture.stato} != 'annullata'`
                )
            )
            .groupBy(
                sql`EXTRACT(YEAR FROM ${fatture.dataEmissione}::date)`,
                sql`EXTRACT(MONTH FROM ${fatture.dataEmissione}::date)`
            )
            .orderBy(
                sql`EXTRACT(YEAR FROM ${fatture.dataEmissione}::date)`,
                sql`EXTRACT(MONTH FROM ${fatture.dataEmissione}::date)`
            );

        // Top medici per fatturato (mese corrente)
        const topMedici = await db
            .select({
                medicoId: prestazioniErogate.medicoId,
                nome: sql<string>`CONCAT(${medici.nome}, ' ', ${medici.cognome})`,
                fatturato: sum(prestazioniErogate.importoFinale),
                prestazioni: count(),
            })
            .from(prestazioniErogate)
            .innerJoin(medici, eq(prestazioniErogate.medicoId, medici.id))
            .where(
                and(
                    gte(prestazioniErogate.dataErogazione, new Date(anno, now.getMonth(), 1)),
                    sql`${prestazioniErogate.stato} != 'annullata'`
                )
            )
            .groupBy(prestazioniErogate.medicoId, medici.nome, medici.cognome)
            .orderBy(sql`sum(${prestazioniErogate.importoFinale}) DESC`)
            .limit(5);

        return NextResponse.json({
            fatturatoMese: Number(fatturatoMese?.totale ?? 0),
            fatturatoMesePrecedente: Number(fatturatoMesePrecedente?.totale ?? 0),
            incassiMese: Number(incassiMese?.totale ?? 0),
            creditiAperti: Number(creditiAperti[0]?.totale ?? 0),
            insoluti: {
                totale: Number(insoluti?.totale ?? 0),
                conteggio: Number(insoluti?.conteggio ?? 0),
            },
            fattureInScadenza: Number(fattureScadenza?.conteggio ?? 0),
            totalePazienti: Number(totalePazienti?.conteggio ?? 0),
            totaleMedici: Number(totaleMedici?.conteggio ?? 0),
            andamentoMensile,
            topMedici,
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }
}
