"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiMessages = void 0;
exports.apiMessages = {
    SUCCESS: {
        DEFAULT: { code: 2000, message_key: "default" },
        SESSION_CREATED: { code: 2001, message_key: "session_created" },
        CLIENT_CREATED: { code: 2002, message_key: "client_created" },
        TEMPLATE_VALID: { code: 2003, message_key: "template_valid" },
        SDK_LOGIN_SUCCESS: { code: 2004, message_key: "sdk_login_success" },
        // Jira auth
        LOGIN_SUCCESS: { code: 2010, message_key: "login_success" },
        REGISTER_SUCCESS: { code: 2011, message_key: "register_success" },
        LOGOUT_SUCCESS: { code: 2012, message_key: "logout_success" },
        // Jira issues
        ISSUE_CREATED: { code: 2013, message_key: "issue_created" },
        DATA_FETCHED: { code: 2014, message_key: "data_fetched" },
        COMMENT_ADDED: { code: 2015, message_key: "comment_added" },
    },
    ERROR: {
        DEFAULT: { code: 4000, message_key: "error_default" },
        VALIDATION_ERROR: { code: 4220, message_key: "validation_error" },
        TOKEN_INVALID: { code: 4010, message_key: "token_invalid" },
        TOKEN_MISSING: { code: 4044, message_key: "token_missing" },
        CLIENT_NOT_FOUND: { code: 4040, message_key: "client_not_found" },
        CLIENT_DEACTIVE: { code: 4030, message_key: "client_deactive" },
        DATABASE_ERROR: { code: 5001, message_key: "database_error" },
        INTERNAL_SERVER_ERROR: { code: 5000, message_key: "internal_server_error" },
        TEMPLATE_NOT_FOUND: { code: 4041, message_key: "template_not_found" },
        GROUP_NOT_FOUND: { code: 4042, message_key: "group_not_found" },
        LANGUAGE_NOT_FOUND: { code: 4043, message_key: "language_not_found" },
        // Jira auth
        EMAIL_EXISTS: { code: 4091, message_key: "email_exists" },
        INVALID_CREDENTIALS: { code: 4011, message_key: "invalid_credentials" },
        NOT_AUTHENTICATED: { code: 4012, message_key: "not_authenticated" },
        SESSION_EXPIRED: { code: 4013, message_key: "session_expired" },
        // Jira issues
        PROJECT_NOT_FOUND: { code: 4045, message_key: "project_not_found" },
        STATUS_NOT_CONFIGURED: { code: 5002, message_key: "status_not_configured" },
    },
};
