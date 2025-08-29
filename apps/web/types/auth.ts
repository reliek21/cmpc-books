// Shared types for authentication - aligned with backend interfaces

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
