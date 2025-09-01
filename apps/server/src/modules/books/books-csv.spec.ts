import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterBooksDto } from './dto/filter-books.dto';
import { Response } from 'express';

describe('BooksController - CSV Export', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    exportToCsv: jest.fn(),
  };

  const mockUploadService = {};
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToCsv', () => {
    it('should export books to CSV', async () => {
      const filterDto: FilterBooksDto = {
        search: 'test',
        genre: 'Fiction',
      };

      const csvData = 'ID,Title,Author,Publisher,Genre,Active,Image URL,User ID,Created At,Updated At\n1,"Test Book","Test Author","Test Publisher","Fiction","Yes","","1","2023-01-01T00:00:00.000Z","2023-01-01T00:00:00.000Z"';

      mockBooksService.exportToCsv.mockResolvedValue(csvData);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.exportToCsv(filterDto, mockResponse);

      expect(service.exportToCsv).toHaveBeenCalledWith(filterDto);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="books.csv"',
      });
      expect(mockResponse.send).toHaveBeenCalledWith(csvData);
    });

    it('should handle empty filter', async () => {
      const filterDto: FilterBooksDto = {};

      const csvData = 'ID,Title,Author,Publisher,Genre,Active,Image URL,User ID,Created At,Updated At\n';

      mockBooksService.exportToCsv.mockResolvedValue(csvData);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.exportToCsv(filterDto, mockResponse);

      expect(service.exportToCsv).toHaveBeenCalledWith(filterDto);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="books.csv"',
      });
      expect(mockResponse.send).toHaveBeenCalledWith(csvData);
    });

    it('should propagate service errors', async () => {
      const filterDto: FilterBooksDto = {};
      const error = new Error('Export failed');

      mockBooksService.exportToCsv.mockRejectedValue(error);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(controller.exportToCsv(filterDto, mockResponse)).rejects.toThrow('Export failed');
      expect(service.exportToCsv).toHaveBeenCalledWith(filterDto);
    });
  });
});

describe('BooksService - CSV Export', () => {
  let service: BooksService;

  const mockBookModel = {
    findAll: jest.fn(),
  };

  beforeEach(() => {
    service = new BooksService(mockBookModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToCsv', () => {
    it('should generate CSV from books data', async () => {
      const filterDto: FilterBooksDto = {
        search: 'test',
      };

      const mockBooks = [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          publisher: 'Test Publisher',
          genre: 'Fiction',
          isActive: true,
          imageUrl: null,
          userId: 1,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      // Mock the findAll method that's called internally
      const mockFindAll = jest.spyOn(service, 'findAll');
      mockFindAll.mockResolvedValue({
        data: mockBooks,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await service.exportToCsv(filterDto);

      expect(result).toContain('ID,Title,Author,Publisher,Genre,Active,Image URL,User ID,Created At,Updated At');
      expect(result).toContain('1,"Test Book","Test Author","Test Publisher","Fiction",Yes,,1,2023-01-01T00:00:00.000Z,2023-01-01T00:00:00.000Z');
      expect(mockFindAll).toHaveBeenCalledWith({
        ...filterDto,
        page: 1,
        per_page: 999999,
      });
    });

    it('should handle empty result set', async () => {
      const filterDto: FilterBooksDto = {};

      const mockFindAll = jest.spyOn(service, 'findAll');
      mockFindAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
      });

      const result = await service.exportToCsv(filterDto);

      expect(result).toContain('ID,Title,Author,Publisher,Genre,Active,Image URL,User ID,Created At,Updated At');
      expect(result.split('\n')).toHaveLength(2); // Header + empty line
    });

    it('should handle books with special characters', async () => {
      const filterDto: FilterBooksDto = {};

      const mockBooks = [
        {
          id: 1,
          title: 'Test "Book" with quotes',
          author: 'Test, Author',
          publisher: 'Test\nPublisher',
          genre: 'Fiction',
          isActive: false,
          imageUrl: 'http://example.com/image.jpg',
          userId: 1,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      const mockFindAll = jest.spyOn(service, 'findAll');
      mockFindAll.mockResolvedValue({
        data: mockBooks,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await service.exportToCsv(filterDto);

      expect(result).toContain('""Test ""Book"" with quotes""'); // Properly escaped quotes
      expect(result).toContain('"Test, Author"'); // Properly quoted comma
      expect(result).toContain('No'); // isActive false -> "No"
      expect(result).toContain('http://example.com/image.jpg'); // imageUrl included
    });
  });
});
