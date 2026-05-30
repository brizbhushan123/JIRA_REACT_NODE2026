import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  bigserial,
} from "drizzle-orm/pg-core";

export const user = pgTable("app_user", {
  id: bigserial("id", {
    mode: "number",
  }).primaryKey(),

  userKey: varchar("user_key", {
    length: 255,
  })
    .notNull()
    .unique(),

  username: varchar("username", {
    length: 255,
  })
    .notNull()
    .unique(),

  email: varchar("email", {
    length: 255,
  }),

  displayName: varchar("display_name", {
    length: 255,
  }),

  passwordHash: varchar("password_hash", {
    length: 255,
  }),

  role: varchar("role", { length: 50 }).notNull().default('member'),

  active: boolean("active").default(true),

  avatarUrl: text("avatar_url"),

  phone: varchar("phone", { length: 50 }),

  employeeId: varchar("employee_id", { length: 100 }),

  jobTitle: varchar("job_title", { length: 100 }),

  team: varchar("team", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow(),
});
