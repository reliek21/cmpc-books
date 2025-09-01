import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/users.service';
import {
	ILoginUseCase,
	ILoginCredentials,
	IAuthResponse,
	IAuthUser,
} from '../../../common/interfaces';

/**
 * Login Use Case
 * Orchestrates user authentication following Clean Architecture principles
 * Follows Single Responsibility Principle
 */
@Injectable()
export class LoginUseCase implements ILoginUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Execute user login
	 * @param credentials - User login credentials
	 * @returns Authentication response with tokens
	 */
	async execute(credentials: ILoginCredentials): Promise<IAuthResponse> {
		// Validate user credentials
		const user = await this.userService.validateUserCredentials(
			credentials.email,
			credentials.password,
		);

		// Check if user is active
		if (!user.is_active) {
			throw new UnauthorizedException('Account is not active');
		}

		// Generate access token
		const accessToken = this.jwtService.sign({
			sub: user.id,
			email: user.email,
		});

		// Create auth user object
		const authUser: IAuthUser = {
			id: user.id,
			email: user.email,
			first_name: user.first_name,
			last_name: user.last_name,
		};

		return {
			access_token: accessToken,
			user: authUser,
			expires_in: 86400, // 24 hours in seconds
		};
	}
}
