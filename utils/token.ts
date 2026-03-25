import jwt, { JwtPayload } from "jsonwebtoken";

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

function isAuthTokenPayload(
  decoded: string | JwtPayload
): decoded is JwtPayload & AuthTokenPayload {
  return (
    typeof decoded !== "string" &&
    typeof decoded.userId === "string" &&
    typeof decoded.email === "string"
  );
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (!isAuthTokenPayload(decoded)) {
    throw new Error("Invalid token payload.");
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}
