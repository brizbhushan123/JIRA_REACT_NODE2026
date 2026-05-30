import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || '3000',
  SECURE_PORT: process.env.SECURE_PORT || '8400',
  NODE_ENV: process.env.NODE_ENV || "development",
  USE_SSL: process.env.USE_SSL || "false",
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || "",
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || "",

  // Database configuration
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE || "jira_db",  
};

export default env;