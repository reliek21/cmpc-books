import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel(Book)
    private bookModel: typeof Book,
  ) {}

  async create(
    createBookDto: CreateBookDto & { userId?: string },
  ): Promise<Book> {
    try {
      const bookData = {
        title: createBookDto.title,
        author: createBookDto.author,
        publisher: createBookDto.publisher,
        genre: createBookDto.genre,
        isActive: createBookDto.available ?? true,
        imageUrl: createBookDto.image_url,
        userId: createBookDto.userId,
      };

      const book = await this.bookModel.create(bookData as any);
      this.logger.log(`Book created successfully with ID: ${book.id}`);
      return book;
    } catch (error) {
      this.logger.error(
        `Error creating book: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll(filterDto: FilterBooksDto): Promise<{
    data: Book[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> {
    try {
      this.logger.debug(
        `Finding books with filters: ${JSON.stringify(filterDto)}`,
      );
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

      const where: any = {};

      if (search) {
        where[Op.or] = [
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

      let order: any[] = [['createdAt', 'DESC']];

      if (sort) {
        const sortFields = sort.split(',').map((s) => s.trim());
        order = sortFields.map((sortField) => {
          const [field, direction = 'asc'] = sortField.split(':');

          // Map frontend field names to database field names
          let dbField = field;
          switch (field) {
            case 'created_at':
            case 'createdAt':
              dbField = 'createdAt';
              break;
            case 'updated_at':
            case 'updatedAt':
              dbField = 'updatedAt';
              break;
            case 'available':
            case 'isActive':
              dbField = 'isActive';
              break;
            case 'imageUrl':
            case 'image_url':
              dbField = 'imageUrl';
              break;
            default:
              // For standard fields like title, author, publisher, genre
              dbField = field;
          }

          this.logger.debug(`Sorting by ${dbField} ${direction.toUpperCase()}`);
          return [dbField, direction.toUpperCase()];
        });
      }

      const offset = (page - 1) * per_page;

      const { rows: data, count: total } = await this.bookModel.findAndCountAll(
        {
          where,
          order,
          limit: per_page,
          offset,
        },
      );

      const total_pages = Math.ceil(total / per_page);

      this.logger.log(
        `Found ${total} books (page ${page}/${total_pages}, ${data.length} returned)`,
      );

      return {
        data,
        total,
        page,
        per_page,
        total_pages,
      };
    } catch (error) {
      this.logger.error(`Error finding books: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Book> {
    try {
      this.logger.debug(`Finding book with ID: ${id}`);
      const book = await this.bookModel.findByPk(id);
      if (!book) {
        this.logger.warn(`Book with ID ${id} not found`);
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      this.logger.debug(`Book found: ${book.title}`);
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding book with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      this.logger.log(`Updating book with ID: ${id}`);
      const book = await this.findOne(id);
      await book.update(updateBookDto);
      this.logger.log(`Book updated successfully: ${book.title} (ID: ${id})`);
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating book with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async softDelete(id: number): Promise<Book> {
    try {
      this.logger.log(`Soft deleting book with ID: ${id}`);
      const book = await this.findOne(id);
      await book.destroy(); // Soft delete with paranoid: true
      this.logger.log(
        `Book soft deleted successfully: ${book.title} (ID: ${id})`,
      );
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error soft deleting book with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Force deleting book with ID: ${id}`);
      const book = await this.findOne(id);
      await book.destroy({ force: true }); // Hard delete
      this.logger.log(
        `Book force deleted successfully: ${book.title} (ID: ${id})`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error force deleting book with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async restore(id: number): Promise<Book> {
    try {
      this.logger.log(`Restoring book with ID: ${id}`);
      const book = await this.bookModel.findByPk(id, { paranoid: false });
      if (!book) {
        this.logger.warn(`Book with ID ${id} not found for restoration`);
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      if (!book.deletedAt) {
        this.logger.warn(`Book with ID ${id} is not deleted, cannot restore`);
        throw new Error(`Book with ID ${id} is not deleted`);
      }
      await book.restore();
      this.logger.log(`Book restored successfully: ${book.title} (ID: ${id})`);
      return book;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof Error) {
        throw error;
      }
      this.logger.error(
        `Error restoring book with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findDeleted(): Promise<Book[]> {
    try {
      this.logger.debug('Finding all deleted books');
      const books = await this.bookModel
        .findAll({
          where: {},
          paranoid: false,
          order: [['deletedAt', 'DESC']],
        })
        .then((books) => books.filter((book) => book.deletedAt !== null));

      this.logger.log(`Found ${books.length} deleted books`);
      return books;
    } catch (error) {
      this.logger.error(
        `Error finding deleted books: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getFilterOptions(): Promise<{
    genres: string[];
    authors: string[];
    publishers: string[];
  }> {
    try {
      this.logger.debug('Fetching filter options from database');
      const sequelize = this.bookModel.sequelize;
      if (!sequelize) {
        this.logger.error('Sequelize instance not found');
        throw new Error('Sequelize instance not found');
      }

      const [genresResult, authorsResult, publishersResult] = await Promise.all(
        [
          sequelize.query(
            "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre",
            { type: 'SELECT' },
          ),
          sequelize.query(
            "SELECT DISTINCT author FROM books WHERE author IS NOT NULL AND author != '' ORDER BY author",
            { type: 'SELECT' },
          ),
          sequelize.query(
            "SELECT DISTINCT publisher FROM books WHERE publisher IS NOT NULL AND publisher != '' ORDER BY publisher",
            { type: 'SELECT' },
          ),
        ],
      );

      const genres = (genresResult as { genre: string }[])
        .map((item) => item.genre)
        .filter(Boolean);
      const authors = (authorsResult as { author: string }[])
        .map((item) => item.author)
        .filter(Boolean);
      const publishers = (publishersResult as { publisher: string }[])
        .map((item) => item.publisher)
        .filter(Boolean);

      this.logger.log(
        `Filter options fetched: ${genres.length} genres, ${authors.length} authors, ${publishers.length} publishers`,
      );

      return {
        genres,
        authors,
        publishers,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching filter options: ${error.message}`,
        error.stack,
      );
      return {
        genres: [],
        authors: [],
        publishers: [],
      };
    }
  }

  async exportToCsv(filterDto: FilterBooksDto): Promise<string> {
    try {
      this.logger.debug(
        `Exporting books to CSV with filters: ${JSON.stringify(filterDto)}`,
      );

      // Reuse the existing findAll method logic to get books
      const result = await this.findAll({
        ...filterDto,
        page: 1,
        per_page: 999999,
      });
      const books = result.data;

      // Transform data for CSV export
      const csvData = books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        genre: book.genre,
        isActive: book.isActive ? 'Yes' : 'No',
        imageUrl: book.imageUrl || '',
        userId: book.userId,
        createdAt: book.createdAt.toISOString(),
        updatedAt: book.updatedAt.toISOString(),
      }));

      // Generate CSV manually for now
      const csvHeaders = [
        'ID',
        'Title',
        'Author',
        'Publisher',
        'Genre',
        'Active',
        'Image URL',
        'User ID',
        'Created At',
        'Updated At',
      ];

      const csvRows = csvData.map((book) => [
        book.id,
        `"${book.title.replace(/"/g, '""')}"`,
        `"${book.author.replace(/"/g, '""')}"`,
        `"${book.publisher.replace(/"/g, '""')}"`,
        `"${book.genre.replace(/"/g, '""')}"`,
        book.isActive,
        book.imageUrl,
        book.userId,
        book.createdAt,
        book.updatedAt,
      ]);

      const csv = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.join(',')),
      ].join('\n');

      this.logger.log(`Exported ${books.length} books to CSV`);
      return csv;
    } catch (error) {
      this.logger.error(
        `Error exporting books to CSV: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
