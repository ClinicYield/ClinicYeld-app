import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assicurazioni } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const data = await db.query.assicurazioni.findMany({
            where: eq(assicurazioni.attivo, true),
            orderBy: [desc(assicurazioni.ragioneSociale)],
        });
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Errore" }, { status: 500 });
    }
}
