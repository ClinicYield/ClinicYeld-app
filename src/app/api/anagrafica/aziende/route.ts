import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aziendeConvenzionate } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
