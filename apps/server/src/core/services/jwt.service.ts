import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService } from '../../common/interfaces';

/**
 * JWT Service Implementation
 * Handles JWT token operations
 * Follows Single Responsibility Principle
 */
@Injectable()
export class JwtService implements IJwtService {
	constructor(private readonly nestJwtService: NestJwtService) {}

	/**
	 * Generate access token
	 * @param payload - Token payload
	 * @returns JWT access token
	 */
	generateAccessToken(payload: object): string {
		return this.nestJwtService.sign(payload);
	}

	/**
	 * Generate refresh token
	 * @param payload - Token payload
	 * @returns JWT refresh token
	 */
	generateRefreshToken(payload: object): string {
		return this.nestJwtService.sign(payload, { expiresIn: '7d' });
	}

	/**
	 * Verify access token
	 * @param token - JWT token
	 * @returns Decoded payload
	 */
	verifyAccessToken(token: string): object {
		try {
			return this.nestJwtService.verify(token);
		} catch {
			throw new Error('Invalid access token');
		}
	}

	/**
	 * Verify refresh token
	 * @param token - JWT refresh token
	 * @returns Decoded payload
	 */
	verifyRefreshToken(token: string): object {
		try {
			return this.nestJwtService.verify(token);
		} catch {
			throw new Error('Invalid refresh token');
		}
	}

	/**
	 * Decode token without verification
	 * @param token - JWT token
	 * @returns Decoded payload
	 */
	decodeToken(token: string): object {
		return this.nestJwtService.decode(token) || {};
	}
}
