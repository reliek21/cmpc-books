import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import { UploadService } from '../upload/upload.service';
import type { MulterFile } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

interface UserPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', UploadService.getMulterOptions()))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new book',
    description:
      'Creates a new book with optional image upload. Requires authentication.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Book data with optional image file',
    type: CreateBookDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'The Great Gatsby' },
        author: { type: 'string', example: 'F. Scott Fitzgerald' },
        publisher: { type: 'string', example: 'Scribner' },
        genre: { type: 'string', example: 'Fiction' },
        available: { type: 'boolean', example: true },
        imageUrl: { type: 'string', example: '/uploads/books/image.jpg' },
        userId: { type: 'string', example: 'user-uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  create(
    @Body() createBookDto: CreateBookDto,
    @CurrentUser() user: UserPayload,
    @UploadedFile() file?: MulterFile,
  ) {
    if (file) {
      createBookDto.imageUrl = this.uploadService.getFileUrl(file.filename);
    }
    const bookData = { ...createBookDto, userId: user.sub };
    return this.booksService.create(bookData);
  }

  @Get('filters')
  @UsePipes(new ValidationPipe({ transform: false, whitelist: false }))
  @ApiOperation({
    summary: 'Get filter options',
    description:
      'Retrieves unique values for filter dropdowns (genres, authors, publishers).',
  })
  @ApiResponse({
    status: 200,
    description: 'Filter options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Fiction',
            'Non-Fiction',
            'Mystery',
            'Romance',
            'Science Fiction',
          ],
        },
        authors: {
          type: 'array',
          items: { type: 'string' },
          example: ['F. Scott Fitzgerald', 'Ernest Hemingway', 'Jane Austen'],
        },
        publishers: {
          type: 'array',
          items: { type: 'string' },
          example: ['Scribner', 'Penguin', 'HarperCollins'],
        },
      },
    },
  })
  getFilterOptions() {
    console.log('getFilterOptions called');
    return this.booksService.getFilterOptions();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books',
    description:
      'Retrieves a paginated list of books with optional filtering and sorting.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for title, author, publisher, or genre',
    example: 'Hemingway',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    description: 'Filter by genre',
    example: 'Fiction',
  })
  @ApiQuery({
    name: 'publisher',
    required: false,
    description: 'Filter by publisher',
    example: 'Scribner',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    description: 'Filter by author',
    example: 'Ernest Hemingway',
  })
  @ApiQuery({
    name: 'available',
    required: false,
    description: 'Filter by availability',
    example: true,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort fields with direction (asc/desc)',
    example: 'title:asc,author:desc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: 'The Great Gatsby' },
              author: { type: 'string', example: 'F. Scott Fitzgerald' },
              publisher: { type: 'string', example: 'Scribner' },
              genre: { type: 'string', example: 'Fiction' },
              available: { type: 'boolean', example: true },
              imageUrl: { type: 'string', example: '/uploads/books/image.jpg' },
              userId: { type: 'string', example: 'user-uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        per_page: { type: 'number', example: 10 },
        total_pages: { type: 'number', example: 3 },
      },
    },
  })
  findAll(@Query() filterBooksDto: FilterBooksDto) {
    return this.booksService.findAll(filterBooksDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a book by ID',
    description: 'Retrieves a single book by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'The Great Gatsby' },
        author: { type: 'string', example: 'F. Scott Fitzgerald' },
        publisher: { type: 'string', example: 'Scribner' },
        genre: { type: 'string', example: 'Fiction' },
        available: { type: 'boolean', example: true },
        imageUrl: { type: 'string', example: '/uploads/books/image.jpg' },
        userId: { type: 'string', example: 'user-uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a book',
    description: 'Updates a book by its ID with the provided data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 1,
  })
  @ApiBody({
    description: 'Book update data',
    type: UpdateBookDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'The Great Gatsby' },
        author: { type: 'string', example: 'F. Scott Fitzgerald' },
        publisher: { type: 'string', example: 'Scribner' },
        genre: { type: 'string', example: 'Fiction' },
        available: { type: 'boolean', example: true },
        imageUrl: { type: 'string', example: '/uploads/books/image.jpg' },
        userId: { type: 'string', example: 'user-uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore a deleted book',
    description: 'Restores a soft-deleted book by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Book restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Book restored successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.restore(id);
  }

  @Get('deleted')
  @ApiOperation({
    summary: 'Get deleted books',
    description: 'Retrieves all soft-deleted books.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted books retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: 'The Great Gatsby' },
          author: { type: 'string', example: 'F. Scott Fitzgerald' },
          publisher: { type: 'string', example: 'Scribner' },
          genre: { type: 'string', example: 'Fiction' },
          available: { type: 'boolean', example: true },
          imageUrl: { type: 'string', example: '/uploads/books/image.jpg' },
          userId: { type: 'string', example: 'user-uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findDeleted() {
    return this.booksService.findDeleted();
  }

  @Delete(':id/force')
  @ApiOperation({
    summary: 'Force delete a book',
    description: 'Permanently deletes a book from the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Book permanently deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Book permanently deleted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  forceDelete(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image', UploadService.getMulterOptions()))
  @ApiOperation({
    summary: 'Upload book image',
    description: 'Uploads an image for a specific book.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'The Great Gatsby' },
        author: { type: 'string', example: 'F. Scott Fitzgerald' },
        publisher: { type: 'string', example: 'Scribner' },
        genre: { type: 'string', example: 'Fiction' },
        available: { type: 'boolean', example: true },
        imageUrl: { type: 'string', example: '/uploads/books/image.jpg' },
        userId: { type: 'string', example: 'user-uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no image file provided',
  })
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
