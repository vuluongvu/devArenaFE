export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  userId?: number;
  username: string;
  email?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}
