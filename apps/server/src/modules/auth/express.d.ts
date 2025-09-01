import type { JwtPayload } from './jwt-payload.interface';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
