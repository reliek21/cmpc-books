import {
	Injectable,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from '../../core/services/password.service';
import {
	IUserService,
	IUser,
	ICreateUser,
	IUpdateUser,
} from '../../common/interfaces';

@Injectable()
export class UserService implements IUserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly passwordService: PasswordService,
	) {}

	async createUser(userData: ICreateUser): Promise<IUser> {
		const existingUser = await this.userRepository.exists(userData.email);
		if (existingUser) {
			throw new ConflictException('User with this email already exists');
		}

		const hashedPassword = await this.passwordService.hashPassword(
			userData.password,
		);

		const user = await this.userRepository.create({
			...userData,
			password: hashedPassword,
		});

		return this.excludePassword(user);
	}

	async getUserById(id: string): Promise<IUser> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.excludePassword(user);
	}

	async getUserByEmail(email: string): Promise<IUser> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.excludePassword(user);
	}

	async getAllUsers(): Promise<IUser[]> {
		const users = await this.userRepository.findAll();
		return users.map((user) => this.excludePassword(user));
	}

	async updateUser(id: string, userData: IUpdateUser): Promise<IUser> {
		const existingUser = await this.userRepository.findById(id);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		const updateData: Record<string, any> = { ...userData };
		if (userData.password) {
			updateData.password = await this.passwordService.hashPassword(
				userData.password,
			);
		}

		const updatedUser = await this.userRepository.update(id, updateData);
		return this.excludePassword(updatedUser);
	}

	async deleteUser(id: string): Promise<void> {
		const existingUser = await this.userRepository.findById(id);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		await this.userRepository.delete(id);
	}

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
