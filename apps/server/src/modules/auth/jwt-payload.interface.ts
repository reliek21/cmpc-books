export interface JwtPayload {
  sub: string; // User ID (subject)
  email: string; // User email
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
