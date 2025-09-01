import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly registerUseCase: RegisterUseCase,
		private readonly loginUseCase: LoginUseCase,
	) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Register a new user',
		description: 'Creates a new user account with the provided information',
	})
	@ApiBody({
		type: CreateUserDto,
		description: 'User registration data',
	})
	@ApiResponse({
		status: 201,
		description: 'User successfully registered',
		schema: {
			type: 'object',
			properties: {
				access_token: {
					type: 'string',
					description: 'JWT access token',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				},
				user: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174000',
						},
						email: {
							type: 'string',
							example: 'user@example.com',
						},
						first_name: {
							type: 'string',
							example: 'John',
						},
						last_name: {
							type: 'string',
							example: 'Doe',
						},
					},
				},
				expires_in: {
					type: 'number',
					example: 3600,
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request - Invalid input data',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - User with this email already exists',
	})
	async register(@Body() createUserDto: CreateUserDto) {
		return await this.registerUseCase.execute({
			email: createUserDto.email,
			password: createUserDto.password,
			first_name: createUserDto.first_name,
			last_name: createUserDto.last_name,
		});
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'User login',
		description: 'Authenticates a user and returns access tokens',
	})
	@ApiBody({
		type: LoginUserDto,
		description: 'User login credentials',
	})
	@ApiResponse({
		status: 200,
		description: 'Login successful',
		schema: {
			type: 'object',
			properties: {
				access_token: {
					type: 'string',
					description: 'JWT access token',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				},
				user: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174000',
						},
						email: {
							type: 'string',
							example: 'user@example.com',
						},
						first_name: {
							type: 'string',
							example: 'John',
						},
						last_name: {
							type: 'string',
							example: 'Doe',
						},
					},
				},
				expires_in: {
					type: 'number',
					example: 3600,
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request - Invalid credentials',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid email or password',
	})
	async login(@Body() loginUserDto: LoginUserDto) {
		return await this.loginUseCase.execute({
			email: loginUserDto.email,
			password: loginUserDto.password,
		});
	}
}
