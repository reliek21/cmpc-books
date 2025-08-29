import { Injectable } from '@nestjs/common';
import { PasswordHelper } from './password.helper';
import { IPasswordService } from '../../common/interfaces';

/**
 * Password Service Implementation
 * Handles password hashing and validation
 * Follows Single Responsibility Principle
 */
@Injectable()
export class PasswordService implements IPasswordService {
  constructor(private readonly passwordHelper: PasswordHelper) {}

  /**
   * Hash a password
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return await this.passwordHelper.encryptPassword(password);
  }

  /**
   * Compare a password with its hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if passwords match
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await this.passwordHelper.comparePassword(password, hash);
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns True if password meets strength requirements
   */
  validatePasswordStrength(password: string): boolean {
    // Basic validation: at least 8 characters, contains letters and numbers
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    return hasMinLength && hasLetter && hasNumber;
  }
}
