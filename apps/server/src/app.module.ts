import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'cmpc123',
      password: 'postgrescmpc',
      database: 'cmpc',
      autoLoadModels: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    BooksModule,
  ],
})
export class AppModule {}
