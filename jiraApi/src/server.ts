import app from "./app";
//import { env } from "./config/environment";
import http from "http";
import https from "https";
import fs from "fs";
import env from './config/environment';

const USE_SSL = env.USE_SSL === 'true';
const PORT = parseInt(env.PORT || '3000', 10);
const SECURE_PORT = parseInt(env.SECURE_PORT || '8400', 10);

let server: http.Server | https.Server;

if (USE_SSL) {
  try {
    const options: https.ServerOptions = {
      key: fs.readFileSync(env.SSL_KEY_PATH!),
      cert: fs.readFileSync(env.SSL_CERT_PATH!),
    };
    server = https.createServer(options, app);
    console.log(`Attempting to start Secure Server on https://localhost:${SECURE_PORT}`);
  } catch (error) {
    console.error('Failed to load SSL certificates. Falling back to HTTP server.', error);
    server = http.createServer(app);
    console.log(`Starting HTTP Server on http://localhost:${PORT} due to SSL error.`);
  }
} else {
  server = http.createServer(app);
  console.log(`Starting HTTP Server on http://localhost:${PORT}`);
}

const startServer = async (): Promise<void> => {
  server.listen(USE_SSL ? SECURE_PORT : PORT, () => {
    if (USE_SSL) {
      console.log(`Secure Server running on https://localhost:${SECURE_PORT}`);
    } else {
      console.log(`Server running on http://localhost:${PORT}`);
    }
  });
};

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});