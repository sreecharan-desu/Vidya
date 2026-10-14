import {
  LoginRequest,
  LoginResponse,
  AuthUser,
} from "@vidya/auth";

import { ApiClient } from "./client";

export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  login(body: LoginRequest) {
    return this.client.post<LoginResponse>(
      "/api/auth/login",
      body
    );
  }

  me() {
    return this.client.get<AuthUser>(
      "/api/auth/me"
    );
  }
}