import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/users.service';
import { PasswordService } from '../../../core/helpers/password.service';
import {
  IRegisterUseCase,
  ICreateUser,
  IAuthResponse,
  IAuthUser,
} from '../../../common/interfaces';

/**
 * Register Use Case
 * Orchestrates user registration following Clean Architecture principles
 * Follows Single Responsibility Principle
 */
@Injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Execute user registration
   * @param userData - User registration data
   * @returns Authentication response with tokens
   */
  async execute(userData: ICreateUser): Promise<IAuthResponse> {
    // Validate password strength
    if (!this.passwordService.validatePasswordStrength(userData.password)) {
      throw new ConflictException(
        'Password must be at least 8 characters long and contain letters and numbers',
      );
    }

    // Create user through service
    const user = await this.userService.createUser(userData);

    // Generate tokens
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
