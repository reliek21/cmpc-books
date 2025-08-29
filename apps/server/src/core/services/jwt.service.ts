import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService } from '../../common/interfaces';

/**
 * JWT Service Implementation
 * Follows Single Responsibility Principle - handles only JWT operations
 */
@Injectable()
export class JwtService implements IJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  /**
   * Generate access token
   * @param payload - Payload to encode
   * @returns JWT access token
   */
  generateAccessToken(payload: object): string {
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
    });
  }

  /**
   * Generate refresh token
   * @param payload - Payload to encode
   * @returns JWT refresh token
   */
  generateRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    });
  }

  /**
   * Verify access token
   * @param token - JWT token to verify
   * @returns Decoded payload
   */
  verifyAccessToken(token: string): object {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      });
    } catch {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT token to verify
   * @returns Decoded payload
   */
  verifyRefreshToken(token: string): object {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification
   * @param token - JWT token to decode
   * @returns Decoded payload
   */
  decodeToken(token: string): object {
    try {
      return this.jwtService.decode(token) || {};
    } catch {
      throw new Error('Failed to decode token');
    }
  }
}
