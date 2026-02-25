import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compensiMedici, prestazioniErogate, medici } from "@/lib/db/schema";
import { eq, and, sum, count, gte, lte, sql } from "drizzle-orm";
import { calcolaCompenso } from "@/lib/utils";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const anno = Number(searchParams.get("anno") ?? new Date().getFullYear());
    const mese = searchParams.get("mese") ? Number(searchParams.get("mese")) : null;

    try {
        const result = await db.query.compensiMedici.findMany({
            where: and(
                eq(compensiMedici.periodoAnno, anno),
                mese ? eq(compensiMedici.periodoMese, mese) : undefined
            ),
            with: {
                medico: {
                    with: { specialita: { columns: { nome: true, coloreHex: true } } }
                }
            },
            orderBy: (c, { desc }) => [desc(c.periodoAnno), desc(c.periodoMese)],
        });

        return NextResponse.json({ data: result });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { mese, anno } = body;

    if (!mese || !anno) {
        return NextResponse.json({ error: "Mese e anno obbligatori" }, { status: 400 });
    }

    try {
        const inizioMese = new Date(anno, mese - 1, 1);
        const fineMese = new Date(anno, mese, 0, 23, 59, 59);

        // Recupera tutti i medici attivi
        const tuttiMedici = await db.query.medici.findMany({
            where: eq(medici.attivo, true),
            with: { specialita: true },
        });

        const compensiCalcolati = await Promise.all(
            tuttiMedici.map(async (medico) => {
                // Aggregazione prestazioni del medico nel mese
                const [aggregato] = await db
                    .select({
                        fatturatoLordo: sum(prestazioniErogate.importoFinale),
                        prestazioniCount: count(),
                    })
                    .from(prestazioniErogate)
                    .where(
                        and(
                            eq(prestazioniErogate.medicoId, medico.id),
                            gte(prestazioniErogate.dataErogazione, inizioMese),
                            lte(prestazioniErogate.dataErogazione, fineMese),
                            sql`${prestazioniErogate.stato} != 'annullata'`
                        )
                    );

                const fatturatoLordo = Number(aggregato?.fatturatoLordo ?? 0);
                const prestazioniCount = Number(aggregato?.prestazioniCount ?? 0);

                const compensoCalcolato = calcolaCompenso(
                    medico.modelloCompenso!,
                    fatturatoLordo,
                    medico.percentuale ? Number(medico.percentuale) : null,
                    medico.affittoFisso ? Number(medico.affittoFisso) : null,
                    medico.percentualeMista ? Number(medico.percentualeMista) : null,
                    medico.affittoMisto ? Number(medico.affittoMisto) : null
                );

                const dettaglioCalcolo = {
                    modello: medico.modelloCompenso,
                    fatturatoLordo,
                    percentuale: medico.percentuale,
                    affittoFisso: medico.affittoFisso,
                    compensoCalcolato,
                };

                // Upsert compenso
                await db
                    .insert(compensiMedici)
                    .values({
                        medicoId: medico.id,
                        periodoMese: mese,
                        periodoAnno: anno,
                        prestazioniCount,
                        fatturatoLordo: fatturatoLordo.toString(),
                        compensoCalcolato: compensoCalcolato.toString(),
                        modelloApplicato: medico.modelloCompenso!,
                        dettaglioCalcolo,
                        stato: "bozza",
                    })
                    .onConflictDoUpdate({
                        target: [compensiMedici.medicoId, compensiMedici.periodoMese, compensiMedici.periodoAnno],
                        set: {
                            prestazioniCount,
                            fatturatoLordo: fatturatoLordo.toString(),
                            compensoCalcolato: compensoCalcolato.toString(),
                            modelloApplicato: medico.modelloCompenso!,
                            dettaglioCalcolo,
                        },
                    });

                return { medicoId: medico.id, compensoCalcolato };
            })
        );

        return NextResponse.json({
            message: `Compensi calcolati per ${compensiCalcolati.length} medici`,
            data: compensiCalcolati,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore nel calcolo compensi" }, { status: 500 });
    }
}
