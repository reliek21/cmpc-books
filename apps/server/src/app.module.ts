import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'cmpc123',
      password: process.env.DATABASE_PASSWORD || 'postgrescmpc',
      database: process.env.DATABASE_NAME || 'cmpc',
      autoLoadModels: true,
      synchronize: true,
      sync: { force: true }, // This will drop and recreate tables
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES || '1d' },
      global: true,
    }),
    UsersModule,
    AuthModule,
    BooksModule,
  ],
})
export class AppModule {}
