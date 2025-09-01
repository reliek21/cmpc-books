// Domain Interfaces - Core Business Logic Abstractions
// Following SOLID principles: Interface Segregation, Dependency Inversion

export interface IUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface IUpdateUser {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface ICreateUser {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface IAuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface IAuthResponse {
  access_token: string;
  user: IAuthUser;
  expires_in: number;
}

export interface IRegisterResponse {
  message: string;
  success: boolean;
}

// Repository Interfaces - Data Access Abstractions
export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(user: ICreateUser): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}

export interface ITokenRepository {
  storeRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findRefreshToken(
    token: string,
  ): Promise<{ userId: string; expiresAt: Date } | null>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}

// Service Interfaces - Business Logic Abstractions
export interface IUserService {
  createUser(userData: ICreateUser): Promise<IUser>;
  getUserById(id: string): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser>;
  deleteUser(id: string): Promise<void>;
}

export interface IAuthService {
  register(userData: ICreateUser): Promise<IRegisterResponse>;
  login(credentials: ILoginCredentials): Promise<IAuthResponse>;
  validateToken(token: string): Promise<IAuthUser>;
  refreshToken(refreshToken: string): Promise<IAuthTokens>;
}

export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  validatePasswordStrength(password: string): boolean;
}

export interface IJwtService {
  generateAccessToken(payload: object): string;
  generateRefreshToken(payload: object): string;
  verifyAccessToken(token: string): object;
  verifyRefreshToken(token: string): object;
  decodeToken(token: string): object;
  signAsync(payload: object, options?: any): Promise<string>;
  verifyAsync(token: string, options?: any): Promise<IJwtPayload>;
}

// Use Case Interfaces - Application Logic Abstractions
export interface IRegisterUseCase {
  execute(userData: ICreateUser): Promise<IAuthResponse>;
}

export interface ILoginUseCase {
  execute(credentials: ILoginCredentials): Promise<IAuthResponse>;
}

export interface IValidateTokenUseCase {
  execute(token: string): Promise<IAuthUser>;
}

export interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<IAuthTokens>;
}

// Infrastructure Interfaces - External Services Abstractions
export interface IEmailService {
  sendWelcomeEmail(email: string, userData: IAuthUser): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}

export interface ILoggerService {
  info(message: string, meta?: object): void;
  error(message: string, error?: Error, meta?: object): void;
  warn(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
