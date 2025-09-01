import { Injectable } from '@nestjs/common';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import {
	IAuthService,
	ICreateUser,
	ILoginCredentials,
	IAuthResponse,
	IAuthUser,
	IAuthTokens,
} from '../../common/interfaces';

/**
 * Auth Service Implementation
 * Orchestrates authentication operations using Use Cases
 * Follows Single Responsibility Principle and Dependency Inversion
 */
@Injectable()
export class AuthService implements IAuthService {
	constructor(
		private readonly registerUseCase: RegisterUseCase,
		private readonly loginUseCase: LoginUseCase,
	) {}

	/**
	 * Register a new user
	 * @param userData - User registration data
	 */
	async register(userData: ICreateUser): Promise<void> {
		await this.registerUseCase.execute(userData);
	}

	/**
	 * Authenticate user and return tokens
	 * @param credentials - User login credentials
	 * @returns Authentication response
	 */
	async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
		return await this.loginUseCase.execute(credentials);
	}

	/**
	 * Validate JWT token and return user info
	 * @param _token - JWT access token
	 * @returns Authenticated user information
	 */
	validateToken(_token: string): Promise<IAuthUser> {
		// Prevent unused parameter warning
		void _token;
		// This will be implemented when we create the ValidateTokenUseCase
		throw new Error('Method not implemented yet');
	}

	/**
	 * Refresh access token using refresh token
	 * @param _refreshToken - JWT refresh token
	 * @returns New authentication tokens
	 */
	refreshToken(_refreshToken: string): Promise<IAuthTokens> {
		// Prevent unused parameter warning
		void _refreshToken;
		// This will be implemented when we create the RefreshTokenUseCase
		throw new Error('Method not implemented yet');
	}

	/**
	 * Logout user by invalidating tokens
	 * @param _userId - User ID to logout
	 */
	logout(_userId: string): Promise<void> {
		// Prevent unused parameter warning
		void _userId;
		// This will be implemented when we add token repository
		throw new Error('Method not implemented yet');
	}
}
