import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PasswordHelper } from 'src/core/helpers/password.helper';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name, {
    timestamp: true,
  });
  private readonly passwordHelper: PasswordHelper = new PasswordHelper();

  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    createUserDto.first_name = createUserDto.first_name.trim();
    createUserDto.last_name = createUserDto.last_name.trim();
    createUserDto.email = createUserDto.email.toLowerCase().trim();

    const hashPassword: string = await this.passwordHelper.encryptPassword(
      createUserDto.password,
    );

    const emailExists: User | null = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    try {
      await this.usersRepository.create({
        ...createUserDto,
        password: hashPassword,
      });
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.findAll<User>();
    } catch (error) {
      this.logger.error('Error fetching users from the database', error);
      throw new InternalServerErrorException(
        'Error fetching users from the database',
      );
    }
  }
}
