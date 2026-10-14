export type UserRole = "STUDENT" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ErrorResponse {
  error: string;
}