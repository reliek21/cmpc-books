import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import { Book } from './entities/book.entity';
import { Op } from 'sequelize';

@Injectable()
export class BooksService {
  private readonly logger: Logger = new Logger(BooksService.name, {
    timestamp: true,
  });

  constructor(
    @Inject('BOOKS_REPOSITORY')
    private booksRepository: typeof Book,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      return await this.booksRepository.create({ ...createBookDto });
    } catch (error) {
      this.logger.error('Error creating book', error);
      throw new InternalServerErrorException('Error creating book');
    }
  }

  async findAll(filter: FilterBooksDto): Promise<{ data: Book[]; total: number }> {
    try {
      const where: any = {};
      if (filter.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filter.search}%` } },
          { author: { [Op.iLike]: `%${filter.search}%` } },
          { publisher: { [Op.iLike]: `%${filter.search}%` } },
        ];
      }
      // Exclude soft-deleted
      where.deleted_at = null;

      const page = filter.page ?? 1;
      const per_page = filter.per_page ?? 10;
      const offset = (page - 1) * per_page;

      // Sorting
      let order: any = [['created_at', 'DESC']];
      if (filter.sort) {
        order = filter.sort.split(',').map((s) => {
          const [field, dir] = s.split(':');
          return [field, dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'];
        });
      }

      const { rows, count } = await this.booksRepository.findAndCountAll({
        where,
        limit: per_page,
        offset,
        order,
      });

      return { data: rows, total: count };
    } catch (error) {
      this.logger.error('Error fetching books', error);
      throw new InternalServerErrorException('Error fetching books');
    }
  }

  async findOne(id: string): Promise<Book | null> {
    try {
      return await this.booksRepository.findOne({ where: { id, deleted_at: null } });
    } catch (error) {
      this.logger.error('Error fetching book', error);
      throw new InternalServerErrorException('Error fetching book');
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book | null> {
    try {
      const book = await this.booksRepository.findByPk(id);
      if (!book) return null;
      await book.update({ ...updateBookDto });
      return book;
    } catch (error) {
      this.logger.error('Error updating book', error);
      throw new InternalServerErrorException('Error updating book');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const book = await this.booksRepository.findByPk(id);
      if (!book) return;
      // Soft delete by setting deleted_at
      await book.update({ deleted_at: new Date() });
    } catch (error) {
      this.logger.error('Error deleting book', error);
      throw new InternalServerErrorException('Error deleting book');
    }
  }

  async exportCsv(): Promise<string> {
    try {
      const books = await this.booksRepository.findAll({ where: { deleted_at: null } });
      // Simple CSV serialization
      const headers = ['id', 'title', 'author', 'publisher', 'genre', 'available'];
      const rows = books.map((b) =>
        headers.map((h) => String((b as any)[h] ?? '')).join(','),
      );
      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      this.logger.error('Error exporting CSV', error);
      throw new InternalServerErrorException('Error exporting CSV');
    }
  }
}
