import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
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
    title: 'Test Book',
    author: 'Test Author',
    publisher: 'Test Publisher',
    genre: 'Fiction',
    available: true,
    imageUrl: 'test-image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    update: jest.fn(),
    destroy: jest.fn(),
    restore: jest.fn(),
  };

  const mockBooks = [
    mockBook,
    {
      ...mockBook,
      id: 2,
      title: 'Test Book 2',
      author: 'Test Author 2',
    },
  ];

  beforeEach(async () => {
    // Mock Sequelize model
    mockBookModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
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
        author: 'New Author',
        publisher: 'New Publisher',
        genre: 'Science Fiction',
        available: true,
      };

      mockBookModel.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockBookModel.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(mockBook);
    });

    it('should create a book with image URL', async () => {
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        author: 'New Author',
        publisher: 'New Publisher',
        genre: 'Science Fiction',
        available: true,
        imageUrl: 'new-image.jpg',
      };

      mockBookModel.create.mockResolvedValue({ ...mockBook, ...createBookDto });

      const result = await service.create(createBookDto);

      expect(mockBookModel.create).toHaveBeenCalledWith(createBookDto);
      expect(result.imageUrl).toBe('new-image.jpg');
    });
  });

  describe('findAll', () => {
    it('should return paginated books without filters', async () => {
      const filterDto: FilterBooksDto = {
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        rows: mockBooks,
        count: 2,
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
        data: mockBooks,
        total: 2,
        page: 1,
        per_page: 10,
        total_pages: 1,
      });
    });

    it('should return filtered books by search term', async () => {
      const filterDto: FilterBooksDto = {
        search: 'Test',
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      const result = await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [expect.any(Symbol)]: [
            { title: { [expect.any(Symbol)]: '%Test%' } },
            { author: { [expect.any(Symbol)]: '%Test%' } },
            { publisher: { [expect.any(Symbol)]: '%Test%' } },
            { genre: { [expect.any(Symbol)]: '%Test%' } },
          ],
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });

      expect(result.data).toEqual([mockBook]);
    });

    it('should return filtered books by genre', async () => {
      const filterDto: FilterBooksDto = {
        genre: 'Fiction',
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          genre: { [expect.any(Symbol)]: '%Fiction%' },
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });
    });

    it('should return filtered books by availability', async () => {
      const filterDto: FilterBooksDto = {
        available: true,
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        rows: [mockBook],
        count: 1,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          available: true,
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });
    });

    it('should return sorted books', async () => {
      const filterDto: FilterBooksDto = {
        sort: 'title:asc,author:desc',
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        rows: mockBooks,
        count: 2,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        order: [['title', 'ASC'], ['author', 'DESC']],
        limit: 10,
        offset: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const filterDto: FilterBooksDto = {
        page: 2,
        per_page: 5,
      };

      const mockResponse = {
        rows: mockBooks,
        count: 12,
      };

      mockBookModel.findAndCountAll.mockResolvedValue(mockResponse);

      const result = await service.findAll(filterDto);

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        order: [['createdAt', 'DESC']],
        limit: 5,
        offset: 5, // (page - 1) * per_page = (2 - 1) * 5 = 5
      });

      expect(result.total_pages).toBe(3); // Math.ceil(12 / 5) = 3
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Book with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
        available: false,
      };

      const updatedBook = { ...mockBook, ...updateBookDto };
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.update.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateBookDto);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockBook.update).toHaveBeenCalledWith(updateBookDto);
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when updating non-existent book', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      const updateBookDto: UpdateBookDto = { title: 'Updated Title' };

      await expect(service.update(999, updateBookDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a book successfully', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.destroy.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockBook.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent book', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a deleted book successfully', async () => {
      const deletedBook = { ...mockBook, deletedAt: new Date() };
      mockBookModel.findByPk.mockResolvedValue(deletedBook);
      deletedBook.restore = jest.fn().mockResolvedValue(undefined);

      const result = await service.restore(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1, { paranoid: false });
      expect(deletedBook.restore).toHaveBeenCalled();
      expect(result).toEqual(deletedBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when book is not deleted', async () => {
      const activeBook = { ...mockBook, deletedAt: null };
      mockBookModel.findByPk.mockResolvedValue(activeBook);

      await expect(service.restore(1)).rejects.toThrow('Book with ID 1 is not deleted');
    });
  });

  describe('findDeleted', () => {
    it('should return only deleted books', async () => {
      const deletedBook = { ...mockBook, deletedAt: new Date() };
      const activeBook = { ...mockBook, id: 2, deletedAt: null };
      
      mockBookModel.findAll.mockResolvedValue([deletedBook, activeBook]);

      const result = await service.findDeleted();

      expect(mockBookModel.findAll).toHaveBeenCalledWith({
        where: {},
        paranoid: false,
        order: [['deletedAt', 'DESC']],
      });

      expect(result).toEqual([deletedBook]);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no deleted books', async () => {
      mockBookModel.findAll.mockResolvedValue([mockBook]);

      const result = await service.findDeleted();

      expect(result).toEqual([]);
    });
  });

  describe('forceDelete', () => {
    it('should permanently delete a book successfully', async () => {
      const deletedBook = { ...mockBook, deletedAt: new Date() };
      deletedBook.destroy = jest.fn().mockResolvedValue(undefined);
      mockBookModel.findByPk.mockResolvedValue(deletedBook);

      await service.forceDelete(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1, { paranoid: false });
      expect(deletedBook.destroy).toHaveBeenCalledWith({ force: true });
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.forceDelete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
