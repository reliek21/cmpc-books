import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from '../../core/helpers/password.service';
import {
  IUserService,
  IUser,
  ICreateUser,
  IUpdateUser,
} from '../../common/interfaces';

/**
 * User Service Implementation
 * Handles business logic for user operations
 * Follows Single Responsibility Principle
 */
@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Create a new user
   * @param userData - User creation data
   * @returns Created user
   */
  async createUser(userData: ICreateUser): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.userRepository.exists(userData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(
      userData.password,
    );

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // Return user without password
    return this.excludePassword(user);
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User
   */
  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User
   */
  async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  /**
   * Get all users
   * @returns Array of users
   */
  async getAllUsers(): Promise<IUser[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.excludePassword(user));
  }

  /**
   * Update user
   * @param id - User ID
   * @param userData - Updated user data
   * @returns Updated user
   */
  async updateUser(id: string, userData: IUpdateUser): Promise<IUser> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Hash password if provided
    const updateData: Record<string, any> = { ...userData };
    if (userData.password) {
      updateData.password = await this.passwordService.hashPassword(
        userData.password,
      );
    }

    // Update user
    const updatedUser = await this.userRepository.update(id, updateData);
    return this.excludePassword(updatedUser);
  }

  /**
   * Delete user
   * @param id - User ID
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  /**
   * Validate user credentials
   * @param email - User email
   * @param password - User password
   * @returns User if credentials are valid
   */
  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<IUser> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    return this.excludePassword(user);
  }

  /**
   * Exclude password from user object
   * @param user - User object
   * @returns User without password
   */
  private excludePassword(user: Record<string, any>): IUser {
    const userData = user as {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      is_active: boolean;
      created_at: Date;
      updated_at?: Date;
    };

    return {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_active: userData.is_active,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };
  }
}
