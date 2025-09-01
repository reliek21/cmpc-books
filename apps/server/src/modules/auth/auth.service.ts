import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IAuthService,
  ILoginCredentials,
  IAuthResponse,
  IAuthUser,
  IAuthTokens,
  IJwtPayload,
} from '../../common/interfaces';

import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../../core';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRepository } from '../users/repositories/user.repository';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const email: string = createUserDto.email.toLowerCase();
    const exists: boolean = await this.userRepository.exists(email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    const hashed: string = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    try {
      await this.userRepository.create({
        ...createUserDto,
        email,
        password: hashed,
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('User with this email already exists');
      }
      this.logger.error('Error registering user', (error as Error)?.stack);
      throw new InternalServerErrorException('Error registering user');
    }
  }

  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    const email: string = credentials.email.toLowerCase();

    const user: User | null = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok: boolean = await this.passwordService.comparePassword(
      credentials.password,
      user.password,
    );

    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens: IAuthTokens = await this.signTokens(user);
    const authUser: IAuthUser = this.sanitizeUser(user);

    return {
      user: authUser,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    };
  }

  async validateToken(token: string): Promise<IAuthUser> {
    try {
      const payload: IJwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('SECURITY.JWT_SECRET'),
      });

      return {
        id: payload.sub,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        is_active: payload.is_active ?? true,
        created_at: payload.created_at
          ? new Date(payload.created_at)
          : undefined,
        updated_at: payload.updated_at
          ? new Date(payload.updated_at)
          : undefined,
        deleted_at: null,
      };
    } catch (error: any) {
      this.logger.warn('Invalid access token', (error as Error)?.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const payload: IJwtPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.config.get<string>('SECURITY.JWT_REFRESH'),
        },
      );

      const user: User | null = await this.userRepository.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Invalid token');

      return this.signTokens(user);
    } catch (error: any) {
      this.logger.warn('Invalid refresh token', (error as Error)?.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private sanitizeUser(user: User): IAuthUser {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const plain: Record<string, unknown> =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof (user as any).toJSON === 'function'
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          (user as any).toJSON()
        : (user as any);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = plain;
    return rest as unknown as IAuthUser;
  }

  private async signTokens(user: User): Promise<IAuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    const accessSecret = this.config.get<string>('SECURITY.JWT_SECRET')!;
    const refreshSecret = this.config.get<string>('SECURITY.JWT_REFRESH')!;
    const accessTtl =
      this.config.get<string>('SECURITY.JWT_SECRET_TTL') ?? '15m';
    const refreshTtl =
      this.config.get<string>('SECURITY.JWT_REFRESH_TTL') ?? '7d';

    const access_token = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessTtl,
    });

    const refresh_token = await this.jwtService.signAsync(
      { sub: payload.sub },
      { secret: refreshSecret, expiresIn: refreshTtl },
    );

    const decoded: { exp?: number } = this.jwtService.decode(access_token);
    const expires_in = decoded?.exp ?? Math.floor(Date.now() / 1000);

    return { access_token, refresh_token, expires_in };
  }
}
