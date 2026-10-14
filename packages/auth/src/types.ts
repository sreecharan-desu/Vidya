export type UserRole = "STUDENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface ErrorResponse {
  error: string;
}