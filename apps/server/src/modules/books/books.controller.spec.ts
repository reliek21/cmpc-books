import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<BooksService>;

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
  };

  const mockDeletedBook = {
    ...mockBook,
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            remove: jest.fn(),
            restore: jest.fn(),
            findDeleted: jest.fn(),
            getFilterOptions: jest.fn(),
          },
        },
        {
          provide: UploadService,
          useValue: {
            getMulterOptions: jest.fn(),
            getFileUrl: jest
              .fn()
              .mockReturnValue('/uploads/books/test-image.jpg'),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get(BooksService);
  });

  describe('softDelete', () => {
    it('should soft delete a book and return it', async () => {
      service.softDelete.mockResolvedValue(mockDeletedBook as any);

      const result = await controller.softDelete(1);

      expect(service.softDelete.mock.calls.length).toBe(1);
      expect(service.softDelete.mock.calls[0][0]).toBe(1);
      expect(result).toEqual(mockDeletedBook);
      expect(result.deletedAt).toBeTruthy();
    });

    it('should propagate NotFoundException when book not found', async () => {
      service.softDelete.mockRejectedValue(
        new NotFoundException('Book with ID 1 not found'),
      );

      await expect(controller.softDelete(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted book and return it', async () => {
      const restoredBook = { ...mockBook, deletedAt: null };

      service.restore.mockResolvedValue(restoredBook as any);

      const result = await controller.restore(1);

      expect(service.restore.mock.calls.length).toBe(1);
      expect(service.restore.mock.calls[0][0]).toBe(1);
      expect(result).toEqual(restoredBook);
      expect(result.deletedAt).toBeNull();
    });

    it('should propagate NotFoundException when book not found', async () => {
      service.restore.mockRejectedValue(
        new NotFoundException('Book with ID 1 not found'),
      );

      await expect(controller.restore(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should propagate Error when book is not deleted', async () => {
      service.restore.mockRejectedValue(
        new Error('Book with ID 1 is not deleted'),
      );

      await expect(controller.restore(1)).rejects.toThrow(
        'Book with ID 1 is not deleted',
      );
    });
  });

  describe('findDeleted', () => {
    it('should return a list of deleted books', async () => {
      const deletedBooks = [mockDeletedBook];
      service.findDeleted.mockResolvedValue(deletedBooks as any);

      const result = await controller.findDeleted();

      expect(service.findDeleted.mock.calls.length).toBe(1);
      expect(result).toEqual(deletedBooks);
      expect(result[0].deletedAt).toBeTruthy();
    });

    it('should return empty array when no deleted books', async () => {
      service.findDeleted.mockResolvedValue([]);

      const result = await controller.findDeleted();

      expect(service.findDeleted.mock.calls.length).toBe(1);
      expect(result).toEqual([]);
    });
  });

  describe('forceDelete', () => {
    it('should force delete a book', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.forceDelete(1);

      expect(service.remove.mock.calls.length).toBe(1);
      expect(service.remove.mock.calls[0][0]).toBe(1);
      expect(result).toBeUndefined();
    });

    it('should propagate NotFoundException when book not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Book with ID 1 not found'),
      );

      await expect(controller.forceDelete(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto = {
        title: 'New Book',
        author: 'Test Author',
        publisher: 'Test Publisher',
        genre: 'Fiction',
        isActive: true,
      };
      const user = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890,
      };
      const createdBook = { ...mockBook, ...createBookDto };

      service.create.mockResolvedValue(createdBook as any);

      const result = await controller.create(createBookDto, user);

      expect(service.create).toHaveBeenCalledWith({
        ...createBookDto,
        userId: user.sub,
      });
      expect(result).toEqual(createdBook);
    });

    it('should create a book with image upload', async () => {
      const createBookDto = {
        title: 'Book with Image',
        author: 'Test Author',
        publisher: 'Test Publisher',
        genre: 'Fiction',
        isActive: true,
      };
      const user = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890,
      };
      const file = { filename: 'test-image.jpg' } as any;
      const createdBook = {
        ...mockBook,
        imageUrl: '/uploads/books/test-image.jpg',
      };

      service.create.mockResolvedValue(createdBook as any);

      const result = await controller.create(createBookDto, user, file);

      expect(service.create).toHaveBeenCalledWith({
        ...createBookDto,
        userId: user.sub,
        image_url: '/uploads/books/test-image.jpg',
      });
      expect(result).toEqual(createdBook);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const filterDto = { page: 1, per_page: 10 };
      const booksResponse = {
        data: [mockBook],
        total: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      };

      service.findAll.mockResolvedValue(booksResponse as any);

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(booksResponse);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      service.findOne.mockResolvedValue(mockBook as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should propagate NotFoundException when book not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Book with ID 1 not found'),
      );

      await expect(controller.findOne(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const updateBookDto = { title: 'Updated Title' };
      const updatedBook = { ...mockBook, ...updateBookDto };

      service.update.mockResolvedValue(updatedBook as any);

      const result = await controller.update(1, updateBookDto);

      expect(service.update).toHaveBeenCalledWith(1, updateBookDto);
      expect(result).toEqual(updatedBook);
    });

    it('should propagate NotFoundException when book not found', async () => {
      const updateBookDto = { title: 'Updated Title' };
      service.update.mockRejectedValue(
        new NotFoundException('Book with ID 1 not found'),
      );

      await expect(controller.update(1, updateBookDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getFilterOptions', () => {
    it('should return filter options', async () => {
      const filterOptions = {
        genres: ['Fiction', 'Non-Fiction'],
        authors: ['Author 1', 'Author 2'],
        publishers: ['Publisher 1', 'Publisher 2'],
      };

      service.getFilterOptions.mockResolvedValue(filterOptions);

      const result = await controller.getFilterOptions();

      expect(service.getFilterOptions).toHaveBeenCalled();
      expect(result).toEqual(filterOptions);
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const file = { filename: 'test-image.jpg' } as any;
      const updatedBook = {
        ...mockBook,
        imageUrl: '/uploads/books/test-image.jpg',
      };

      service.update.mockResolvedValue(updatedBook as any);

      const result = await controller.uploadImage(1, file);

      expect(service.update).toHaveBeenCalledWith(1, {
        image_url: '/uploads/books/test-image.jpg',
      });
      expect(result).toEqual(updatedBook);
    });

    it('should propagate NotFoundException when book not found', async () => {
      const file = { filename: 'test-image.jpg' } as any;
      service.update.mockRejectedValue(
        new NotFoundException('Book with ID 1 not found'),
      );

      await expect(controller.uploadImage(1, file)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
