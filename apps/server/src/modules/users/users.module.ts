import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from '../../core/helpers/password.service';
import { PasswordHelper } from '../../core/helpers/password.helper';

@Module({
  controllers: [UsersController],
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    PasswordHelper,
    ...usersProviders,
  ],
  exports: [UserService, UserRepository],
})
export class UsersModule {}
