import jwt from "jsonwebtoken";

export type JwtPayload = {
  sub: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  name: string;
};

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "dev-only-jwt-secret-change-me";
  }
  return secret;
};

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret(), { expiresIn: "7d" });

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }
  const { sub, email, role, name } = decoded as JwtPayload;
  if (!sub || !email || !role || !name) {
    throw new Error("Invalid token payload");
  }
  return { sub, email, role, name };
};
