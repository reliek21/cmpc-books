import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { UploadModule } from '../upload/upload.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Book, User]), UploadModule],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
