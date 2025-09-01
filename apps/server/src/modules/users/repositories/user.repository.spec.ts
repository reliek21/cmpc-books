import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockUserModel: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockUserModel = {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await repository.findById('user-123');

      expect(mockUserModel.findByPk).toHaveBeenCalledWith('user-123', {
        attributes: { include: ['password'] },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      const result = await repository.findById('user-123');

      expect(mockUserModel.findByPk).toHaveBeenCalledWith('user-123', {
        attributes: { include: ['password'] },
      });
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      const error = new Error('Database error');
      mockUserModel.findByPk.mockRejectedValue(error);

      await expect(repository.findById('user-123')).rejects.toThrow(error);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        attributes: { include: ['password'] },
      });
      expect(result).toEqual(mockUser);
    });

    it('should convert email to lowercase', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await repository.findByEmail('TEST@EXAMPLE.COM');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        attributes: { include: ['password'] },
      });
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      const error = new Error('Database error');
      mockUserModel.findOne.mockRejectedValue(error);

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const users = [mockUser];
      mockUserModel.findAll.mockResolvedValue(users);

      const result = await repository.findAll();

      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual(users);
    });

    it('should return empty array when no users found', async () => {
      mockUserModel.findAll.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      const error = new Error('Database error');
      mockUserModel.findAll.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'hashedPassword',
        first_name: 'Jane',
        last_name: 'Smith',
      };
      const createdUser = {
        ...userData,
        email: 'new@example.com',
        is_active: true,
        id: 'user-456',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.create.mockResolvedValue(createdUser);

      const result = await repository.create(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...userData,
        email: 'new@example.com',
        is_active: true,
      });
      expect(result).toEqual(createdUser);
    });

    it('should convert email to lowercase when creating', async () => {
      const userData = {
        email: 'NEW@EXAMPLE.COM',
        password: 'hashedPassword',
      };

      mockUserModel.create.mockResolvedValue({ ...mockUser, email: 'new@example.com' });

      await repository.create(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...userData,
        email: 'new@example.com',
        is_active: true,
      });
    });

    it('should set is_active to true by default', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserModel.create.mockResolvedValue(mockUser);

      await repository.create(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...userData,
        email: 'test@example.com',
        is_active: true,
      });
    });

    it('should throw error when creation fails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const error = new Error('Database error');

      mockUserModel.create.mockRejectedValue(error);

      await expect(repository.create(userData)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = { first_name: 'Updated Name' };
      const updatedUser = { ...mockUser, first_name: 'Updated Name' };

      mockUserModel.update.mockResolvedValue([1, [updatedUser]]);

      const result = await repository.update('user-123', updateData);

      expect(mockUserModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 'user-123' },
        returning: true,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateData = { first_name: 'Updated Name' };

      mockUserModel.update.mockResolvedValue([0, []]);

      await expect(repository.update('user-123', updateData)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: 'user-123' },
        returning: true,
      });
    });

    it('should throw NotFoundException when update returns null user', async () => {
      const updateData = { first_name: 'Updated Name' };

      mockUserModel.update.mockResolvedValue([1, [null]]);

      await expect(repository.update('user-123', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error when database update fails', async () => {
      const updateData = { first_name: 'Updated Name' };
      const error = new Error('Database error');

      mockUserModel.update.mockRejectedValue(error);

      await expect(repository.update('user-123', updateData)).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockUserModel.destroy.mockResolvedValue(1);

      await repository.delete('user-123');

      expect(mockUserModel.destroy).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.destroy.mockResolvedValue(0);

      await expect(repository.delete('user-123')).rejects.toThrow(NotFoundException);
      expect(mockUserModel.destroy).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw error when database delete fails', async () => {
      const error = new Error('Database error');
      mockUserModel.destroy.mockRejectedValue(error);

      await expect(repository.delete('user-123')).rejects.toThrow(error);
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      mockUserModel.count.mockResolvedValue(1);

      const result = await repository.exists('test@example.com');

      expect(mockUserModel.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockUserModel.count.mockResolvedValue(0);

      const result = await repository.exists('test@example.com');

      expect(result).toBe(false);
    });

    it('should convert email to lowercase when checking existence', async () => {
      mockUserModel.count.mockResolvedValue(1);

      await repository.exists('TEST@EXAMPLE.COM');

      expect(mockUserModel.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw error when database query fails', async () => {
      const error = new Error('Database error');
      mockUserModel.count.mockRejectedValue(error);

      await expect(repository.exists('test@example.com')).rejects.toThrow(error);
    });
  });
});