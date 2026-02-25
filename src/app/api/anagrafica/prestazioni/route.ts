import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prestazioni } from "@/lib/db/schema";
import { eq, ilike, and, desc } from "drizzle-orm";
import { z } from "zod";

const prestazioneSchema = z.object({
    codice: z.string().min(1),
    nome: z.string().min(1),
    descrizione: z.string().optional().nullable(),
    specialitaId: z.string().uuid().optional().nullable(),
    prezzoBase: z.coerce.number().min(0),
    ivaPercentuale: z.coerce.number().min(0).default(0),
    durataMinuti: z.coerce.number().optional().nullable(),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    try {
        const data = await db.query.prestazioni.findMany({
            where: and(
                eq(prestazioni.attivo, true),
                search ? ilike(prestazioni.nome, `%${search}%`) : undefined
            ),
            with: { specialita: true },
            orderBy: [desc(prestazioni.nome)],
        });
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = prestazioneSchema.parse(body);
        const [newItem] = await db.insert(prestazioni).values({
            ...data,
            prezzoBase: data.prezzoBase.toString(),
            ivaPercentuale: data.ivaPercentuale.toString(),
        }).returning();
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
