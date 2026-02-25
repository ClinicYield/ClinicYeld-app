import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    date,
    integer,
    decimal,
    pgEnum,
    jsonb,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export const ruoloEnum = pgEnum("ruolo", [
    "admin",
    "segreteria",
    "contabile",
    "medico",
    "direzione",
]);

export const sessoEnum = pgEnum("sesso", ["M", "F", "Altro"]);

export const modelloCompensoEnum = pgEnum("modello_compenso", [
    "percentuale",
    "affitto_stanza",
    "misto",
]);

export const tipoPaganteEnum = pgEnum("tipo_pagante", [
    "privato",
    "assicurazione",
    "azienda_convenzionata",
]);

export const statoPrestazioneEnum = pgEnum("stato_prestazione", [
    "erogata",
    "fatturata",
    "pagata",
    "insoluta",
    "annullata",
]);

export const tipoFatturaEnum = pgEnum("tipo_fattura", [
    "fattura",
    "nota_credito",
    "proforma",
]);

export const intestatarioTipoEnum = pgEnum("intestatario_tipo", [
    "paziente",
    "assicurazione",
    "azienda",
]);

export const statoFatturaEnum = pgEnum("stato_fattura", [
    "bozza",
    "emessa",
    "inviata_sdi",
    "accettata_sdi",
    "pagata",
    "parzialmente_pagata",
    "scaduta",
    "insoluta",
    "annullata",
]);

export const sdiStatoEnum = pgEnum("sdi_stato", [
    "non_inviata",
    "in_attesa",
    "accettata",
    "rifiutata",
    "scartata",
]);

export const metodoPagamentoEnum = pgEnum("metodo_pagamento", [
    "contanti",
    "pos",
    "bonifico",
    "online",
    "misto",
]);

export const statoCompensoEnum = pgEnum("stato_compenso", [
    "bozza",
    "confermato",
    "pagato",
]);

export const tipoConvenzioneEnum = pgEnum("tipo_convenzione", [
    "pacchetto",
    "tariffa_ridotta",
    "rimborso",
]);

// ─── TABELLE ─────────────────────────────────────────────────────────────────

