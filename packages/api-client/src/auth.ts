import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
  AuthUser,
} from "@vidya/auth";

import { ApiClient } from "./client";

export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  register(body: RegisterRequest) {
    return this.client.post<MessageResponse>(
      "/api/auth/register",
      body
    );
  }

  verifyEmail(body: VerifyEmailRequest) {
    return this.client.post<MessageResponse>(
      "/api/auth/verify-email",
      body
    );
  }

  login(body: LoginRequest) {
    return this.client.post<LoginResponse>(
      "/api/auth/login",
      body
    );
  }

  forgotPassword(body: ForgotPasswordRequest) {
    return this.client.post<MessageResponse>(
      "/api/auth/forgot-password",
      body
    );
  }

  resetPassword(body: ResetPasswordRequest) {
    return this.client.post<MessageResponse>(
      "/api/auth/reset-password",
      body
    );
  }

  me() {
    return this.client.get<AuthUser>(
      "/api/auth/me"
    );
  }
}