import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from '../types/jwt-payload.type';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockJwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
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

    // Set up environment variable
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  describe('canActivate', () => {
    it('should return true for valid Bearer token', () => {
      const validToken = 'valid-jwt-token';
      const payload: JwtPayload = {
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

    it('should return true for valid token with different payload structure', () => {
      const validToken = 'another-valid-token';
      const payload: JwtPayload = {
        sub: '123',
        email: 'user@example.org',
        iat: 1111111111,
        exp: 2222222222,
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
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is empty', () => {
      mockRequest.headers = {
        authorization: '',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header has no Bearer prefix', () => {
      mockRequest.headers = {
        authorization: 'some-token-without-bearer',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header has wrong prefix', () => {
      mockRequest.headers = {
        authorization: 'Basic some-token',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Bearer token is empty', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Bearer token is just spaces', () => {
      mockRequest.headers = {
        authorization: 'Bearer   ',
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
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
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Invalid token',
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(invalidToken, {
        secret: 'test-secret',
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should throw UnauthorizedException when JWT is expired', () => {
      const expiredToken = 'expired-jwt-token';

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Invalid token',
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(expiredToken, {
        secret: 'test-secret',
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should throw UnauthorizedException when JWT is malformed', () => {
      const malformedToken = 'malformed.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${malformedToken}`,
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Invalid token',
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(malformedToken, {
        secret: 'test-secret',
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should handle case-sensitive Bearer token correctly', () => {
      const validToken = 'valid-token';
      const payload: JwtPayload = {
        sub: '1',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567900,
      };

      mockRequest.headers = {
        authorization: `bearer ${validToken}`, // lowercase
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should handle multiple spaces in authorization header', () => {
      const validToken = 'valid-token';

      mockRequest.headers = {
        authorization: `Bearer  ${validToken}`, // double space
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'No token provided',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
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

      // Access private method for testing
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

    it('should return undefined when Bearer has no token', () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer',
        },
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBeUndefined();
    });

    it('should return empty string when Bearer token is empty', () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer ',
        },
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBe('');
    });

    it('should handle complex tokens correctly', () => {
      const complexToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const mockReq = {
        headers: {
          authorization: `Bearer ${complexToken}`,
        },
      } as Request;

      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBe(complexToken);
    });

    it('should handle authorization header with additional parts', () => {
      const token = 'token-123';
      const mockReq = {
        headers: {
          authorization: `Bearer ${token} extra-part`,
        },
      } as Request;

      // Should only take the first token after Bearer
      const extractedToken = (guard as any).extractTokenFromHeader(mockReq);

      expect(extractedToken).toBe(token);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple consecutive calls with different tokens', () => {
      const scenarios = [
        {
          token: 'token1',
          payload: { sub: '1', email: 'user1@test.com', iat: 1, exp: 2 },
        },
        {
          token: 'token2',
          payload: { sub: '2', email: 'user2@test.com', iat: 3, exp: 4 },
        },
        {
          token: 'token3',
          payload: { sub: '3', email: 'user3@test.com', iat: 5, exp: 6 },
        },
      ];

      scenarios.forEach((scenario, index) => {
        mockRequest.headers = {
          authorization: `Bearer ${scenario.token}`,
        };

        mockJwtService.verify.mockReturnValueOnce(scenario.payload);

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(mockRequest.user).toBe(scenario.payload);
      });

      expect(mockJwtService.verify).toHaveBeenCalledTimes(3);
    });

    it('should handle alternating valid and invalid tokens', () => {
      // Valid token
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      mockJwtService.verify.mockReturnValueOnce({
        sub: '1',
        email: 'user@test.com',
        iat: 1,
        exp: 2,
      });

      let result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);

      // Invalid token
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error('Invalid');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );

      // Another valid token
      mockRequest.headers = {
        authorization: 'Bearer another-valid-token',
      };
      mockJwtService.verify.mockReturnValueOnce({
        sub: '2',
        email: 'user2@test.com',
        iat: 3,
        exp: 4,
      });

      result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);

      expect(mockJwtService.verify).toHaveBeenCalledTimes(3);
    });

    it('should not modify request object when token validation fails', () => {
      const originalUser = { id: 'existing-user' };
      mockRequest.user = originalUser;

      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token validation failed');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );

      // User should remain unchanged
      expect(mockRequest.user).toBe(originalUser);
    });
  });
});
