import {
  pgTable,
  bigserial,
  boolean,
  timestamp,
  varchar,
  integer,
  bigint,
} from "drizzle-orm/pg-core";

/* =========================
   CLIENT TABLE
========================= */

export const client = pgTable(
  "clients",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    isActive: boolean(
      "is_active"
    )
      .notNull()
      .default(true),

    expiryDate: timestamp(
      "expiry_date"
    ).notNull(),

    createdBy: bigint(
      "created_by",
      {
        mode: "number",
      }
    ).notNull(),

    apiKey: varchar(
      "api_key",
      {
        length: 255,
      }
    )
      .notNull()
      .unique(),

    secretKey: varchar(
      "secret_key",
      {
        length: 255,
      }
    ).notNull(),

    timeZone: varchar(
      "time_zone",
      {
        length: 100,
      }
    )
      .notNull()
      .default(
        "Asia/Kolkata"
      ),

    retentionDays: integer(
      "retention_days"
    )
      .notNull()
      .default(1),

    dateFormat: varchar(
      "date_format",
      {
        length: 50,
      }
    )
      .notNull()
      .default(
        "DD/MM/YYYY"
      ),

    defaultLanguage:
      varchar(
        "default_language",
        {
          length: 20,
        }
      )
        .notNull()
        .default("en"),
  }
);