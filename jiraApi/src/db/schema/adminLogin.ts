import {
  pgTable,
  bigint,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  index,
  uniqueIndex,
  bigserial,
} from "drizzle-orm/pg-core";

export const adminLogin = pgTable("admin_login", {
  id: bigserial("id", {
    mode: "number",
  }).primaryKey(),

  username: varchar("username", {
    length: 255,
  })
    .notNull()
    .unique(),

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  displayName: varchar("display_name", {
    length: 255,
  }),

  active: boolean("active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});