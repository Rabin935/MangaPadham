import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Please define the JWT_SECRET environment variable in .env.local");
}

const JWT_SECRET: string = jwtSecret;
const JWT_EXPIRES_IN = "7d";

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

export function generateToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
