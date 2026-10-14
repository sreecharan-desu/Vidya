import bcrypt from "bcrypt";
import type { EmailOtpPurpose } from "@prisma/client";
import { prisma } from "../db";
import { signAccessToken } from "./jwt";
import { createMailer, sendOtpEmail, type Mailer } from "./mailer";
import { generateOtp, hashOtp, OTP_TTL_MS, verifyOtp } from "./otp";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const clearOtp = {
  emailOtpHash: null,
  emailOtpExpiresAt: null,
  emailOtpPurpose: null,
} as const;

const issueOtp = async (
  userId: string,
  email: string,
  purpose: EmailOtpPurpose,
  mailer: Mailer
): Promise<void> => {
  const otp = generateOtp();
  const emailOtpHash = await hashOtp(otp);
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailOtpHash,
      emailOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      emailOtpPurpose: purpose,
    },
  });
  await sendOtpEmail(mailer, { to: email, otp, purpose });
};

export const createAuthService = (mailer: Mailer = createMailer()) => {
  const register = async (input: {
    name: string;
    email: string;
    password: string;
  }) => {
    const email = normalizeEmail(input.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AuthError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        role: "STUDENT",
      },
    });

    await issueOtp(user.id, email, "VERIFY_EMAIL", mailer);
    return { message: "Registered. Check your email for a verification code." };
  };

  const verifyEmail = async (input: { email: string; otp: string }) => {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid verification code", 400);
    }
    if (user.emailVerifiedAt) {
      return { message: "Email already verified." };
    }
    if (
      user.emailOtpPurpose !== "VERIFY_EMAIL" ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      throw new AuthError("Verification code expired", 400);
    }
    const ok = await verifyOtp(input.otp, user.emailOtpHash);
    if (!ok) {
      throw new AuthError("Invalid verification code", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        ...clearOtp,
      },
    });

    return { message: "Email verified. You can log in now." };
  };

  const login = async (input: { email: string; password: string }) => {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid email or password", 401);
    }

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      throw new AuthError("Invalid email or password", 401);
    }
    if (!user.emailVerifiedAt) {
      throw new AuthError("Email not verified", 403);
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  };

  const forgotPassword = async (input: { email: string }) => {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });
    // Always same response — no email enumeration.
    const message =
      "If that email is registered, a reset code has been sent.";

    if (user) {
      await issueOtp(user.id, email, "RESET_PASSWORD", mailer);
    }

    return { message };
  };

  const resetPassword = async (input: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid or expired reset code", 400);
    }
    if (
      user.emailOtpPurpose !== "RESET_PASSWORD" ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      throw new AuthError("Invalid or expired reset code", 400);
    }
    const ok = await verifyOtp(input.otp, user.emailOtpHash);
    if (!ok) {
      throw new AuthError("Invalid or expired reset code", 400);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        ...clearOtp,
      },
    });

    return { message: "Password updated. You can log in now." };
  };

  const me = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AuthError("Unauthorized", 401);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  };

  return {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    me,
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
