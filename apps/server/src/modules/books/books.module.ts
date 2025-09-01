import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { UploadModule } from '../upload/upload.module';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [SequelizeModule.forFeature([Book, User]), UploadModule, AuthModule],
  controllers: [BooksController],
  providers: [BooksService, JwtAuthGuard],
  exports: [BooksService],
})
export class BooksModule {}
