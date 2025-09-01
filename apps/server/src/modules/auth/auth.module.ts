import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PasswordService } from '../../core/services/password.service';
import { PasswordHelper } from '../../core/helpers/password.helper';
import { JwtService } from '../../core/services/jwt.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService, PasswordHelper, JwtService],
  imports: [UsersModule],
  exports: [AuthService],
})
export class AuthModule {}
