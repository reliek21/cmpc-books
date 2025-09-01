/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockJwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    // Setup mock request
    mockRequest = {
      headers: {},
      user: undefined,
    };

    // Setup mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid Bearer token', () => {
      const validToken = 'valid-jwt-token';
      const payload = {
        sub: '1',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567900,
      };

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      mockJwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith(validToken, {
        secret: 'test-secret',
      });
      expect(mockRequest.user).toBe(payload);
    });

    it('should throw UnauthorizedException when no authorization header', () => {
      mockRequest.headers = {};

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when authorization header is empty', () => {
      mockRequest.headers = {
        authorization: '',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when authorization header has no Bearer prefix', () => {
      mockRequest.headers = {
        authorization: 'some-token-without-bearer',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when JWT verification fails', () => {
      const invalidToken = 'invalid-jwt-token';

      mockRequest.headers = {
        authorization: `Bearer ${invalidToken}`,
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(invalidToken, {
        secret: 'test-secret',
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should handle case-sensitive Bearer token correctly', () => {
      mockRequest.headers = {
        authorization: `bearer valid-token`, // lowercase
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer authorization header', () => {
      const token = 'valid-token-123';
      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBe(token);
    });

    it('should return undefined when no authorization header', () => {
      const mockReq = {
        headers: {},
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBeUndefined();
    });

    it('should return undefined when authorization header is empty', () => {
      const mockReq = {
        headers: {
          authorization: '',
        },
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBeUndefined();
    });

    it('should return undefined when authorization header has wrong format', () => {
      const mockReq = {
        headers: {
          authorization: 'Basic dXNlcjpwYXNz',
        },
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBeUndefined();
    });
  });
});
