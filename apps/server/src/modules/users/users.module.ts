import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { Book } from '../books/entities/book.entity';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from '../../core/services/password.service';
import { PasswordHelper } from '../../core/helpers/password.helper';

@Module({
  imports: [SequelizeModule.forFeature([User, Book])],
  controllers: [UsersController],
  providers: [UserService, UserRepository, PasswordService, PasswordHelper],
  exports: [UserService, UserRepository],
})
export class UsersModule {}
