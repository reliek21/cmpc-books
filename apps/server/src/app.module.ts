import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { databaseProviders } from './config/database.providers';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [UsersModule, AuthModule, BooksModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
