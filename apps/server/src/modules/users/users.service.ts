import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';

import { PasswordService } from 'src/core';
import { IUserService } from 'src/common/interfaces';

import { IUser } from './types';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService implements IUserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const existingUser: boolean = await this.userRepository.exists(
      createUserDto.email,
    );
    if (existingUser)
      throw new ConflictException('User with this email already exists');

    const hashedPassword: string = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    try {
      const user: User = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return this.excludePassword(user);
    } catch (error) {
      this.logger.error('Error creating user', (error as Error)?.stack);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async getUserById(id: string): Promise<IUser> {
    const user: User | null = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    try {
      return this.excludePassword(user);
    } catch (error) {
      this.logger.error('Error fetching user by ID', (error as Error)?.stack);
      throw new InternalServerErrorException('Error fetching user by ID');
    }
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user: User | null = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    try {
      return this.excludePassword(user);
    } catch (error) {
      this.logger.error(
        'Error fetching user by email',
        (error as Error)?.stack,
      );
      throw new InternalServerErrorException('Error fetching user by email');
    }
  }

  async getAllUsers(): Promise<IUser[]> {
    try {
      const users: User[] = await this.userRepository.findAll();
      return users.map((user: User) => this.excludePassword(user));
    } catch (error) {
      this.logger.error('Error fetching all users', (error as Error)?.stack);
      throw new InternalServerErrorException('Error fetching all users');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    const existingUser: User | null = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: UpdateUserDto = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
    }

    try {
      const updatedUser: User = await this.userRepository.update(
        id,
        updateData,
      );
      return this.excludePassword(updatedUser);
    } catch (error) {
      this.logger.error('Error updating user', (error as Error)?.stack);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser: User | null = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userRepository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting user', (error as Error)?.stack);
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  private excludePassword(user: User): IUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;
    return userData;
  }
}
