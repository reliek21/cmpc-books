import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { PasswordHelper } from '../helpers/password.helper';

describe('PasswordService', () => {
  let service: PasswordService;
  let mockPasswordHelper: jest.Mocked<PasswordHelper>;

  beforeEach(async () => {
    mockPasswordHelper = {
      encryptPassword: jest.fn(),
      comparePassword: jest.fn(),
    } as jest.Mocked<PasswordHelper>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: PasswordHelper,
          useValue: mockPasswordHelper,
        },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password using passwordHelper', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockPasswordHelper.encryptPassword.mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledWith(password);
      expect(result).toBe(hashedPassword);
    });

    it('should propagate error from passwordHelper', async () => {
      const password = 'myPassword123';
      const error = new Error('Hashing failed');

      mockPasswordHelper.encryptPassword.mockRejectedValue(error);

      await expect(service.hashPassword(password)).rejects.toThrow(error);
      expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledWith(password);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = 'hashedEmptyPassword';

      mockPasswordHelper.encryptPassword.mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledWith(password);
      expect(result).toBe(hashedPassword);
    });

    it('should handle special characters in password', async () => {
      const password = 'p@ssw0rd!$#';
      const hashedPassword = 'hashedSpecialPassword';

      mockPasswordHelper.encryptPassword.mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledWith(password);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare password using passwordHelper and return true', async () => {
      const password = 'myPassword123';
      const hash = 'hashedPassword123';

      mockPasswordHelper.comparePassword.mockResolvedValue(true);

      const result = await service.comparePassword(password, hash);

      expect(mockPasswordHelper.comparePassword).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should compare password using passwordHelper and return false', async () => {
      const password = 'myPassword123';
      const hash = 'differentHashedPassword';

      mockPasswordHelper.comparePassword.mockResolvedValue(false);

      const result = await service.comparePassword(password, hash);

      expect(mockPasswordHelper.comparePassword).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });

    it('should propagate error from passwordHelper', async () => {
      const password = 'myPassword123';
      const hash = 'hashedPassword123';
      const error = new Error('Comparison failed');

      mockPasswordHelper.comparePassword.mockRejectedValue(error);

      await expect(service.comparePassword(password, hash)).rejects.toThrow(error);
      expect(mockPasswordHelper.comparePassword).toHaveBeenCalledWith(password, hash);
    });

    it('should handle empty password and hash', async () => {
      const password = '';
      const hash = '';

      mockPasswordHelper.comparePassword.mockResolvedValue(false);

      const result = await service.comparePassword(password, hash);

      expect(mockPasswordHelper.comparePassword).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return true for valid strong password', () => {
      const password = 'myPassword123';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(true);
    });

    it('should return true for password with special characters', () => {
      const password = 'myPassword123!@#';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(true);
    });

    it('should return false for password without numbers', () => {
      const password = 'myPasswordOnly';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return false for password without letters', () => {
      const password = '12345678';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return false for password less than 8 characters', () => {
      const password = 'pass123';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return false for empty password', () => {
      const password = '';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return true for minimum valid password (8 chars, letters, numbers)', () => {
      const password = 'abcdef12';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(true);
    });

    it('should return true for password with uppercase and lowercase letters', () => {
      const password = 'MyPassword123';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(true);
    });

    it('should return false for password with only uppercase letters and no numbers', () => {
      const password = 'MYPASSWORD';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return false for password with only lowercase letters and no numbers', () => {
      const password = 'mypassword';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return true for very long valid password', () => {
      const password = 'a'.repeat(100) + '123';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(true);
    });

    it('should return false for password with only special characters', () => {
      const password = '!@#$%^&*()';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(false);
    });

    it('should return true for password with letters, numbers, and special characters', () => {
      const password = 'myPass123!@#';

      const result = service.validatePasswordStrength(password);

      expect(result).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should hash and then successfully compare the same password', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockPasswordHelper.encryptPassword.mockResolvedValue(hashedPassword);
      mockPasswordHelper.comparePassword.mockResolvedValue(true);

      const hash = await service.hashPassword(password);
      const isMatch = await service.comparePassword(password, hash);

      expect(hash).toBe(hashedPassword);
      expect(isMatch).toBe(true);
      expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledWith(password);
      expect(mockPasswordHelper.comparePassword).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should validate password strength before hashing', async () => {
      const weakPassword = 'weak';
      const strongPassword = 'strongPass123';
      const hashedPassword = 'hashedStrongPassword';

      mockPasswordHelper.encryptPassword.mockResolvedValue(hashedPassword);

      const isWeakValid = service.validatePasswordStrength(weakPassword);
      const isStrongValid = service.validatePasswordStrength(strongPassword);

      expect(isWeakValid).toBe(false);
      expect(isStrongValid).toBe(true);

      // Only hash if password is strong
      if (isStrongValid) {
        const hash = await service.hashPassword(strongPassword);
        expect(hash).toBe(hashedPassword);
        expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledWith(strongPassword);
      }
    });

    it('should handle multiple password operations', async () => {
      const passwords = ['pass1abc', 'pass2def', 'pass3ghi'];
      const hashes = ['hash1', 'hash2', 'hash3'];

      passwords.forEach((_, index) => {
        mockPasswordHelper.encryptPassword.mockResolvedValueOnce(hashes[index]);
        mockPasswordHelper.comparePassword.mockResolvedValueOnce(true);
      });

      const results = await Promise.all([
        service.hashPassword(passwords[0]),
        service.hashPassword(passwords[1]),
        service.hashPassword(passwords[2]),
      ]);

      const comparisons = await Promise.all([
        service.comparePassword(passwords[0], results[0]),
        service.comparePassword(passwords[1], results[1]),
        service.comparePassword(passwords[2], results[2]),
      ]);

      expect(results).toEqual(hashes);
      expect(comparisons).toEqual([true, true, true]);
      expect(mockPasswordHelper.encryptPassword).toHaveBeenCalledTimes(3);
      expect(mockPasswordHelper.comparePassword).toHaveBeenCalledTimes(3);
    });
  });
});