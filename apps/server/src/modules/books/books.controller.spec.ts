import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { UploadService } from '../upload/upload.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let booksService: jest.Mocked<BooksService>;
  let uploadService: jest.Mocked<UploadService>;

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
  };

  const mockFile = {
    filename: 'test-image.jpg',
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
    fieldname: 'image',
    encoding: '7bit',
    stream: null,
    destination: '/uploads',
    path: '/uploads/test-image.jpg',
  };

  beforeEach(async () => {
    const mockBooksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      findDeleted: jest.fn(),
      forceDelete: jest.fn(),
    };

    const mockUploadService = {
      getFileUrl: jest.fn(),
      getMulterOptions: jest.fn(),
    };

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
    }).compile();

    controller = module.get<BooksController>(BooksController);
    booksService = module.get(BooksService);
    uploadService = module.get(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book without image', async () => {
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        author: 'New Author',
        publisher: 'New Publisher',
        genre: 'Science Fiction',
        available: true,
      };

      booksService.create.mockResolvedValue(mockBook);

      const result = await controller.create(createBookDto);

      expect(booksService.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(mockBook);
    });

    it('should create a book with image', async () => {
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        author: 'New Author',
        publisher: 'New Publisher',
        genre: 'Science Fiction',
        available: true,
      };

      const expectedDto = {
        ...createBookDto,
        imageUrl: 'http://localhost:3000/uploads/test-image.jpg',
      };

      uploadService.getFileUrl.mockReturnValue('http://localhost:3000/uploads/test-image.jpg');
      booksService.create.mockResolvedValue({ ...mockBook, ...expectedDto });

      const result = await controller.create(createBookDto, mockFile);

      expect(uploadService.getFileUrl).toHaveBeenCalledWith('test-image.jpg');
      expect(booksService.create).toHaveBeenCalledWith(expectedDto);
      expect(result.imageUrl).toBe('http://localhost:3000/uploads/test-image.jpg');
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const filterDto: FilterBooksDto = {
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        data: [mockBook],
        total: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      };

      booksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(filterDto);

      expect(booksService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockResponse);
    });

    it('should handle search filters', async () => {
      const filterDto: FilterBooksDto = {
        search: 'Test',
        genre: 'Fiction',
        page: 1,
        per_page: 10,
      };

      const mockResponse = {
        data: [mockBook],
        total: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      };

      booksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(filterDto);

      expect(booksService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      booksService.findOne.mockResolvedValue(mockBook);

      const result = await controller.findOne(1);

      expect(booksService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
        available: false,
      };

      const updatedBook = { ...mockBook, ...updateBookDto };
      booksService.update.mockResolvedValue(updatedBook);

      const result = await controller.update(1, updateBookDto);

      expect(booksService.update).toHaveBeenCalledWith(1, updateBookDto);
      expect(result).toEqual(updatedBook);
    });
  });

  describe('remove', () => {
    it('should soft delete a book', async () => {
      booksService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(booksService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('should restore a deleted book', async () => {
      const restoredBook = { ...mockBook };
      booksService.restore.mockResolvedValue(restoredBook);

      const result = await controller.restore(1);

      expect(booksService.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(restoredBook);
    });
  });

  describe('findDeleted', () => {
    it('should return deleted books', async () => {
      const deletedBooks = [{ ...mockBook, deletedAt: new Date() }];
      booksService.findDeleted.mockResolvedValue(deletedBooks);

      const result = await controller.findDeleted();

      expect(booksService.findDeleted).toHaveBeenCalled();
      expect(result).toEqual(deletedBooks);
    });
  });

  describe('forceDelete', () => {
    it('should permanently delete a book', async () => {
      booksService.forceDelete.mockResolvedValue(undefined);

      await controller.forceDelete(1);

      expect(booksService.forceDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const updatedBook = {
        ...mockBook,
        imageUrl: 'http://localhost:3000/uploads/test-image.jpg',
      };

      uploadService.getFileUrl.mockReturnValue('http://localhost:3000/uploads/test-image.jpg');
      booksService.update.mockResolvedValue(updatedBook);

      const result = await controller.uploadImage(1, mockFile);

      expect(uploadService.getFileUrl).toHaveBeenCalledWith('test-image.jpg');
      expect(booksService.update).toHaveBeenCalledWith(1, {
        imageUrl: 'http://localhost:3000/uploads/test-image.jpg',
      });
      expect(result).toEqual(updatedBook);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadImage(1, undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.uploadImage(1, undefined as any)).rejects.toThrow(
        'Image file is required',
      );
    });
  });
});
