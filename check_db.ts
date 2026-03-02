import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/lib/db/schema/index";

async function check() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });
    const ass = await db.query.assicurazioni.findMany();
    console.log("Insurances in DB:", JSON.stringify(ass, null, 2));
}

check().catch(console.error);
