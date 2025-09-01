import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';

/**
 * User Repository Implementation
 * Follows Repository Pattern and Dependency Inversion Principle
 */
@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User)
		private readonly userModel: typeof User,
	) {}

	/**
	 * Find user by ID
	 * @param id - User ID
	 * @returns User or null
	 */
	async findById(id: string): Promise<User | null> {
		return await this.userModel.findByPk(id);
	}

	/**
	 * Find user by email
	 * @param email - User email
	 * @returns User or null
	 */
	async findByEmail(email: string): Promise<User | null> {
		return await this.userModel.findOne({
			where: { email: email.toLowerCase() },
		});
	}

	/**
	 * Get all users
	 * @returns Array of users
	 */
	async findAll(): Promise<User[]> {
		return await this.userModel.findAll({
			where: { is_active: true },
			order: [['created_at', 'DESC']],
		});
	}

	/**
	 * Create new user
	 * @param userData - User creation data
	 * @returns Created user
	 */
	async create(userData: {
		email: string;
		password: string;
		first_name?: string;
		last_name?: string;
	}): Promise<User> {
		return await this.userModel.create({
			...userData,
			email: userData.email.toLowerCase(),
			is_active: true,
		});
	}

	/**
	 * Update user
	 * @param id - User ID
	 * @param userData - Updated user data
	 * @returns Updated user
	 */
	async update(id: string, userData: Partial<User>): Promise<User> {
		const [affectedRows] = await this.userModel.update(userData, {
			where: { id },
			returning: true,
		});

		if (affectedRows === 0) {
			throw new Error('User not found');
		}

		const updatedUser = await this.findById(id);
		if (!updatedUser) {
			throw new Error('Failed to retrieve updated user');
		}

		return updatedUser;
	}

	/**
	 * Delete user (soft delete)
	 * @param id - User ID
	 */
	async delete(id: string): Promise<void> {
		const affectedRows = await this.userModel.destroy({
			where: { id },
		});

		if (affectedRows === 0) {
			throw new Error('User not found');
		}
	}

	/**
	 * Check if user exists by email
	 * @param email - User email
	 * @returns True if user exists
	 */
	async exists(email: string): Promise<boolean> {
		const count = await this.userModel.count({
			where: { email: email.toLowerCase() },
		});
		return count > 0;
	}
}
