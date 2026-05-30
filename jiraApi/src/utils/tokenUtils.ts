import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";


export const ROLE_ADMIN = "admin";
export const ROLE_PROCTOR = "proctor";
export const ROLE_CANDIDATE = "candidate";
export const ROLE_SUPERPROCTOR = "super_proctor";


export function generateToken(payload: any, role: string): string {
  const now = Math.floor(Date.now() / 1000);
  const secretKey = process.env.JWT_SECRET?? "default_secret";

  const payloadData = {
    data: payload,
    role: role,
    iat: now,
  };
  return jwt.sign(payloadData, secretKey, { algorithm: "HS256" });
}

export function getAccessTokenCookieConfig(
  token: string,
  role: string = ROLE_ADMIN
) {
  const accessTokenExp = parseInt(process.env.ACCESS_TOKEN_EXP ?? "900");

  return {
    name: `access_token_${role}_${process.env.NODE_ENV}`,
    value: token,
    options: {
      maxAge: accessTokenExp * 1000,
      path: "/",
      domain: process.env.MAIN_DOMAIN || undefined,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none" as const,
    },
  };
}
export function getConfiguration(socketName: string): string
   {
    const socketUserName = socketName;

    const timestamp  = Math.floor(Date.now() / 1000);
    const userId = socketUserName;
    const turnUsername = `${timestamp}:${userId}`;

    const staticAuthSecret =  process.env.SDK_SECRET_KEY || '';

    // password = HMAC_SHA1(secret, username) and base64 encode it
   const turnPassword = crypto
                        .createHmac("sha1", staticAuthSecret)
                        .update(turnUsername)
                        .digest("base64");
    const configuration = {
        url: process.env.SDK_URL,
        signal_node_url: process.env.SDK_SIGNAL_NODE_URL,
        recording_node_url: process.env.SDK_RECORDING_NODE_URL,
        turn_url: process.env.SDK_TURN_URL,
        stun_url: process.env.SDK_STUN_URL,
        turn_username: turnUsername,
        turn_password: turnPassword,
        stun_username: turnUsername,
        stun_password: turnPassword,
        env: process.env.SDK_ENV,
        speechURL: process.env.SDK_SPEECH_URL,
    };
    return btoa(JSON.stringify(configuration));
   }

   