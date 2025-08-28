import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { databaseProviders } from './config/database.providers';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
