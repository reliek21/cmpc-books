import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import { UploadService } from '../upload/upload.service';
import type { MulterFile } from '../upload/upload.service';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', UploadService.getMulterOptions()))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: MulterFile,
  ) {
    if (file) {
      createBookDto.imageUrl = this.uploadService.getFileUrl(file.filename);
    }
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterBooksDto) {
    return this.booksService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.restore(id);
  }

  @Get('deleted')
  findDeleted() {
    return this.booksService.findDeleted();
  }

  @Delete(':id/force')
  forceDelete(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.forceDelete(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image', UploadService.getMulterOptions()))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = this.uploadService.getFileUrl(file.filename);
    return this.booksService.update(id, { imageUrl });
  }
}
