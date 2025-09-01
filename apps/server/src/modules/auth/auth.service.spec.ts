import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UserRepository } from '../users/repositories/user.repository';
import { PasswordService } from '../../core';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  ILoginCredentials,
  IJwtPayload,
  IAuthResponse,
  IAuthTokens,
} from '../../common/interfaces';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  // Providers (mocks)
  let config: { get: jest.Mock };
  let repo: {
    exists: jest.Mock;
    create: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
  };
  let pwd: { hashPassword: jest.Mock; comparePassword: jest.Mock };
  let jwt: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
    decode: jest.Mock;
  };

  // Common fixtures
  const now = new Date();
  const userWithPassword: Partial<User> & { password: string } = {
    id: 'u-123',
    email: 'john@doe.com',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    password: 'hashed:abc',
  };

  const userSanitized = {
    id: 'u-123',
    email: 'john@doe.com',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  const createDto: CreateUserDto = {
    email: 'John@Doe.com',
    password: 'StrongPass123!',
    first_name: 'John',
    last_name: 'Doe',
  };

  const loginDto: ILoginCredentials = {
    email: 'john@doe.com',
    password: 'StrongPass123!',
  };

  beforeEach(async () => {
    config = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'SECURITY.JWT_SECRET':
            return 'access-secret';
          case 'SECURITY.JWT_REFRESH':
            return 'refresh-secret';
          case 'SECURITY.JWT_SECRET_TTL':
            return '15m';
          case 'SECURITY.JWT_REFRESH_TTL':
            return '7d';
          default:
            return undefined;
        }
      }),
    };

    repo = {
      exists: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    pwd = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    jwt = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: repo },
        { provide: PasswordService, useValue: pwd },
        { provide: ConfigService, useValue: config },
        {
          provide: JwtService,
          useValue: jwt,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // -----------------------
  // register
  // -----------------------
  describe('register', () => {
    it('should hash password and create user when does not exist', async () => {
      jest.spyOn(service['userRepository'], 'exists').mockResolvedValue(false);
      jest
        .spyOn(service['passwordService'], 'hashPassword')
        .mockResolvedValue('hashed:ok');
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
      } as User;

      jest
        .spyOn(service['userRepository'], 'create')
        .mockResolvedValue(mockUser);

      await expect(service.register(createDto)).resolves.toBeUndefined();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['userRepository'].exists).toHaveBeenCalledWith(
        'john@doe.com',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['passwordService'].hashPassword).toHaveBeenCalledWith(
        'StrongPass123!',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['userRepository'].create).toHaveBeenCalledWith({
        ...createDto,
        email: 'john@doe.com', // lowercased
        password: 'hashed:ok',
      });
    });

    it('should throw ConflictException if email already exists (pre-check)', async () => {
      jest.spyOn(service['userRepository'], 'exists').mockResolvedValue(true);

      await expect(service.register(createDto)).rejects.toBeInstanceOf(
        ConflictException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['passwordService'].hashPassword).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['userRepository'].create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on unique constraint race', async () => {
      jest.spyOn(service['userRepository'], 'exists').mockResolvedValue(false);
      jest
        .spyOn(service['passwordService'], 'hashPassword')
        .mockResolvedValue('hashed:ok');
      const uniqueErr = Object.assign(new Error('unique'), {
        name: 'SequelizeUniqueConstraintError',
      });
      jest
        .spyOn(service['userRepository'], 'create')
        .mockRejectedValue(uniqueErr);

      await expect(service.register(createDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should map unknown errors to InternalServerErrorException', async () => {
      jest.spyOn(service['userRepository'], 'exists').mockResolvedValue(false);
      jest
        .spyOn(service['passwordService'], 'hashPassword')
        .mockResolvedValue('hashed:ok');
      jest
        .spyOn(service['userRepository'], 'create')
        .mockRejectedValue(new Error('db blew up'));

      await expect(service.register(createDto)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // -----------------------
  // login
  // -----------------------
  describe('login', () => {
    it('should validate password, sign tokens and return user + access_token + expires_in', async () => {
      jest
        .spyOn(service['userRepository'], 'findByEmail')
        .mockResolvedValue(userWithPassword as User);
      jest
        .spyOn(service['passwordService'], 'comparePassword')
        .mockResolvedValue(true);

      // sign access / refresh + decode exp
      config.get.mockImplementation((key: string) => {
        switch (key) {
          case 'SECURITY.JWT_SECRET':
            return 'access-secret';
          case 'SECURITY.JWT_REFRESH':
            return 'refresh-secret';
          case 'SECURITY.JWT_SECRET_TTL':
            return '15m';
          case 'SECURITY.JWT_REFRESH_TTL':
            return '7d';
          default:
            return undefined;
        }
      });

      jwt.signAsync
        .mockResolvedValueOnce('access-token') // first call: access
        .mockResolvedValueOnce('refresh-token'); // second call: refresh

      jwt.decode.mockReturnValue({ exp: 123456 });

      const result: IAuthResponse = await service.login(loginDto);

      // Repo & password checks
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['userRepository'].findByEmail).toHaveBeenCalledWith(
        'john@doe.com',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['passwordService'].comparePassword).toHaveBeenCalledWith(
        'StrongPass123!',
        'hashed:abc',
      );

      // Tokens and response shape
      expect(jwt.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: 'u-123',
          email: 'john@doe.com',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        { secret: 'access-secret', expiresIn: '15m' },
      );
      expect(jwt.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 'u-123' },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );

      expect(result.user).toEqual(userSanitized);
      expect(result.access_token).toBe('access-token');
      expect(result.expires_in).toBe(123456);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).refresh_token).toBeUndefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest
        .spyOn(service['userRepository'], 'findByEmail')
        .mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['passwordService'].comparePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password mismatch', async () => {
      jest
        .spyOn(service['userRepository'], 'findByEmail')
        .mockResolvedValue(userWithPassword as User);
      jest
        .spyOn(service['passwordService'], 'comparePassword')
        .mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  // -----------------------
  // validateToken
  // -----------------------
  describe('validateToken', () => {
    it('should verify and return auth user', async () => {
      const payload: IJwtPayload = {
        sub: 'u-123',
        email: 'john@doe.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      jwt.verifyAsync.mockResolvedValue(payload);

      const result = await service.validateToken('valid-token');

      expect(jwt.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'access-secret',
      });

      expect(result).toEqual({
        id: 'u-123',
        email: 'john@doe.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: new Date(payload.created_at!),
        updated_at: new Date(payload.updated_at!),
        deleted_at: null,
      });
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.validateToken('invalid')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  // -----------------------
  // refreshToken
  // -----------------------
  describe('refreshToken', () => {
    it('should verify refresh, ensure user exists and sign new tokens', async () => {
      const payload: IJwtPayload = { sub: 'u-123', email: 'john@doe.com' };
      jwt.verifyAsync.mockResolvedValue(payload);
      jest
        .spyOn(service['userRepository'], 'findById')
        .mockResolvedValue(userWithPassword as User);

      jwt.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');
      jwt.decode.mockReturnValue({ exp: 999999 });

      const tokens: IAuthTokens = await service.refreshToken('refresh');

      expect(jwt.verifyAsync).toHaveBeenCalledWith('refresh', {
        secret: 'refresh-secret',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service['userRepository'].findById).toHaveBeenCalledWith('u-123');

      expect(jwt.signAsync).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ sub: 'u-123', email: 'john@doe.com' }),
        { secret: 'access-secret', expiresIn: '15m' },
      );
      expect(jwt.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 'u-123' },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );

      expect(tokens).toEqual({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        expires_in: 999999,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: IJwtPayload = {
        sub: 'ghost',
        email: '',
      };
      jwt.verifyAsync.mockResolvedValue(payload);
      jest.spyOn(service['userRepository'], 'findById').mockResolvedValue(null);

      await expect(service.refreshToken('rt')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(service.refreshToken('bad-rt')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
