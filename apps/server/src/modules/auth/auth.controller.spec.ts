import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockAuthService.register.mockResolvedValue(undefined);

      const result = await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeUndefined();
    });

    it('should handle registration errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const error = new Error('User already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(createUserDto)).rejects.toThrow(error);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should register user with minimum required fields', async () => {
      const createUserDto: CreateUserDto = {
        email: 'minimal@test.com',
        password: 'testpass',
        first_name: 'Jane',
        last_name: 'Smith',
      };

      mockAuthService.register.mockResolvedValue(undefined);

      const result = await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeUndefined();
    });

    it('should handle registration with complex user data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'complex.user+test@example.org',
        password: 'Complex123!@#',
        first_name: 'María José',
        last_name: 'García-López',
      };

      mockAuthService.register.mockResolvedValue(undefined);

      const result = await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should login user successfully and return access token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: 3600,
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginUserDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toBe(expectedResponse);
    });

    it('should handle login with invalid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginUserDto)).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
    });

    it('should handle login with non-existent user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const error = new Error('User not found');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginUserDto)).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
    });

    it('should login with different user types', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'admin@example.com',
        password: 'adminpass123',
      };

      const expectedResponse = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          is_active: true,
        },
        access_token: 'admin.jwt.token',
        expires_in: 7200,
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginUserDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toBe(expectedResponse);
    });

    it('should handle login with special characters in credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'user+test@example.com',
        password: 'p@ssw0rd!',
      };

      const expectedResponse = {
        user: {
          id: 'special-123',
          email: 'user+test@example.com',
          first_name: 'Special',
          last_name: 'User',
          is_active: true,
        },
        access_token: 'special.jwt.token',
        expires_in: 3600,
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginUserDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toBe(expectedResponse);
    });

    it('should handle service throwing specific authentication errors', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const authError = new Error('Authentication failed');
      mockAuthService.login.mockRejectedValue(authError);

      await expect(controller.login(loginUserDto)).rejects.toThrow(authError);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple operations in sequence', async () => {
      const createUserDto: CreateUserDto = {
        email: 'sequence@test.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      const loginUserDto: LoginUserDto = {
        email: 'sequence@test.com',
        password: 'password123',
      };

      const loginResponse = {
        user: {
          id: 'sequence-123',
          email: 'sequence@test.com',
          first_name: 'Test',
          last_name: 'User',
          is_active: true,
        },
        access_token: 'sequence.jwt.token',
        expires_in: 3600,
      };

      mockAuthService.register.mockResolvedValue(undefined);
      mockAuthService.login.mockResolvedValue(loginResponse);

      // First register
      await controller.register(createUserDto);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);

      // Then login
      const result = await controller.login(loginUserDto);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toBe(loginResponse);
    });

    it('should handle concurrent requests', async () => {
      const users = [
        {
          create: {
            email: 'user1@test.com',
            password: 'pass1',
            first_name: 'User',
            last_name: 'One',
          },
          login: { email: 'user1@test.com', password: 'pass1' },
        },
        {
          create: {
            email: 'user2@test.com',
            password: 'pass2',
            first_name: 'User',
            last_name: 'Two',
          },
          login: { email: 'user2@test.com', password: 'pass2' },
        },
      ];

      mockAuthService.register.mockResolvedValue(undefined);

      const registerPromises = users.map((user) =>
        controller.register(user.create),
      );

      await Promise.all(registerPromises);

      expect(mockAuthService.register).toHaveBeenCalledTimes(2);
      expect(mockAuthService.register).toHaveBeenCalledWith(users[0].create);
      expect(mockAuthService.register).toHaveBeenCalledWith(users[1].create);
    });
  });
});
