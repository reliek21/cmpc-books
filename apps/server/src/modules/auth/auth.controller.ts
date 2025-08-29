import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';

/**
 * Auth Controller
 * Handles HTTP requests for authentication operations
 * Uses Use Cases directly following Clean Architecture principles
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  /**
   * Register a new user
   * @param createUserDto - User registration data
   * @returns Authentication response with tokens
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.registerUseCase.execute({
      email: createUserDto.email,
      password: createUserDto.password,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
    });
  }

  /**
   * Login user
   * @param loginUserDto - User login credentials
   * @returns Authentication response with tokens
   */
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.loginUseCase.execute({
      email: loginUserDto.email,
      password: loginUserDto.password,
    });
  }
}
