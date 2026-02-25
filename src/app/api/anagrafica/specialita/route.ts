import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { specialita } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const data = await db.query.specialita.findMany({
            where: eq(specialita.attivo, true),
            orderBy: [desc(specialita.nome)],
        });
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
