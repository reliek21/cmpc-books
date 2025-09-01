import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

describe('BooksService', () => {
  let service: BooksService;
  let mockBookModel: any;

  const mockBook = {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Scribner',
    genre: 'Fiction',
    isActive: true,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    save: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    restore: jest.fn(),
  };

  const mockDeletedBook = {
    ...mockBook,
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    mockBookModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
      sequelize: {
        query: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        author: 'Test Author',
        publisher: 'Test Publisher',
        genre: 'Fiction',
        isActive: true,
        userId: 'user-123',
      };

      mockBookModel.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockBookModel.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(mockBook);
    });

    it('should throw error when creation fails', async () => {
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        author: 'Test Author',
        publisher: 'Test Publisher',
        genre: 'Fiction',
        isActive: true,
        userId: 'user-123',
      };

      const error = new Error('Database error');
      mockBookModel.create.mockRejectedValue(error);

      await expect(service.create(createBookDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return paginated books without filters', async () => {
      const filterDto: FilterBooksDto = {};
      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      const result = await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });
      expect(result).toEqual({
        data: [mockBook],
        total: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      });
    });

    it('should apply search filter', async () => {
      const filterDto: FilterBooksDto = { search: 'Gatsby' };
      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: [
              { title: { [Op.iLike]: '%Gatsby%' } },
              { author: { [Op.iLike]: '%Gatsby%' } },
              { publisher: { [Op.iLike]: '%Gatsby%' } },
              { genre: { [Op.iLike]: '%Gatsby%' } },
            ],
          }),
        }),
      );
    });

    it('should apply genre filter', async () => {
      const filterDto: FilterBooksDto = { genre: 'Fiction' };
      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            genre: { [Op.iLike]: '%Fiction%' },
          }),
        }),
      );
    });

    it('should apply sorting', async () => {
      const filterDto: FilterBooksDto = { sort: 'title:asc,author:desc' };
      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['title', 'ASC'], ['author', 'DESC']],
        }),
      );
    });

    it('should handle pagination', async () => {
      const filterDto: FilterBooksDto = { page: 2, per_page: 5 };
      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 5,
        }),
      );
    });

    it('should throw error when query fails', async () => {
      const filterDto: FilterBooksDto = {};
      const error = new Error('Database error');

      mockBookModel.findAndCountAll.mockRejectedValue(error);

      await expect(service.findAll(filterDto)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return a book when found', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      mockBookModel.findByPk.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Title' };
      const updatedBook = { ...mockBook, title: 'Updated Title' };

      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.update.mockImplementation((dto) => {
        Object.assign(mockBook, dto);
        return Promise.resolve(updatedBook);
      });

      const result = await service.update(1, updateBookDto);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockBook.update).toHaveBeenCalledWith(updateBookDto);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when book not found', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Title' };

      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.update(1, updateBookDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when update fails', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Title' };
      const error = new Error('Update failed');

      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.update.mockRejectedValue(error);

      await expect(service.update(1, updateBookDto)).rejects.toThrow(error);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a book successfully', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.destroy.mockResolvedValue(mockBook);

      const result = await service.softDelete(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockBook.destroy).toHaveBeenCalledWith();
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.softDelete(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when destroy fails', async () => {
      const error = new Error('Destroy failed');

      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.destroy.mockRejectedValue(error);

      await expect(service.softDelete(1)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should force delete a book successfully', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.destroy.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockBook.destroy).toHaveBeenCalledWith({ force: true });
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when force destroy fails', async () => {
      const error = new Error('Force destroy failed');

      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.destroy.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(error);
    });
  });

  describe('restore', () => {
    it('should restore a deleted book successfully', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockDeletedBook);
      mockDeletedBook.restore.mockResolvedValue(mockDeletedBook);

      const result = await service.restore(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1, { paranoid: false });
      expect(mockDeletedBook.restore).toHaveBeenCalled();
      expect(result).toEqual(mockDeletedBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.restore(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw Error when book is not deleted', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook); // Book without deletedAt

      await expect(service.restore(1)).rejects.toThrow('Book with ID 1 is not deleted');
    });

    it('should throw error when restore fails', async () => {
      const error = new Error('Restore failed');

      mockBookModel.findByPk.mockResolvedValue(mockDeletedBook);
      mockDeletedBook.restore.mockRejectedValue(error);

      await expect(service.restore(1)).rejects.toThrow(error);
    });
  });

  describe('findDeleted', () => {
    it('should return deleted books', async () => {
      const deletedBooks = [mockDeletedBook];
      mockBookModel.findAll.mockResolvedValue(deletedBooks);

      const result = await service.findDeleted();

      expect(mockBookModel.findAll).toHaveBeenCalledWith({
        where: {},
        paranoid: false,
        order: [['deletedAt', 'DESC']],
      });
      expect(result).toEqual(deletedBooks);
    });

    it('should filter out books without deletedAt', async () => {
      const booksWithNullDeletedAt = [
        mockDeletedBook,
        { ...mockBook, deletedAt: null },
      ];
      mockBookModel.findAll.mockResolvedValue(booksWithNullDeletedAt);

      const result = await service.findDeleted();

      expect(result).toEqual([mockDeletedBook]);
    });

    it('should return empty array when no deleted books', async () => {
      mockBookModel.findAll.mockResolvedValue([]);

      const result = await service.findDeleted();

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Query failed');
      mockBookModel.findAll.mockRejectedValue(error);

      await expect(service.findDeleted()).rejects.toThrow(error);
    });
  });

  describe('getFilterOptions', () => {
    it('should return filter options successfully', async () => {
      const mockGenres = [{ genre: 'Fiction' }, { genre: 'Non-Fiction' }];
      const mockAuthors = [{ author: 'Author 1' }, { author: 'Author 2' }];
      const mockPublishers = [{ publisher: 'Publisher 1' }, { publisher: 'Publisher 2' }];

      mockBookModel.sequelize.query
        .mockResolvedValueOnce(mockGenres)
        .mockResolvedValueOnce(mockAuthors)
        .mockResolvedValueOnce(mockPublishers);

      const result = await service.getFilterOptions();

      expect(mockBookModel.sequelize.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        genres: ['Fiction', 'Non-Fiction'],
        authors: ['Author 1', 'Author 2'],
        publishers: ['Publisher 1', 'Publisher 2'],
      });
    });

    it('should filter out null and empty values', async () => {
      const mockGenres = [
        { genre: 'Fiction' },
        { genre: null },
        { genre: '' },
        { genre: 'Non-Fiction' }
      ];

      mockBookModel.sequelize.query
        .mockResolvedValueOnce(mockGenres)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getFilterOptions();

      expect(result.genres).toEqual(['Fiction', 'Non-Fiction']);
    });

    it('should return empty arrays when sequelize instance not found', async () => {
      mockBookModel.sequelize = null;

      const result = await service.getFilterOptions();

      expect(result).toEqual({
        genres: [],
        authors: [],
        publishers: [],
      });
    });

    it('should return empty arrays when query fails', async () => {
      const error = new Error('Query failed');
      mockBookModel.sequelize.query.mockRejectedValue(error);

      const result = await service.getFilterOptions();

      expect(result).toEqual({
        genres: [],
        authors: [],
        publishers: [],
      });
    });
  });
});