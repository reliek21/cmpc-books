import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import type { Response } from 'express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() query: FilterBooksDto) {
    const result = await this.booksService.findAll(query);
    return result;
  }

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.booksService.exportCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('books.csv');
    res.send(csv);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.booksService.findOne(id);
  }

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    const created = await this.booksService.create(createBookDto);
    return { status: HttpStatus.CREATED, data: created };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    const updated = await this.booksService.update(id, updateBookDto);
    return { status: HttpStatus.OK, data: updated };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.booksService.remove(id);
    return { status: HttpStatus.NO_CONTENT };
  }
}
