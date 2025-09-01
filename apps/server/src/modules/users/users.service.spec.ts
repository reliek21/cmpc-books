import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from '../../core/services/password.service';
import { ICreateUser, IUpdateUser } from '../../common/interfaces';

describe('UserService', () => {
	let service: UserService;
	let userRepository: jest.Mocked<UserRepository>;
	let passwordService: jest.Mocked<PasswordService>;

	const mockUser = {
		id: '1',
		email: 'test@example.com',
		first_name: 'John',
		last_name: 'Doe',
		is_active: true,
		password: 'hashedPassword123',
		created_at: new Date(),
		updated_at: new Date(),
	};

	const mockUserWithoutPassword = {
		id: '1',
		email: 'test@example.com',
		first_name: 'John',
		last_name: 'Doe',
		is_active: true,
		created_at: mockUser.created_at,
		updated_at: mockUser.updated_at,
	};

	beforeEach(async () => {
		const mockUserRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findAll: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			exists: jest.fn(),
		};

		const mockPasswordService = {
			hashPassword: jest.fn(),
			comparePassword: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: UserRepository,
					useValue: mockUserRepository,
				},
				{
					provide: PasswordService,
					useValue: mockPasswordService,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		userRepository = module.get(UserRepository);
		passwordService = module.get(PasswordService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createUser', () => {
		it('should create a user successfully', async () => {
			const createUserDto: ICreateUser = {
				email: 'test@example.com',
				password: 'password123',
				first_name: 'John',
				last_name: 'Doe',
			};

			userRepository.exists.mockResolvedValue(false);
			passwordService.hashPassword.mockResolvedValue('hashedPassword123');
			userRepository.create.mockResolvedValue(mockUser);

			const result = await service.createUser(createUserDto);

			expect(userRepository.exists).toHaveBeenCalledWith(createUserDto.email);
			expect(passwordService.hashPassword).toHaveBeenCalledWith('password123');
			expect(userRepository.create).toHaveBeenCalledWith({
				...createUserDto,
				password: 'hashedPassword123',
			});
			expect(result).toEqual(mockUserWithoutPassword);
			expect(result).not.toHaveProperty('password');
		});

		it('should throw ConflictException when user already exists', async () => {
			const createUserDto: ICreateUser = {
				email: 'existing@example.com',
				password: 'password123',
				first_name: 'John',
				last_name: 'Doe',
			};

			userRepository.exists.mockResolvedValue(true);

			await expect(service.createUser(createUserDto)).rejects.toThrow(
				ConflictException,
			);
			await expect(service.createUser(createUserDto)).rejects.toThrow(
				'User with this email already exists',
			);

			expect(userRepository.exists).toHaveBeenCalledWith(createUserDto.email);
			expect(passwordService.hashPassword).not.toHaveBeenCalled();
			expect(userRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('getUserById', () => {
		it('should return user by id', async () => {
			userRepository.findById.mockResolvedValue(mockUser);

			const result = await service.getUserById('1');

			expect(userRepository.findById).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockUserWithoutPassword);
			expect(result).not.toHaveProperty('password');
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepository.findById.mockResolvedValue(null);

			await expect(service.getUserById('999')).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.getUserById('999')).rejects.toThrow(
				'User not found',
			);
		});
	});

	describe('getUserByEmail', () => {
		it('should return user by email', async () => {
			userRepository.findByEmail.mockResolvedValue(mockUser);

			const result = await service.getUserByEmail('test@example.com');

			expect(userRepository.findByEmail).toHaveBeenCalledWith(
				'test@example.com',
			);
			expect(result).toEqual(mockUserWithoutPassword);
			expect(result).not.toHaveProperty('password');
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepository.findByEmail.mockResolvedValue(null);

			await expect(
				service.getUserByEmail('nonexistent@example.com'),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('getAllUsers', () => {
		it('should return all users without passwords', async () => {
			const users = [
				mockUser,
				{ ...mockUser, id: '2', email: 'user2@example.com' },
			];
			userRepository.findAll.mockResolvedValue(users);

			const result = await service.getAllUsers();

			expect(userRepository.findAll).toHaveBeenCalled();
			expect(result).toHaveLength(2);
			expect(result[0]).not.toHaveProperty('password');
			expect(result[1]).not.toHaveProperty('password');
		});
	});

	describe('updateUser', () => {
		it('should update user successfully', async () => {
			const updateUserDto: IUpdateUser = {
				first_name: 'Jane',
				last_name: 'Smith',
			};

			const updatedUser = { ...mockUser, ...updateUserDto };
			userRepository.findById.mockResolvedValue(mockUser);
			userRepository.update.mockResolvedValue(updatedUser);

			const result = await service.updateUser('1', updateUserDto);

			expect(userRepository.findById).toHaveBeenCalledWith('1');
			expect(userRepository.update).toHaveBeenCalledWith('1', updateUserDto);
			expect(result.first_name).toBe('Jane');
			expect(result.last_name).toBe('Smith');
			expect(result).not.toHaveProperty('password');
		});

		it('should hash password when updating password', async () => {
			const updateUserDto: IUpdateUser = {
				password: 'newPassword123',
			};

			userRepository.findById.mockResolvedValue(mockUser);
			passwordService.hashPassword.mockResolvedValue('newHashedPassword');
			userRepository.update.mockResolvedValue({
				...mockUser,
				password: 'newHashedPassword',
			});

			await service.updateUser('1', updateUserDto);

			expect(passwordService.hashPassword).toHaveBeenCalledWith(
				'newPassword123',
			);
			expect(userRepository.update).toHaveBeenCalledWith('1', {
				password: 'newHashedPassword',
			});
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepository.findById.mockResolvedValue(null);

			const updateUserDto: IUpdateUser = { first_name: 'Jane' };

			await expect(service.updateUser('999', updateUserDto)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('deleteUser', () => {
		it('should delete user successfully', async () => {
			userRepository.findById.mockResolvedValue(mockUser);
			userRepository.delete.mockResolvedValue(undefined);

			await service.deleteUser('1');

			expect(userRepository.findById).toHaveBeenCalledWith('1');
			expect(userRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepository.findById.mockResolvedValue(null);

			await expect(service.deleteUser('999')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('validateUserCredentials', () => {
		it('should validate credentials successfully', async () => {
			userRepository.findByEmail.mockResolvedValue(mockUser);
			passwordService.comparePassword.mockResolvedValue(true);

			const result = await service.validateUserCredentials(
				'test@example.com',
				'password123',
			);

			expect(userRepository.findByEmail).toHaveBeenCalledWith(
				'test@example.com',
			);
			expect(passwordService.comparePassword).toHaveBeenCalledWith(
				'password123',
				'hashedPassword123',
			);
			expect(result).toEqual(mockUserWithoutPassword);
		});

		it('should throw NotFoundException for invalid email', async () => {
			userRepository.findByEmail.mockResolvedValue(null);

			await expect(
				service.validateUserCredentials('invalid@example.com', 'password123'),
			).rejects.toThrow(NotFoundException);
			await expect(
				service.validateUserCredentials('invalid@example.com', 'password123'),
			).rejects.toThrow('Invalid credentials');
		});

		it('should throw NotFoundException for invalid password', async () => {
			userRepository.findByEmail.mockResolvedValue(mockUser);
			passwordService.comparePassword.mockResolvedValue(false);

			await expect(
				service.validateUserCredentials('test@example.com', 'wrongpassword'),
			).rejects.toThrow(NotFoundException);
			await expect(
				service.validateUserCredentials('test@example.com', 'wrongpassword'),
			).rejects.toThrow('Invalid credentials');
		});
	});
});
