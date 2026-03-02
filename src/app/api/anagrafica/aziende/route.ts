import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aziendeConvenzionate } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
    ragioneSociale: z.string().min(1, "La ragione sociale è obbligatoria"),
    partitaIva: z.string().min(11).max(11, "La Partita IVA deve essere di 11 caratteri"),
    codiceFiscale: z.string().max(16).optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal("")),
    telefono: z.string().optional().nullable(),
});

export async function GET() {
    try {
        const data = await db.query.aziendeConvenzionate.findMany({
            where: eq(aziendeConvenzionate.attivo, true),
            orderBy: [desc(aziendeConvenzionate.ragioneSociale)],
        });
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = schema.parse(body);
        const [newItem] = await db.insert(aziendeConvenzionate).values(data).returning();
        return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Errore nel salvataggio" }, { status: 500 });
    }
}
