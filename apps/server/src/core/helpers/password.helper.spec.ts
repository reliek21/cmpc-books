import * as bcrypt from 'bcryptjs';
import { PasswordHelper } from './password.helper';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordHelper', () => {
  let passwordHelper: PasswordHelper;
  let mockBcrypt: {
    hash: jest.MockedFunction<typeof bcrypt.hash>;
    compare: jest.MockedFunction<typeof bcrypt.compare>;
  };

  beforeEach(() => {
    passwordHelper = new PasswordHelper();
    mockBcrypt = {
      hash: bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>,
      compare: bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>,
    };
    jest.clearAllMocks();
  });

  describe('encryptPassword', () => {
    it('should hash password with salt rounds 10', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await passwordHelper.encryptPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should handle bcrypt hash rejection', async () => {
      const password = 'myPassword123';
      const error = new Error('Hashing failed');

      mockBcrypt.hash.mockRejectedValue(error);

      await expect(passwordHelper.encryptPassword(password)).rejects.toThrow(
        error,
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = 'hashedEmptyPassword';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await passwordHelper.encryptPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should handle special characters in password', async () => {
      const password = 'p@ssw0rd!$#';
      const hashedPassword = 'hashedSpecialPassword';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await passwordHelper.encryptPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should handle very long password', async () => {
      const password = 'a'.repeat(1000);
      const hashedPassword = 'hashedLongPassword';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await passwordHelper.encryptPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const password = 'myPassword123';
      const hash = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'myPassword123';
      const hash = 'differentHashedPassword';

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });

    it('should handle bcrypt compare rejection', async () => {
      const password = 'myPassword123';
      const hash = 'hashedPassword123';
      const error = new Error('Comparison failed');

      mockBcrypt.compare.mockRejectedValue(error);

      await expect(
        passwordHelper.comparePassword(password, hash),
      ).rejects.toThrow(error);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should handle empty password comparison', async () => {
      const password = '';
      const hash = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });

    it('should handle empty hash comparison', async () => {
      const password = 'myPassword123';
      const hash = '';

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });

    it('should handle both empty password and hash', async () => {
      const password = '';
      const hash = '';

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
    });

    it('should handle special characters in password and hash', async () => {
      const password = 'p@ssw0rd!$#';
      const hash = '$2a$10$specialHashedPassword123';

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should handle very long password and hash', async () => {
      const password = 'a'.repeat(1000);
      const hash = '$2a$10$verylonghash'.repeat(10);

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await passwordHelper.comparePassword(password, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple encryption calls', async () => {
      const passwords = ['pass1', 'pass2', 'pass3'];
      const hashedPasswords = ['hash1', 'hash2', 'hash3'];

      passwords.forEach((_, index) => {
        mockBcrypt.hash.mockResolvedValueOnce(hashedPasswords[index]);
      });

      const results = await Promise.all(
        passwords.map((password) => passwordHelper.encryptPassword(password)),
      );

      expect(results).toEqual(hashedPasswords);
      expect(mockBcrypt.hash).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple comparison calls', async () => {
      const comparisons = [
        { password: 'pass1', hash: 'hash1', expected: true },
        { password: 'pass2', hash: 'hash2', expected: false },
        { password: 'pass3', hash: 'hash3', expected: true },
      ];

      comparisons.forEach((comparison) => {
        mockBcrypt.compare.mockResolvedValueOnce(comparison.expected);
      });

      const results = await Promise.all(
        comparisons.map((comp) =>
          passwordHelper.comparePassword(comp.password, comp.hash),
        ),
      );

      expect(results).toEqual([true, false, true]);
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(3);
    });
  });
});