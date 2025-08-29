import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private bookModel: typeof Book,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    return await this.bookModel.create(createBookDto as any);
  }

  async findAll(filterDto: FilterBooksDto): Promise<{
    data: Book[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> {
    const {
      search,
      genre,
      publisher,
      author,
      available,
      sort,
      page = 1,
      per_page = 10,
    } = filterDto;

    // Build where clause
    const where: any = {};

    if (search) {
      where['$or'] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { publisher: { [Op.iLike]: `%${search}%` } },
        { genre: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (genre) {
      where.genre = { [Op.iLike]: `%${genre}%` };
    }

    if (publisher) {
      where.publisher = { [Op.iLike]: `%${publisher}%` };
    }

    if (author) {
      where.author = { [Op.iLike]: `%${author}%` };
    }

    if (available !== undefined) {
      where.available = available;
    }

    // Build order clause
    let order: any[] = [['createdAt', 'DESC']];

    if (sort) {
      const sortFields = sort.split(',').map((s) => s.trim());
      order = sortFields.map((sortField) => {
        const [field, direction = 'asc'] = sortField.split(':');
        return [field, direction.toUpperCase()];
      });
    }

    // Calculate offset
    const offset = (page - 1) * per_page;

    // Execute query
    const { rows: data, count: total } = await this.bookModel.findAndCountAll({
      where,
      order,
      limit: per_page,
      offset,
    });

    const total_pages = Math.ceil(total / per_page);

    return {
      data,
      total,
      page,
      per_page,
      total_pages,
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookModel.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    await book.update(updateBookDto);
    return book;
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await book.destroy();
  }
}
