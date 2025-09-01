import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CoreModule } from '../../core';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsersModule, CoreModule, JwtModule],
  exports: [AuthService],
})
export class AuthModule {}
