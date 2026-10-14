import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "./jwt";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "./schemas";
import { AuthError, createAuthService, type AuthService } from "./service";

const sendAuthError = (res: FastifyReply, err: unknown) => {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).send({ error: err.message });
  }
  throw err;
};

const parseBody = <T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false } },
  body: unknown,
  res: FastifyReply
): T | null => {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    res.status(400).send({ error: "Invalid request body" });
    return null;
  }
  return parsed.data;
};

export const registerAuthRoutes = (
  app: FastifyInstance,
  auth: AuthService = createAuthService()
): void => {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const body = parseBody(registerBodySchema, req.body, res);
      if (!body) return;
      const result = await auth.register(body);
      return res.status(201).send(result);
    } catch (err) {
      return sendAuthError(res, err);
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const body = parseBody(verifyEmailBodySchema, req.body, res);
      if (!body) return;
      const result = await auth.verifyEmail(body);
      return res.status(200).send(result);
    } catch (err) {
      return sendAuthError(res, err);
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const body = parseBody(loginBodySchema, req.body, res);
      if (!body) return;
      const result = await auth.login(body);
      return res.status(200).send(result);
    } catch (err) {
      return sendAuthError(res, err);
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const body = parseBody(forgotPasswordBodySchema, req.body, res);
      if (!body) return;
      const result = await auth.forgotPassword(body);
      return res.status(200).send(result);
    } catch (err) {
      return sendAuthError(res, err);
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const body = parseBody(resetPasswordBodySchema, req.body, res);
      if (!body) return;
      const result = await auth.resetPassword(body);
      return res.status(200).send(result);
    } catch (err) {
      return sendAuthError(res, err);
    }
  });

  app.get("/api/auth/me", async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        return res.status(401).send({ error: "Unauthorized" });
      }
      const token = header.slice("Bearer ".length).trim();
      if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
      }
      let payload;
      try {
        payload = verifyAccessToken(token);
      } catch {
        return res.status(401).send({ error: "Unauthorized" });
      }
      const result = await auth.me(payload.sub);
      return res.status(200).send(result);
    } catch (err) {
      return sendAuthError(res, err);
    }
  });
};
