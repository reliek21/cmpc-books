import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided information.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns an access token.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'user@example.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            is_active: { type: 'boolean', example: true },
          },
        },
        access_token: {
          type: 'string',
          description: 'JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        expires_in: { type: 'number', example: 3600 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
