import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { PasswordService } from '../../core/services/password.service';
import { PasswordHelper } from '../../core/helpers/password.helper';
import { Book } from '../books/entities/book.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, Book])],
  controllers: [UsersController],
  providers: [UserService, UserRepository, PasswordService, PasswordHelper],
  exports: [UserService, UserRepository],
})
export class UsersModule {}
