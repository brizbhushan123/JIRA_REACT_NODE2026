"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchema = void 0;
const db_1 = require("./db");
const initSchema = async () => {
    const statements = [
        `CREATE TABLE IF NOT EXISTS project (
      id BIGSERIAL PRIMARY KEY,
      pname VARCHAR(255) NOT NULL,
      pkey VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      lead VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS issuetype (
      id BIGSERIAL PRIMARY KEY,
      pname VARCHAR(100) NOT NULL,
      description TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS issuestatus (
      id BIGSERIAL PRIMARY KEY,
      pname VARCHAR(100) NOT NULL,
      description TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS priority (
      id BIGSERIAL PRIMARY KEY,
      pname VARCHAR(100) NOT NULL,
      description TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS resolution (
      id BIGSERIAL PRIMARY KEY,
      pname VARCHAR(100) NOT NULL,
      description TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS app_user (
      id BIGSERIAL PRIMARY KEY,
      user_key VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255),
      display_name VARCHAR(255),
      password_hash VARCHAR(255),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `ALTER TABLE app_user ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`,
        `CREATE TABLE IF NOT EXISTS admin_login (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS jiraissue (
      id BIGSERIAL PRIMARY KEY,
      issue_num BIGINT,
      pkey VARCHAR(50) UNIQUE NOT NULL,
      project_id BIGINT REFERENCES project(id),
      reporter_id BIGINT REFERENCES app_user(id),
      assignee_id BIGINT REFERENCES app_user(id),
      creator_id BIGINT REFERENCES app_user(id),
      issuetype_id BIGINT REFERENCES issuetype(id),
      issuestatus_id BIGINT REFERENCES issuestatus(id),
      priority_id BIGINT REFERENCES priority(id),
      resolution_id BIGINT REFERENCES resolution(id),
      summary VARCHAR(500) NOT NULL,
      description TEXT,
      environment TEXT,
      duedate TIMESTAMP,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS jiraaction (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      author_id BIGINT REFERENCES app_user(id),
      actionbody TEXT NOT NULL,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS worklog (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      author_id BIGINT REFERENCES app_user(id),
      timeworked BIGINT,
      comment TEXT,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS customfield (
      id BIGSERIAL PRIMARY KEY,
      cfname VARCHAR(255) NOT NULL,
      customfieldtypekey VARCHAR(255),
      description TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS customfieldvalue (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      customfield_id BIGINT REFERENCES customfield(id),
      stringvalue TEXT,
      numbervalue NUMERIC,
      textvalue TEXT,
      datevalue TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS changegroup (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      author_id BIGINT REFERENCES app_user(id),
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS changeitem (
      id BIGSERIAL PRIMARY KEY,
      group_id BIGINT REFERENCES changegroup(id) ON DELETE CASCADE,
      fieldtype VARCHAR(255),
      field VARCHAR(255),
      oldvalue TEXT,
      oldstring TEXT,
      newvalue TEXT,
      newstring TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS issuelinktype (
      id BIGSERIAL PRIMARY KEY,
      linkname VARCHAR(255),
      inward VARCHAR(255),
      outward VARCHAR(255)
    )`,
        `CREATE TABLE IF NOT EXISTS issuelink (
      id BIGSERIAL PRIMARY KEY,
      source_issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      destination_issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      linktype_id BIGINT REFERENCES issuelinktype(id)
    )`,
        `CREATE TABLE IF NOT EXISTS component (
      id BIGSERIAL PRIMARY KEY,
      project_id BIGINT REFERENCES project(id),
      cname VARCHAR(255),
      description TEXT
    )`,
        `CREATE TABLE IF NOT EXISTS projectversion (
      id BIGSERIAL PRIMARY KEY,
      project_id BIGINT REFERENCES project(id),
      vname VARCHAR(255),
      released BOOLEAN DEFAULT FALSE,
      archived BOOLEAN DEFAULT FALSE,
      startdate TIMESTAMP,
      releasedate TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS fileattachment (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      filename VARCHAR(500),
      mimetype VARCHAR(255),
      filesize BIGINT,
      author_id BIGINT REFERENCES app_user(id),
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS label (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      label VARCHAR(255)
    )`,
        `CREATE TABLE IF NOT EXISTS watcher (
      id BIGSERIAL PRIMARY KEY,
      issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
      user_id BIGINT REFERENCES app_user(id)
    )`,
        `CREATE INDEX IF NOT EXISTS idx_issue_project ON jiraissue(project_id)`,
        `CREATE INDEX IF NOT EXISTS idx_issue_assignee ON jiraissue(assignee_id)`,
        `CREATE INDEX IF NOT EXISTS idx_issue_status ON jiraissue(issuestatus_id)`,
        `CREATE INDEX IF NOT EXISTS idx_comment_issue ON jiraaction(issue_id)`,
        `CREATE INDEX IF NOT EXISTS idx_worklog_issue ON worklog(issue_id)`,
        `CREATE INDEX IF NOT EXISTS idx_customfield_issue ON customfieldvalue(issue_id)`,
        /* unique indexes on lookup pname so ON CONFLICT (pname) works */
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_issuetype_pname   ON issuetype(pname)`,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_issuestatus_pname ON issuestatus(pname)`,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_priority_pname    ON priority(pname)`,
        /* seed lookup data */
        `INSERT INTO issuetype (pname, description) VALUES
       ('Story',    'User story or requirement'),
       ('Bug',      'Bug or defect'),
       ('Task',     'General task'),
       ('Epic',     'Large feature or initiative'),
       ('Sub-task', 'Sub-task of a parent issue')
     ON CONFLICT (pname) DO NOTHING`,
        `INSERT INTO issuestatus (pname, description) VALUES
       ('To Do',       'Work not started'),
       ('In Progress', 'Work in progress'),
       ('In Review',   'Under review'),
       ('Done',        'Completed work')
     ON CONFLICT (pname) DO NOTHING`,
        `INSERT INTO priority (pname, description) VALUES
       ('Highest', 'Critical — must fix immediately'),
       ('High',    'High priority'),
       ('Medium',  'Normal priority'),
       ('Low',     'Low priority'),
       ('Lowest',  'Nice to have')
     ON CONFLICT (pname) DO NOTHING`,
        /* seed a default project if none exists */
        `INSERT INTO project (pname, pkey, description)
     SELECT 'JiraFlow', 'JF', 'Default project'
     WHERE NOT EXISTS (SELECT 1 FROM project LIMIT 1)`,
        `INSERT INTO admin_login (username, email, password_hash, display_name, active)
     VALUES ('admin', 'admin@example.com', '$2b$10$rIPGNnTuCQLUvhnYCWX8auKfdWr0K7TXMbIHidafHebc3Eb1eKMjy', 'System Admin', TRUE)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       active = TRUE`,
    ];
    for (const sql of statements) {
        await db_1.pool.query(sql);
    }
    console.log('✅ Database schema initialised');
};
exports.initSchema = initSchema;
