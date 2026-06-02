// src/utils/constants.js

// ======================
// API
// ======================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  USERS: "/users",
  PROFILE: "/profile",
};

// ======================
// ROUTES
// ======================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  USER: "/user",
  ADMIN: "/admin",
};

// ======================
// USER ROLES
// ======================

export const USER_ROLES = {
  ADMIN: "admin",
  HR: "hr",
  CANDIDATE: "candidate",
};

// ======================
// STATUS
// ======================

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
};

// ======================
// LOCAL STORAGE KEYS
// ======================

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
};

// ======================
// MESSAGES
// ======================

export const SUCCESS_MESSAGES = {
  LOGIN: "Login successful",
  SAVE: "Data saved successfully",
};

export const ERROR_MESSAGES = {
  SERVER_ERROR: "Something went wrong",
  INVALID_CREDENTIALS: "Invalid email or password",
};

// ======================
// REGEX
// ======================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE: /^[0-9]{10}$/,
};

// ======================
// PAGINATION
// ======================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

// ======================
// APP CONFIG
// ======================

export const APP_CONFIG = {
  APP_NAME: "ThinkX Interview",
  VERSION: "1.0.0",
};