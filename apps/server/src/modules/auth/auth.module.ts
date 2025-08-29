import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { usersProviders } from '../users/users.providers';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ...usersProviders],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES || '1d' },
    }),
  ],
})
export class AuthModule {}
