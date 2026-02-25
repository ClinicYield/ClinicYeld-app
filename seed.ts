const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load .env.local
dotenv.config({ path: ".env.local" });

const schema = require("./src/lib/db/schema/index.ts");

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
    console.log("Seeding database...");

    const passwordHash = await bcrypt.hash("Admin123!", 10);

    // Create admin user
    try {
        const [user] = await db.insert(schema.utenti).values({
            email: "admin@clinicyield.it",
            nome: "Admin",
            cognome: "Clinic",
            ruolo: "admin",
            passwordHash: passwordHash,
            attivo: true,
        }).onConflictDoNothing({ target: schema.utenti.email }).returning();

        if (user) {
            console.log("Admin user created: admin@clinicyield.it / Admin123!");
        } else {
            console.log("Admin user already exists or skipped.");
        }

        // Create some base data if needed
        console.log("Seeding base specialties...");
        const specs = [
            { nome: "Cardiologia", coloreHex: "#ef4444" },
            { nome: "Dermatologia", coloreHex: "#ec4899" },
            { nome: "Ortopedia", coloreHex: "#3b82f6" },
            { nome: "Ginecologia", coloreHex: "#8b5cf6" },
        ];

        for (const s of specs) {
            await db.insert(schema.specialita).values(s).onConflictDoNothing({ target: schema.specialita.nome });
        }

        console.log("Seed completed successfully!");
    } catch (error) {
        console.error("Seed error:", error);
    }
}

main();
