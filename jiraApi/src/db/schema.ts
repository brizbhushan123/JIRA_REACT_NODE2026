import {
  pgTable,
  serial,
  bigint,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  index,
  uniqueIndex,
  bigserial,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/* =========================
   PROJECT
========================= */

export const project = pgTable("project", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  pname: varchar("pname", {
    length: 255,
  }).notNull(),

  pkey: varchar("pkey", {
    length: 50,
  })
    .notNull()
    .unique(),

  description: text("description"),

  lead: varchar("lead", {
    length: 255,
  }),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   ISSUE TYPE
========================= */

export const issuetype = pgTable(
  "issuetype",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    pname: varchar("pname", {
      length: 100,
    }).notNull(),

    description: text("description"),
  },

  (table) => ({
    pnameIdx: uniqueIndex("idx_issuetype_pname").on(table.pname),
  }),
);

/* =========================
   ISSUE STATUS
========================= */

export const issuestatus = pgTable(
  "issuestatus",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    pname: varchar("pname", {
      length: 100,
    }).notNull(),

    description: text("description"),
  },

  (table) => ({
    pnameIdx: uniqueIndex("idx_issuestatus_pname").on(table.pname),
  }),
);

/* =========================
   PRIORITY
========================= */

export const priority = pgTable(
  "priority",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    pname: varchar("pname", {
      length: 100,
    }).notNull(),

    description: text("description"),
  },

  (table) => ({
    pnameIdx: uniqueIndex("idx_priority_pname").on(table.pname),
  }),
);

/* =========================
   RESOLUTION
========================= */

export const resolution = pgTable("resolution", {
  id: bigserial("id", {
    mode: "number",
  }).primaryKey(),

  pname: varchar("pname", {
    length: 100,
  }).notNull(),

  description: text("description"),
});

/* =========================
   APP USER
========================= */

export const appUser = pgTable("app_user", {
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

  active: boolean("active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   ADMIN LOGIN
========================= */

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

/* =========================
   JIRA ISSUE
========================= */

export const jiraissue = pgTable(
  "jiraissue",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    issueNum: bigint("issue_num", {
      mode: "number",
    }),

    pkey: varchar("pkey", {
      length: 50,
    })
      .notNull()
      .unique(),

    projectId: bigint("project_id", {
      mode: "number",
    }).references(() => project.id),

    reporterId: bigint("reporter_id", {
      mode: "number",
    }).references(() => appUser.id),

    assigneeId: bigint("assignee_id", {
      mode: "number",
    }).references(() => appUser.id),

    creatorId: bigint("creator_id", {
      mode: "number",
    }).references(() => appUser.id),

    issuetypeId: bigint("issuetype_id", {
      mode: "number",
    }).references(() => issuetype.id),

    issuestatusId: bigint("issuestatus_id", {
      mode: "number",
    }).references(() => issuestatus.id),

    priorityId: bigint("priority_id", {
      mode: "number",
    }).references(() => priority.id),

    resolutionId: bigint("resolution_id", {
      mode: "number",
    }).references(() => resolution.id),

    summary: varchar("summary", {
      length: 500,
    }).notNull(),

    description: text("description"),

    environment: text("environment"),

    parentId: bigint("parent_id", { mode: "number" }).references(
      (): AnyPgColumn => jiraissue.id,
      { onDelete: "set null" },
    ),

    duedate: timestamp("duedate"),

    created: timestamp("created").defaultNow(),

    updated: timestamp("updated").defaultNow(),

    resolved: timestamp("resolved"),
  },

  (table) => ({
    projectIdx: index("idx_issue_project").on(table.projectId),

    assigneeIdx: index("idx_issue_assignee").on(table.assigneeId),

    statusIdx: index("idx_issue_status").on(table.issuestatusId),
  }),
);

/* =========================
   JIRA ACTION
========================= */

export const jiraaction = pgTable(
  "jiraaction",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    issueId: bigint("issue_id", {
      mode: "number",
    }).references(() => jiraissue.id, {
      onDelete: "cascade",
    }),

    authorId: bigint("author_id", {
      mode: "number",
    }).references(() => appUser.id),

    actionbody: text("actionbody").notNull(),

    created: timestamp("created").defaultNow(),

    updated: timestamp("updated").defaultNow(),
  },

  (table) => ({
    issueIdx: index("idx_comment_issue").on(table.issueId),
  }),
);

/* =========================
   WORKLOG
========================= */

export const worklog = pgTable(
  "worklog",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    issueId: bigint("issue_id", {
      mode: "number",
    }).references(() => jiraissue.id, {
      onDelete: "cascade",
    }),

    authorId: bigint("author_id", {
      mode: "number",
    }).references(() => appUser.id),

    timeworked: bigint("timeworked", {
      mode: "number",
    }),

    comment: text("comment"),

    created: timestamp("created").defaultNow(),
  },

  (table) => ({
    issueIdx: index("idx_worklog_issue").on(table.issueId),
  }),
);

/* =========================
   CUSTOM FIELD
========================= */

export const customfield = pgTable("customfield", {
  id: bigserial("id", {
    mode: "number",
  }).primaryKey(),

  cfname: varchar("cfname", {
    length: 255,
  }).notNull(),

  customfieldtypekey: varchar("customfieldtypekey", {
    length: 255,
  }),

  description: text("description"),
});

/* =========================
   CUSTOM FIELD VALUE
========================= */

export const customfieldvalue = pgTable(
  "customfieldvalue",
  {
    id: bigserial("id", {
      mode: "number",
    }).primaryKey(),

    issueId: bigint("issue_id", {
      mode: "number",
    }).references(() => jiraissue.id, {
      onDelete: "cascade",
    }),

    customfieldId: bigint("customfield_id", {
      mode: "number",
    }).references(() => customfield.id),

    stringvalue: text("stringvalue"),

    numbervalue: numeric("numbervalue"),

    textvalue: text("textvalue"),

    datevalue: timestamp("datevalue"),
  },

  (table) => ({
    issueIdx: index("idx_customfield_issue").on(table.issueId),
  }),
);
