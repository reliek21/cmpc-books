import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IPasswordService } from '../../common/interfaces';

/**
 * Password Service Implementation
 * Follows Single Responsibility Principle - handles only password operations
 */
@Injectable()
export class PasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Hash a plain text password
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain text password with a hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if passwords match
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns True if password meets strength requirements
   */
  validatePasswordStrength(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }
}
