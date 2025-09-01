import { Test, TestingModule } from '@nestjs/testing';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import { IJwtPayload } from '../../common/interfaces';

describe('JwtService', () => {
  let service: JwtService;
  let mockNestJwtService: jest.Mocked<NestJwtService>;

  beforeEach(async () => {
    mockNestJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<NestJwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: NestJwtService,
          useValue: mockNestJwtService,
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token using nestJwtService', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const expectedToken = 'access-token-123';

      mockNestJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateAccessToken(payload);

      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });

    it('should handle empty payload', () => {
      const payload = {};
      const expectedToken = 'empty-payload-token';

      mockNestJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateAccessToken(payload);

      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });

    it('should handle complex payload objects', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        roles: ['user', 'admin'],
        metadata: { lastLogin: '2023-01-01' },
      };
      const expectedToken = 'complex-payload-token';

      mockNestJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateAccessToken(payload);

      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with 7d expiration', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const expectedToken = 'refresh-token-123';

      mockNestJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateRefreshToken(payload);

      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
      });
      expect(result).toBe(expectedToken);
    });

    it('should handle empty payload for refresh token', () => {
      const payload = {};
      const expectedToken = 'empty-refresh-token';

      mockNestJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateRefreshToken(payload);

      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify access token and return payload', () => {
      const token = 'valid-access-token';
      const expectedPayload = { userId: 1, email: 'test@example.com' };

      mockNestJwtService.verify.mockReturnValue(expectedPayload);

      const result = service.verifyAccessToken(token);

      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toBe(expectedPayload);
    });

    it('should throw error for invalid access token', () => {
      const token = 'invalid-access-token';

      mockNestJwtService.verify.mockImplementation(() => {
        throw new Error('JWT verification failed');
      });

      expect(() => service.verifyAccessToken(token)).toThrow(
        'Invalid access token',
      );
      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should handle empty token', () => {
      const token = '';

      mockNestJwtService.verify.mockImplementation(() => {
        throw new Error('Empty token');
      });

      expect(() => service.verifyAccessToken(token)).toThrow(
        'Invalid access token',
      );
      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token and return payload', () => {
      const token = 'valid-refresh-token';
      const expectedPayload = { userId: 1, email: 'test@example.com' };

      mockNestJwtService.verify.mockReturnValue(expectedPayload);

      const result = service.verifyRefreshToken(token);

      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toBe(expectedPayload);
    });

    it('should throw error for invalid refresh token', () => {
      const token = 'invalid-refresh-token';

      mockNestJwtService.verify.mockImplementation(() => {
        throw new Error('JWT verification failed');
      });

      expect(() => service.verifyRefreshToken(token)).toThrow(
        'Invalid refresh token',
      );
      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should handle expired refresh token', () => {
      const token = 'expired-refresh-token';

      mockNestJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => service.verifyRefreshToken(token)).toThrow(
        'Invalid refresh token',
      );
      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = 'valid-token';
      const expectedPayload = { userId: 1, email: 'test@example.com' };

      mockNestJwtService.decode.mockReturnValue(expectedPayload);

      const result = service.decodeToken(token);

      expect(mockNestJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toBe(expectedPayload);
    });

    it('should return empty object when decode returns null', () => {
      const token = 'invalid-token';

      mockNestJwtService.decode.mockReturnValue(null);

      const result = service.decodeToken(token);

      expect(mockNestJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual({});
    });

    it('should return empty object when decode returns undefined', () => {
      const token = 'malformed-token';

      mockNestJwtService.decode.mockReturnValue(undefined);

      const result = service.decodeToken(token);

      expect(mockNestJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual({});
    });

    it('should handle empty token for decode', () => {
      const token = '';

      mockNestJwtService.decode.mockReturnValue(null);

      const result = service.decodeToken(token);

      expect(mockNestJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual({});
    });
  });

  describe('signAsync', () => {
    it('should sign token asynchronously without options', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const expectedToken = 'async-token-123';

      mockNestJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.signAsync(payload);

      expect(mockNestJwtService.signAsync).toHaveBeenCalledWith(
        payload,
        undefined,
      );
      expect(result).toBe(expectedToken);
    });

    it('should sign token asynchronously with options', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const options = { expiresIn: '1h' };
      const expectedToken = 'async-token-with-options';

      mockNestJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.signAsync(payload, options);

      expect(mockNestJwtService.signAsync).toHaveBeenCalledWith(
        payload,
        options,
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle error in async signing', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const error = new Error('Signing failed');

      mockNestJwtService.signAsync.mockRejectedValue(error);

      await expect(service.signAsync(payload)).rejects.toThrow(error);
      expect(mockNestJwtService.signAsync).toHaveBeenCalledWith(
        payload,
        undefined,
      );
    });
  });

  describe('verifyAsync', () => {
    it('should verify token asynchronously without options', async () => {
      const token = 'valid-async-token';
      const expectedPayload: IJwtPayload = {
        userId: 1,
        email: 'test@example.com',
      };

      mockNestJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await service.verifyAsync(token);

      expect(mockNestJwtService.verifyAsync).toHaveBeenCalledWith(
        token,
        undefined,
      );
      expect(result).toBe(expectedPayload);
    });

    it('should verify token asynchronously with options', async () => {
      const token = 'valid-async-token';
      const options = { ignoreExpiration: true };
      const expectedPayload: IJwtPayload = {
        userId: 1,
        email: 'test@example.com',
      };

      mockNestJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await service.verifyAsync(token, options);

      expect(mockNestJwtService.verifyAsync).toHaveBeenCalledWith(
        token,
        options,
      );
      expect(result).toBe(expectedPayload);
    });

    it('should handle error in async verification', async () => {
      const token = 'invalid-async-token';
      const error = new Error('Verification failed');

      mockNestJwtService.verifyAsync.mockRejectedValue(error);

      await expect(service.verifyAsync(token)).rejects.toThrow(error);
      expect(mockNestJwtService.verifyAsync).toHaveBeenCalledWith(
        token,
        undefined,
      );
    });

    it('should handle expired token in async verification', async () => {
      const token = 'expired-async-token';
      const error = new Error('Token expired');

      mockNestJwtService.verifyAsync.mockRejectedValue(error);

      await expect(service.verifyAsync(token)).rejects.toThrow(error);
      expect(mockNestJwtService.verifyAsync).toHaveBeenCalledWith(
        token,
        undefined,
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should generate access token and verify it successfully', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = 'generated-verified-token';

      mockNestJwtService.sign.mockReturnValue(token);
      mockNestJwtService.verify.mockReturnValue(payload);

      const generatedToken = service.generateAccessToken(payload);
      const verifiedPayload = service.verifyAccessToken(generatedToken);

      expect(generatedToken).toBe(token);
      expect(verifiedPayload).toBe(payload);
      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload);
      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should generate refresh token and verify it successfully', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = 'generated-verified-refresh-token';

      mockNestJwtService.sign.mockReturnValue(token);
      mockNestJwtService.verify.mockReturnValue(payload);

      const generatedToken = service.generateRefreshToken(payload);
      const verifiedPayload = service.verifyRefreshToken(generatedToken);

      expect(generatedToken).toBe(token);
      expect(verifiedPayload).toBe(payload);
      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
      });
      expect(mockNestJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should handle async token generation and verification', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const options = { expiresIn: '2h' };
      const token = 'async-generated-token';
      const verifiedPayload: IJwtPayload = {
        userId: 1,
        email: 'test@example.com',
      };

      mockNestJwtService.signAsync.mockResolvedValue(token);
      mockNestJwtService.verifyAsync.mockResolvedValue(verifiedPayload);

      const generatedToken = await service.signAsync(payload, options);
      const verifiedResult = await service.verifyAsync(generatedToken);

      expect(generatedToken).toBe(token);
      expect(verifiedResult).toBe(verifiedPayload);
      expect(mockNestJwtService.signAsync).toHaveBeenCalledWith(
        payload,
        options,
      );
      expect(mockNestJwtService.verifyAsync).toHaveBeenCalledWith(
        token,
        undefined,
      );
    });

    it('should decode token without verification after generation', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = 'decodable-token';

      mockNestJwtService.sign.mockReturnValue(token);
      mockNestJwtService.decode.mockReturnValue(payload);

      const generatedToken = service.generateAccessToken(payload);
      const decodedPayload = service.decodeToken(generatedToken);

      expect(generatedToken).toBe(token);
      expect(decodedPayload).toBe(payload);
      expect(mockNestJwtService.sign).toHaveBeenCalledWith(payload);
      expect(mockNestJwtService.decode).toHaveBeenCalledWith(token);
    });

    it('should handle multiple token operations in sequence', async () => {
      const payload1 = { userId: 1, email: 'user1@example.com' };
      const payload2 = { userId: 2, email: 'user2@example.com' };
      const token1 = 'token-1';
      const token2 = 'token-2';

      mockNestJwtService.sign
        .mockReturnValueOnce(token1)
        .mockReturnValueOnce(token2);
      mockNestJwtService.verify
        .mockReturnValueOnce(payload1)
        .mockReturnValueOnce(payload2);

      const accessToken1 = service.generateAccessToken(payload1);
      const refreshToken2 = service.generateRefreshToken(payload2);

      const verifiedPayload1 = service.verifyAccessToken(accessToken1);
      const verifiedPayload2 = service.verifyRefreshToken(refreshToken2);

      expect(accessToken1).toBe(token1);
      expect(refreshToken2).toBe(token2);
      expect(verifiedPayload1).toBe(payload1);
      expect(verifiedPayload2).toBe(payload2);

      expect(mockNestJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockNestJwtService.verify).toHaveBeenCalledTimes(2);
    });
  });
});
