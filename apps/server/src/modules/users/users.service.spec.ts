import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UserService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from 'src/core';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './types';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let repo: {
    exists: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
    findByEmail: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let passwordService: { hashPassword: jest.Mock };

  // A full DB-like object with password (as POJO to make excludePassword work in current impl)
  const userFromRepoFull: any = {
    id: 'u-123',
    email: 'john@doe.com',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    password: 'hashed:abc',
  };

  // Expected shape returned to callers (without password)
  const userWithoutPassword: IUser = {
    id: 'u-123',
    email: 'john@doe.com',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: new Date(),
  };

  const createDto: CreateUserDto = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    password: 'StrongPass123!',
  };

  beforeEach(async () => {
    repo = {
      exists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repo },
        { provide: PasswordService, useValue: passwordService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a user, hash password, and return user without password', async () => {
      repo.exists.mockResolvedValue(false);
      passwordService.hashPassword.mockResolvedValue('hashed:pass');
      repo.create.mockResolvedValue({
        ...userFromRepoFull,
        password: 'hashed:pass',
      } as unknown as User);

      const result = await service.createUser(createDto);

      expect(repo.exists).toHaveBeenCalledWith(createDto.email);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        createDto.password,
      );
      expect(repo.create).toHaveBeenCalledWith({
        ...createDto,
        password: 'hashed:pass',
      });
      expect(result).toEqual(userWithoutPassword);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.exists.mockResolvedValue(true);

      await expect(service.createUser(createDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should map unexpected repo errors to InternalServerErrorException', async () => {
      repo.exists.mockResolvedValue(false);
      passwordService.hashPassword.mockResolvedValue('hashed:pass');
      repo.create.mockRejectedValue(new Error('db blew up'));

      await expect(service.createUser(createDto)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      repo.findById.mockResolvedValue(userFromRepoFull as User);

      const result = await service.getUserById('u-123');

      expect(repo.findById).toHaveBeenCalledWith('u-123');
      expect(result).toEqual(userWithoutPassword);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getUserById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should map unexpected errors to InternalServerErrorException (via excludePassword block)', async () => {
      // Force excludePassword to throw by returning something odd
      repo.findById.mockResolvedValue({} as User);
      // Monkey-patch excludePassword to throw (simulate serialization issue)
      const spy = jest
        .spyOn<any, any>(service as any, 'excludePassword')
        .mockImplementation(() => {
          throw new Error('boom');
        });

      await expect(service.getUserById('u-123')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );

      spy.mockRestore();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user without password', async () => {
      repo.findByEmail.mockResolvedValue(userFromRepoFull as User);

      const result = await service.getUserByEmail('john@doe.com');

      expect(repo.findByEmail).toHaveBeenCalledWith('john@doe.com');
      expect(result).toEqual(userWithoutPassword);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(service.getUserByEmail('none@x.com')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should map unexpected errors to InternalServerErrorException (via excludePassword block)', async () => {
      repo.findByEmail.mockResolvedValue(userFromRepoFull as User);
      const spy = jest
        .spyOn<any, any>(service as any, 'excludePassword')
        .mockImplementation(() => {
          throw new Error('boom');
        });

      await expect(
        service.getUserByEmail('john@doe.com'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);

      spy.mockRestore();
    });
  });

  describe('getAllUsers', () => {
    it('should return a list without passwords', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const other = {
        ...userFromRepoFull,
        id: 'u-124',
        email: 'jane@doe.com',
        first_name: 'Jane',
      };
      repo.findAll.mockResolvedValue([userFromRepoFull as User, other as User]);

      const result = await service.getAllUsers();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      result.forEach((u) => expect((u as any).password).toBeUndefined());
    });

    it('should map repo errors to InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('db down'));

      await expect(service.getAllUsers()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('updateUser', () => {
    it('should hash new password when provided and return sanitized user', async () => {
      repo.findById.mockResolvedValue(userFromRepoFull as User);
      passwordService.hashPassword.mockResolvedValue('hashed:new');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updated = {
        ...userFromRepoFull,
        first_name: 'Johnny',
        password: 'hashed:new',
      };
      repo.update.mockResolvedValue(updated as User);

      const dto: UpdateUserDto = {
        first_name: 'Johnny',
        password: 'NewStrong123!',
      };

      const result = await service.updateUser('u-123', dto);

      expect(repo.findById).toHaveBeenCalledWith('u-123');
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        'NewStrong123!',
      );
      expect(repo.update).toHaveBeenCalledWith('u-123', {
        first_name: 'Johnny',
        password: 'hashed:new',
      });
      expect(result.first_name).toBe('Johnny');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).password).toBeUndefined();
    });

    it('should NOT hash password when not provided', async () => {
      repo.findById.mockResolvedValue(userFromRepoFull as User);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updated = { ...userFromRepoFull, last_name: 'Doe-Sr' };
      repo.update.mockResolvedValue(updated as User);

      const dto: UpdateUserDto = { last_name: 'Doe-Sr' };

      const result = await service.updateUser('u-123', dto);

      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('u-123', {
        last_name: 'Doe-Sr',
      });
      expect(result.last_name).toBe('Doe-Sr');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist before update', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateUser('missing', { first_name: 'X' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should map repo errors to InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(userFromRepoFull as User);
      repo.update.mockRejectedValue(new Error('write failed'));

      await expect(
        service.updateUser('u-123', { first_name: 'X' }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      repo.findById.mockResolvedValue(userFromRepoFull as User);
      repo.delete.mockResolvedValue(undefined);

      await expect(service.deleteUser('u-123')).resolves.toBeUndefined();

      expect(repo.findById).toHaveBeenCalledWith('u-123');
      expect(repo.delete).toHaveBeenCalledWith('u-123');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteUser('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('should map repo errors to InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(userFromRepoFull as User);
      repo.delete.mockRejectedValue(new Error('constraint error'));

      await expect(service.deleteUser('u-123')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
