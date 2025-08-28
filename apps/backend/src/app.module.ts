import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { databaseProviders } from './config/database.providers';

@Module({
  imports: [UsersModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
