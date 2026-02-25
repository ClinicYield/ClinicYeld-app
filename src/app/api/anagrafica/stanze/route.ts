import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stanze } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const data = await db.query.stanze.findMany({
            where: eq(stanze.attivo, true),
            with: { specialita: true },
            orderBy: [desc(stanze.nome)],
        });
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
