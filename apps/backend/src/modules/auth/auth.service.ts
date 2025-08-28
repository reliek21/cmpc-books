import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordHelper } from 'src/core/helpers/password.helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name, {
    timestamp: true,
  });
  private readonly usersService: UsersService;
  private readonly passwordHelper: PasswordHelper = new PasswordHelper();

  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User,
    usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.usersService = usersService;
  }

  async registerWithEmail(createUserDto: CreateUserDto): Promise<void> {
    try {
      const findUser: User | null = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (findUser)
        throw new ConflictException(
          'Error registering user, please try with another email',
        );

      await this.usersService.create(createUserDto);
    } catch (error) {
      this.logger.error('Error during user registration', error);
      throw new InternalServerErrorException('Error during user registration');
    }
  }

  async loginWithEmail(loginUserDto: LoginUserDto) {
    const { email, password: providedPassword }: LoginUserDto = loginUserDto;

    const existUser: User | null = await this.usersRepository.findOne({
      where: { email },
    });
    if (!existUser) throw new UnauthorizedException('Invalid credentials');

    const match: boolean = await this.passwordHelper.comparePassword(
      providedPassword,
      existUser.password,
    );
    if (!match) throw new UnauthorizedException('Invalid credentials');
    if (!existUser.is_active)
      throw new UnauthorizedException('Account is not active');

    try {
      const payload: {
        sub: string;
        email: string;
      } = { sub: existUser.id, email: existUser.email };
      const accessToken: string = this.jwtService.sign(payload);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userData } = existUser;

      return {
        access_token: accessToken,
        user: {
          id: existUser.id,
          email: existUser.email,
          first_name: existUser.first_name,
          last_name: existUser.last_name,
        },
      };
    } catch (error) {
      this.logger.error('Error during login', error);
      throw new InternalServerErrorException('Error during login');
    }
  }
}
