import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';

import { ENV_SCHEMA, envLoader, CoreModule } from './core';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envLoader],

      validationSchema: ENV_SCHEMA,
    }),
    // Rate limit
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECURITY.JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('SECURITY.JWT_SECRET_TTL'),
        },
        global: true,
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DATABASE.HOST'),
        port: configService.get('DATABASE.PORT'),
        username: configService.get('DATABASE.USER'),
        password: configService.get('DATABASE.PASSWORD'),
        database: configService.get('DATABASE.NAME'),
        autoLoadModels: true,
        synchronize: true,
        sync: { alter: true }, // Use 'alter' to update the database schema without dropping tables
      }),
    }),
    UsersModule,
    CoreModule,
    AuthModule,
    BooksModule,
  ],
})
export class AppModule {}
