import type { JwtPayload } from './types/jwt-payload.type';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
