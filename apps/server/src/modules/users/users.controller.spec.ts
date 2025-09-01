import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './types';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UserService>;

  const mockUser: IUser = {
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

  const mockUsers: IUser[] = [
    mockUser,
    {
      ...mockUser,
      id: 'u-124',
      email: 'jane@doe.com',
      first_name: 'Jane',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getAllUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UserService);
  });

  describe('create', () => {
    it('should create a user and return it without password', async () => {
      jest.spyOn(service, 'createUser').mockResolvedValue(mockUser);

      const result: IUser = await controller.create(createDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.createUser).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).password).toBeUndefined();
    });

    it('should propagate ConflictException when email already exists', async () => {
      service.createUser.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.create(createDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should propagate InternalServerErrorException for unexpected errors', async () => {
      service.createUser.mockRejectedValue(
        new InternalServerErrorException('Unexpected error'),
      );

      await expect(controller.create(createDto)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      service.getAllUsers.mockResolvedValue(mockUsers);

      const result: IUser[] = await controller.findAll();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getAllUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      result.forEach((user) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect((user as any).password).toBeUndefined();
      });
    });

    it('should propagate InternalServerErrorException when service fails', async () => {
      service.getAllUsers.mockRejectedValue(
        new InternalServerErrorException('Database down'),
      );

      await expect(controller.findAll()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
