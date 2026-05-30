-- ============================================
-- JIRA SIMPLIFIED DATABASE SCHEMA (PostgreSQL)
-- ============================================

-- PROJECT TABLE
CREATE TABLE project (
    id BIGSERIAL PRIMARY KEY,
    pname VARCHAR(255) NOT NULL,
    pkey VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    lead VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISSUE TYPE TABLE
CREATE TABLE issuetype (
    id BIGSERIAL PRIMARY KEY,
    pname VARCHAR(100) NOT NULL,
    description TEXT
);

-- ISSUE STATUS TABLE
CREATE TABLE issuestatus (
    id BIGSERIAL PRIMARY KEY,
    pname VARCHAR(100) NOT NULL,
    description TEXT
);

-- PRIORITY TABLE
CREATE TABLE priority (
    id BIGSERIAL PRIMARY KEY,
    pname VARCHAR(100) NOT NULL,
    description TEXT
);

-- RESOLUTION TABLE
CREATE TABLE resolution (
    id BIGSERIAL PRIMARY KEY,
    pname VARCHAR(100) NOT NULL,
    description TEXT
);

-- USERS TABLE
CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    user_key VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MAIN ISSUE TABLE
CREATE TABLE jiraissue (
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
);

-- COMMENTS TABLE
CREATE TABLE jiraaction (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    author_id BIGINT REFERENCES app_user(id),

    actionbody TEXT NOT NULL,

    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WORKLOG TABLE
CREATE TABLE worklog (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    author_id BIGINT REFERENCES app_user(id),

    timeworked BIGINT,
    comment TEXT,

    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOM FIELD TABLE
CREATE TABLE customfield (
    id BIGSERIAL PRIMARY KEY,

    cfname VARCHAR(255) NOT NULL,
    customfieldtypekey VARCHAR(255),

    description TEXT
);

-- CUSTOM FIELD VALUES
CREATE TABLE customfieldvalue (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    customfield_id BIGINT REFERENCES customfield(id),

    stringvalue TEXT,
    numbervalue NUMERIC,
    textvalue TEXT,
    datevalue TIMESTAMP
);

-- ISSUE HISTORY GROUP
CREATE TABLE changegroup (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    author_id BIGINT REFERENCES app_user(id),

    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISSUE HISTORY ITEMS
CREATE TABLE changeitem (
    id BIGSERIAL PRIMARY KEY,

    group_id BIGINT REFERENCES changegroup(id) ON DELETE CASCADE,

    fieldtype VARCHAR(255),
    field VARCHAR(255),

    oldvalue TEXT,
    oldstring TEXT,

    newvalue TEXT,
    newstring TEXT
);

-- ISSUE LINK TYPES
CREATE TABLE issuelinktype (
    id BIGSERIAL PRIMARY KEY,

    linkname VARCHAR(255),
    inward VARCHAR(255),
    outward VARCHAR(255)
);

-- ISSUE LINKS
CREATE TABLE issuelink (
    id BIGSERIAL PRIMARY KEY,

    source_issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,
    destination_issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    linktype_id BIGINT REFERENCES issuelinktype(id)
);

-- COMPONENTS
CREATE TABLE component (
    id BIGSERIAL PRIMARY KEY,

    project_id BIGINT REFERENCES project(id),

    cname VARCHAR(255),
    description TEXT
);

-- PROJECT VERSIONS
CREATE TABLE projectversion (
    id BIGSERIAL PRIMARY KEY,

    project_id BIGINT REFERENCES project(id),

    vname VARCHAR(255),

    released BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,

    startdate TIMESTAMP,
    releasedate TIMESTAMP
);

-- FILE ATTACHMENTS
CREATE TABLE fileattachment (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    filename VARCHAR(500),
    mimetype VARCHAR(255),
    filesize BIGINT,

    author_id BIGINT REFERENCES app_user(id),

    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LABELS
CREATE TABLE label (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    label VARCHAR(255)
);

-- WATCHERS
CREATE TABLE watcher (
    id BIGSERIAL PRIMARY KEY,

    issue_id BIGINT REFERENCES jiraissue(id) ON DELETE CASCADE,

    user_id BIGINT REFERENCES app_user(id)
);

-- INDEXES
CREATE INDEX idx_issue_project ON jiraissue(project_id);
CREATE INDEX idx_issue_assignee ON jiraissue(assignee_id);
CREATE INDEX idx_issue_status ON jiraissue(issuestatus_id);
CREATE INDEX idx_comment_issue ON jiraaction(issue_id);
CREATE INDEX idx_worklog_issue ON worklog(issue_id);
CREATE INDEX idx_customfield_issue ON customfieldvalue(issue_id);