// Specialità mediche
export const specialita = pgTable("specialita", {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: varchar("nome", { length: 100 }).notNull().unique(),
    descrizione: text("descrizione"),
    coloreHex: varchar("colore_hex", { length: 7 }).default("#6366f1"),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Utenti (auth)
export const utenti = pgTable("utenti", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    nome: varchar("nome", { length: 100 }).notNull(),
    cognome: varchar("cognome", { length: 100 }).notNull(),
    ruolo: ruoloEnum("ruolo").notNull().default("segreteria"),
    passwordHash: text("password_hash").notNull(),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Stanze
export const stanze = pgTable("stanze", {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: varchar("nome", { length: 100 }).notNull(),
    numero: varchar("numero", { length: 20 }),
    piano: varchar("piano", { length: 20 }),
    specialitaId: uuid("specialita_id").references(() => specialita.id),
    affittoOrario: decimal("affitto_orario", { precision: 10, scale: 2 }),
    affittoGiornaliero: decimal("affitto_giornaliero", { precision: 10, scale: 2 }),
    affittoMensile: decimal("affitto_mensile", { precision: 10, scale: 2 }),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Assicurazioni
export const assicurazioni = pgTable("assicurazioni", {
    id: uuid("id").primaryKey().defaultRandom(),
    ragioneSociale: varchar("ragione_sociale", { length: 255 }).notNull(),
    partitaIva: varchar("partita_iva", { length: 11 }).notNull().unique(),
    codiceFiscale: varchar("codice_fiscale", { length: 16 }),
    indirizzo: text("indirizzo"),
    cap: varchar("cap", { length: 10 }),
    citta: varchar("citta", { length: 100 }),
    provincia: varchar("provincia", { length: 2 }),
    email: varchar("email", { length: 255 }),
    pec: varchar("pec", { length: 255 }),
    codiceSdi: varchar("codice_sdi", { length: 7 }),
    condizioniPagamento: text("condizioni_pagamento"),
    giorniPagamento: integer("giorni_pagamento").default(30),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Aziende convenzionate
export const aziendeConvenzionate = pgTable("aziende_convenzionate", {
    id: uuid("id").primaryKey().defaultRandom(),
    ragioneSociale: varchar("ragione_sociale", { length: 255 }).notNull(),
    partitaIva: varchar("partita_iva", { length: 11 }).notNull().unique(),
    codiceFiscale: varchar("codice_fiscale", { length: 16 }),
    indirizzo: text("indirizzo"),
    cap: varchar("cap", { length: 10 }),
    citta: varchar("citta", { length: 100 }),
    provincia: varchar("provincia", { length: 2 }),
    email: varchar("email", { length: 255 }),
    pec: varchar("pec", { length: 255 }),
    codiceSdi: varchar("codice_sdi", { length: 7 }),
    tipoConvenzione: tipoConvenzioneEnum("tipo_convenzione"),
    condizioniPagamento: text("condizioni_pagamento"),
    giorniPagamento: integer("giorni_pagamento").default(30),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Medici
export const medici = pgTable("medici", {
    id: uuid("id").primaryKey().defaultRandom(),
    utenteId: uuid("utente_id").references(() => utenti.id),
    codiceFiscale: varchar("codice_fiscale", { length: 16 }).notNull().unique(),
    partitaIva: varchar("partita_iva", { length: 11 }),
    nome: varchar("nome", { length: 100 }).notNull(),
    cognome: varchar("cognome", { length: 100 }).notNull(),
    specialitaId: uuid("specialita_id").references(() => specialita.id),
    telefono: varchar("telefono", { length: 20 }),
    email: varchar("email", { length: 255 }),
    iban: varchar("iban", { length: 34 }),
    modelloCompenso: modelloCompensoEnum("modello_compenso").default("percentuale"),
    percentuale: decimal("percentuale", { precision: 5, scale: 2 }),
    affittoFisso: decimal("affitto_fisso", { precision: 10, scale: 2 }),
    percentualeMista: decimal("percentuale_mista", { precision: 5, scale: 2 }),
    affittoMisto: decimal("affitto_misto", { precision: 10, scale: 2 }),
    attivo: boolean("attivo").default(true),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Pazienti
export const pazienti = pgTable("pazienti", {
    id: uuid("id").primaryKey().defaultRandom(),
    codiceFiscale: varchar("codice_fiscale", { length: 16 }).notNull().unique(),
    nome: varchar("nome", { length: 100 }).notNull(),
    cognome: varchar("cognome", { length: 100 }).notNull(),
    dataNascita: date("data_nascita"),
    sesso: sessoEnum("sesso"),
    indirizzo: text("indirizzo"),
    cap: varchar("cap", { length: 10 }),
    citta: varchar("citta", { length: 100 }),
    provincia: varchar("provincia", { length: 2 }),
    telefono: varchar("telefono", { length: 20 }),
    email: varchar("email", { length: 255 }),
    assicurazioneId: uuid("assicurazione_id").references(() => assicurazioni.id),
    aziendaId: uuid("azienda_id").references(() => aziendeConvenzionate.id),
    note: text("note"),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Catalogo prestazioni
export const prestazioni = pgTable("prestazioni", {
    id: uuid("id").primaryKey().defaultRandom(),
    codice: varchar("codice", { length: 50 }).notNull().unique(),
    nome: varchar("nome", { length: 255 }).notNull(),
    descrizione: text("descrizione"),
    specialitaId: uuid("specialita_id").references(() => specialita.id),
    prezzoBase: decimal("prezzo_base", { precision: 10, scale: 2 }).notNull(),
    ivaPercentuale: decimal("iva_percentuale", { precision: 5, scale: 2 }).default("0.00"),
    durataMinuti: integer("durata_minuti"),
    attivo: boolean("attivo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Prestazioni erogate
export const prestazioniErogate = pgTable("prestazioni_erogate", {
    id: uuid("id").primaryKey().defaultRandom(),
    pazienteId: uuid("paziente_id").notNull().references(() => pazienti.id),
    medicoId: uuid("medico_id").notNull().references(() => medici.id),
    prestazioneId: uuid("prestazione_id").notNull().references(() => prestazioni.id),
    stanzaId: uuid("stanza_id").references(() => stanze.id),
    dataErogazione: timestamp("data_erogazione").notNull(),
    prezzoApplicato: decimal("prezzo_applicato", { precision: 10, scale: 2 }).notNull(),
    scontoPercentuale: decimal("sconto_percentuale", { precision: 5, scale: 2 }).default("0.00"),
    scontoImporto: decimal("sconto_importo", { precision: 10, scale: 2 }).default("0.00"),
    importoFinale: decimal("importo_finale", { precision: 10, scale: 2 }).notNull(),
    tipoPagante: tipoPaganteEnum("tipo_pagante").default("privato"),
    assicurazioneId: uuid("assicurazione_id").references(() => assicurazioni.id),
    aziendaId: uuid("azienda_id").references(() => aziendeConvenzionate.id),
    stato: statoPrestazioneEnum("stato").default("erogata"),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    pazienteIdx: index("pe_paziente_idx").on(table.pazienteId),
    medicoIdx: index("pe_medico_idx").on(table.medicoId),
    dataIdx: index("pe_data_idx").on(table.dataErogazione),
    statoIdx: index("pe_stato_idx").on(table.stato),
}));

// Fatture
export const fatture = pgTable("fatture", {
    id: uuid("id").primaryKey().defaultRandom(),
    numeroFattura: varchar("numero_fattura", { length: 50 }).notNull().unique(),
    tipo: tipoFatturaEnum("tipo").default("fattura"),
    dataEmissione: date("data_emissione").notNull(),
    dataScadenza: date("data_scadenza"),
    pazienteId: uuid("paziente_id").references(() => pazienti.id),
    assicurazioneId: uuid("assicurazione_id").references(() => assicurazioni.id),
    aziendaId: uuid("azienda_id").references(() => aziendeConvenzionate.id),
    intestatarioTipo: intestatarioTipoEnum("intestatario_tipo").default("paziente"),
    imponibile: decimal("imponibile", { precision: 10, scale: 2 }).notNull(),
    iva: decimal("iva", { precision: 10, scale: 2 }).default("0.00"),
    totale: decimal("totale", { precision: 10, scale: 2 }).notNull(),
    totalePagato: decimal("totale_pagato", { precision: 10, scale: 2 }).default("0.00"),
    stato: statoFatturaEnum("stato").default("bozza"),
    sdiId: varchar("sdi_id", { length: 255 }),
    sdiStato: sdiStatoEnum("sdi_stato").default("non_inviata"),
    xmlFattura: text("xml_fattura"),
    pdfUrl: text("pdf_url"),
    notaCreditoRef: uuid("nota_credito_ref"),
    metodoPagamento: metodoPagamentoEnum("metodo_pagamento"),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    pazienteIdx: index("f_paziente_idx").on(table.pazienteId),
    statoIdx: index("f_stato_idx").on(table.stato),
    dataIdx: index("f_data_idx").on(table.dataEmissione),
}));

// Righe fattura
export const righeFattura = pgTable("righe_fattura", {
    id: uuid("id").primaryKey().defaultRandom(),
    fatturaId: uuid("fattura_id").notNull().references(() => fatture.id, { onDelete: "cascade" }),
    prestazioneErogatId: uuid("prestazione_erogata_id").references(() => prestazioniErogate.id),
    descrizione: text("descrizione").notNull(),
    quantita: decimal("quantita", { precision: 10, scale: 2 }).default("1"),
    prezzoUnitario: decimal("prezzo_unitario", { precision: 10, scale: 2 }).notNull(),
    scontoPercentuale: decimal("sconto_percentuale", { precision: 5, scale: 2 }).default("0.00"),
    imponibile: decimal("imponibile", { precision: 10, scale: 2 }).notNull(),
    ivaPercentuale: decimal("iva_percentuale", { precision: 5, scale: 2 }).default("0.00"),
    ivaImporto: decimal("iva_importo", { precision: 10, scale: 2 }).default("0.00"),
    totale: decimal("totale", { precision: 10, scale: 2 }).notNull(),
    ordine: integer("ordine").default(0),
});

// Pagamenti
export const pagamenti = pgTable("pagamenti", {
    id: uuid("id").primaryKey().defaultRandom(),
    fatturaId: uuid("fattura_id").notNull().references(() => fatture.id),
    dataPagamento: date("data_pagamento").notNull(),
    importo: decimal("importo", { precision: 10, scale: 2 }).notNull(),
    metodo: metodoPagamentoEnum("metodo").notNull(),
    riferimento: varchar("riferimento", { length: 255 }),
    note: text("note"),
    registratoDa: uuid("registrato_da").references(() => utenti.id),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    fatturaIdx: index("p_fattura_idx").on(table.fatturaId),
}));

// Compensi medici
export const compensiMedici = pgTable("compensi_medici", {
    id: uuid("id").primaryKey().defaultRandom(),
    medicoId: uuid("medico_id").notNull().references(() => medici.id),
    periodoMese: integer("periodo_mese").notNull(),
    periodoAnno: integer("periodo_anno").notNull(),
    prestazioniCount: integer("prestazioni_count").default(0),
    fatturatoLordo: decimal("fatturato_lordo", { precision: 10, scale: 2 }).default("0.00"),
    compensoCalcolato: decimal("compenso_calcolato", { precision: 10, scale: 2 }).default("0.00"),
    modelloApplicato: modelloCompensoEnum("modello_applicato"),
    dettaglioCalcolo: jsonb("dettaglio_calcolo"),
    stato: statoCompensoEnum("stato").default("bozza"),
    dataPagamento: date("data_pagamento"),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    medicoMeseIdx: uniqueIndex("cm_medico_mese_idx").on(
        table.medicoId,
        table.periodoMese,
        table.periodoAnno
    ),
}));

// ─── RELATIONS ────────────────────────────────────────────────────────────────

export const specialitaRelations = relations(specialita, ({ many }) => ({
    medici: many(medici),
    prestazioni: many(prestazioni),
    stanze: many(stanze),
}));

export const utentiRelations = relations(utenti, ({ one, many }) => ({
    medico: one(medici, { fields: [utenti.id], references: [medici.utenteId] }),
    pagamentiRegistrati: many(pagamenti),
}));

export const mediciRelations = relations(medici, ({ one, many }) => ({
    utente: one(utenti, { fields: [medici.utenteId], references: [utenti.id] }),
    specialita: one(specialita, { fields: [medici.specialitaId], references: [specialita.id] }),
    prestazioniErogate: many(prestazioniErogate),
    compensi: many(compensiMedici),
}));

export const pazientiRelations = relations(pazienti, ({ one, many }) => ({
    assicurazione: one(assicurazioni, { fields: [pazienti.assicurazioneId], references: [assicurazioni.id] }),
    azienda: one(aziendeConvenzionate, { fields: [pazienti.aziendaId], references: [aziendeConvenzionate.id] }),
    prestazioniErogate: many(prestazioniErogate),
    fatture: many(fatture),
}));

export const prestazioniRelations = relations(prestazioni, ({ one, many }) => ({
    specialita: one(specialita, { fields: [prestazioni.specialitaId], references: [specialita.id] }),
    prestazioniErogate: many(prestazioniErogate),
}));

export const prestazioniErogatRelations = relations(prestazioniErogate, ({ one }) => ({
    paziente: one(pazienti, { fields: [prestazioniErogate.pazienteId], references: [pazienti.id] }),
    medico: one(medici, { fields: [prestazioniErogate.medicoId], references: [medici.id] }),
    prestazione: one(prestazioni, { fields: [prestazioniErogate.prestazioneId], references: [prestazioni.id] }),
    stanza: one(stanze, { fields: [prestazioniErogate.stanzaId], references: [stanze.id] }),
    assicurazione: one(assicurazioni, { fields: [prestazioniErogate.assicurazioneId], references: [assicurazioni.id] }),
    azienda: one(aziendeConvenzionate, { fields: [prestazioniErogate.aziendaId], references: [aziendeConvenzionate.id] }),
}));

export const fattureRelations = relations(fatture, ({ one, many }) => ({
    paziente: one(pazienti, { fields: [fatture.pazienteId], references: [pazienti.id] }),
    assicurazione: one(assicurazioni, { fields: [fatture.assicurazioneId], references: [assicurazioni.id] }),
    azienda: one(aziendeConvenzionate, { fields: [fatture.aziendaId], references: [aziendeConvenzionate.id] }),
    righe: many(righeFattura),
    pagamenti: many(pagamenti),
}));

export const righeFatturaRelations = relations(righeFattura, ({ one }) => ({
    fattura: one(fatture, { fields: [righeFattura.fatturaId], references: [fatture.id] }),
    prestazioneErogata: one(prestazioniErogate, { fields: [righeFattura.prestazioneErogatId], references: [prestazioniErogate.id] }),
}));

export const pagamentiRelations = relations(pagamenti, ({ one }) => ({
    fattura: one(fatture, { fields: [pagamenti.fatturaId], references: [fatture.id] }),
    registratoDa: one(utenti, { fields: [pagamenti.registratoDa], references: [utenti.id] }),
}));

export const compensiMediciRelations = relations(compensiMedici, ({ one }) => ({
    medico: one(medici, { fields: [compensiMedici.medicoId], references: [medici.id] }),
}));

export const assicurazioniRelations = relations(assicurazioni, ({ many }) => ({
    pazienti: many(pazienti),
    prestazioniErogate: many(prestazioniErogate),
    fatture: many(fatture),
}));

export const aziendeConvenzionateRelations = relations(aziendeConvenzionate, ({ many }) => ({
    pazienti: many(pazienti),
    prestazioniErogate: many(prestazioniErogate),
    fatture: many(fatture),
}));

export const stanzeRelations = relations(stanze, ({ one, many }) => ({
    specialita: one(specialita, { fields: [stanze.specialitaId], references: [specialita.id] }),
    prestazioniErogate: many(prestazioniErogate),
}));
