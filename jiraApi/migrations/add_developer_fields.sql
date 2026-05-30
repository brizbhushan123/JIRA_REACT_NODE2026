-- Migration: Add developer profile fields to app_user
-- Run with: psql -h 127.0.0.1 -U postgres -d jira_db -f migrations/add_developer_fields.sql

ALTER TABLE app_user
  ADD COLUMN IF NOT EXISTS phone        VARCHAR(50),
  ADD COLUMN IF NOT EXISTS employee_id  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS job_title    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS team         VARCHAR(100);
