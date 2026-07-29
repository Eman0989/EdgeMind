export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface BackendUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
