import { Test, TestingModule } from '@nestjs/testing';
import { UploadService, MulterFile } from './upload.service';
import { Request } from 'express';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('getFileUrl', () => {
    it('should return correct file URL with filename', () => {
      const filename = 'test-image.jpg';
      const expectedUrl = '/uploads/books/test-image.jpg';

      const result = service.getFileUrl(filename);

      expect(result).toBe(expectedUrl);
    });

    it('should handle filename with UUID format', () => {
      const filename = '123e4567-e89b-12d3-a456-426614174000.png';
      const expectedUrl = '/uploads/books/123e4567-e89b-12d3-a456-426614174000.png';

      const result = service.getFileUrl(filename);

      expect(result).toBe(expectedUrl);
    });

    it('should handle different file extensions', () => {
      const extensions = ['jpg', 'jpeg', 'png', 'gif'];

      extensions.forEach((ext) => {
        const filename = `test-file.${ext}`;
        const expectedUrl = `/uploads/books/test-file.${ext}`;

        const result = service.getFileUrl(filename);

        expect(result).toBe(expectedUrl);
      });
    });

    it('should handle empty filename', () => {
      const filename = '';
      const expectedUrl = '/uploads/books/';

      const result = service.getFileUrl(filename);

      expect(result).toBe(expectedUrl);
    });

    it('should handle filename with special characters', () => {
      const filename = 'special-chars_123.jpg';
      const expectedUrl = '/uploads/books/special-chars_123.jpg';

      const result = service.getFileUrl(filename);

      expect(result).toBe(expectedUrl);
    });

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(100);
      const filename = `${longName}.jpg`;
      const expectedUrl = `/uploads/books/${filename}`;

      const result = service.getFileUrl(filename);

      expect(result).toBe(expectedUrl);
    });
  });

  describe('getMulterOptions', () => {
    let multerOptions: any;

    beforeEach(() => {
      multerOptions = UploadService.getMulterOptions();
    });

    it('should return multer options with correct structure', () => {
      expect(multerOptions).toHaveProperty('storage');
      expect(multerOptions).toHaveProperty('fileFilter');
      expect(multerOptions).toHaveProperty('limits');
    });

    it('should have correct file size limit', () => {
      expect(multerOptions.limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
    });

    describe('fileFilter', () => {
      it('should accept valid image files', () => {
        const validMimetypes = [
          'image/jpg',
          'image/jpeg',
          'image/png',
          'image/gif',
        ];

        validMimetypes.forEach((mimetype) => {
          const mockFile: MulterFile = {
            fieldname: 'cover_image',
            originalname: 'test.jpg',
            encoding: '7bit',
            mimetype,
            size: 1024,
            filename: 'test.jpg',
            path: '/path/to/file',
          };

          const mockCallback = jest.fn();

          multerOptions.fileFilter(
            {} as Request,
            mockFile,
            mockCallback,
          );

          expect(mockCallback).toHaveBeenCalledWith(null, true);
        });
      });

      it('should reject invalid file types', () => {
        const invalidMimetypes = [
          'application/pdf',
          'text/plain',
          'video/mp4',
          'audio/mp3',
          'application/json',
        ];

        invalidMimetypes.forEach((mimetype) => {
          const mockFile: MulterFile = {
            fieldname: 'cover_image',
            originalname: 'test.pdf',
            encoding: '7bit',
            mimetype,
            size: 1024,
            filename: 'test.pdf',
            path: '/path/to/file',
          };

          const mockCallback = jest.fn();

          multerOptions.fileFilter(
            {} as Request,
            mockFile,
            mockCallback,
          );

          expect(mockCallback).toHaveBeenCalledWith(
            expect.any(Error),
            false,
          );
          expect(mockCallback.mock.calls[0][0].message).toBe(
            'Only image files are allowed!',
          );
        });
      });

      it('should handle edge case mimetypes', () => {
        const edgeCases = [
          { mimetype: 'image/', shouldAccept: false },
          { mimetype: 'image/webp', shouldAccept: false },
          { mimetype: 'image/svg+xml', shouldAccept: false },
          { mimetype: 'text/jpeg', shouldAccept: true }, // This actually matches the regex /(jpg|jpeg|png|gif)$/
        ];

        edgeCases.forEach(({ mimetype, shouldAccept }) => {
          const mockFile: MulterFile = {
            fieldname: 'cover_image',
            originalname: 'test.file',
            encoding: '7bit',
            mimetype,
            size: 1024,
            filename: 'test.file',
            path: '/path/to/file',
          };

          const mockCallback = jest.fn();

          multerOptions.fileFilter({} as Request, mockFile, mockCallback);

          if (shouldAccept) {
            expect(mockCallback).toHaveBeenCalledWith(null, true);
          } else {
            expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), false);
          }
        });
      });
    });

    describe('storage filename function', () => {
      it('should generate unique filename with original extension', () => {
        const mockFile: MulterFile = {
          fieldname: 'cover_image',
          originalname: 'test-image.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          filename: '',
          path: '',
        };

        const mockCallback = jest.fn();

        // Mock the storage destination and filename functions
        const storageConfig = multerOptions.storage;
        
        // Test the filename function
        storageConfig.getFilename(
          {} as Request,
          mockFile,
          mockCallback,
        );

        expect(mockCallback).toHaveBeenCalledWith(
          null,
          expect.stringMatching(/^[0-9a-f-]{36}\.jpg$/),
        );
      });

      it('should handle different file extensions', () => {
        const extensions = ['.png', '.gif', '.jpeg', '.JPG'];

        extensions.forEach((ext) => {
          const mockFile: MulterFile = {
            fieldname: 'cover_image',
            originalname: `test${ext}`,
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 1024,
            filename: '',
            path: '',
          };

          const mockCallback = jest.fn();
          const storageConfig = multerOptions.storage;

          storageConfig.getFilename(
            {} as Request,
            mockFile,
            mockCallback,
          );

          expect(mockCallback).toHaveBeenCalledWith(
            null,
            expect.stringMatching(new RegExp(`^[0-9a-f-]{36}\\${ext}$`)),
          );
        });
      });

      it('should handle files without extension', () => {
        const mockFile: MulterFile = {
          fieldname: 'cover_image',
          originalname: 'test-file-no-extension',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          filename: '',
          path: '',
        };

        const mockCallback = jest.fn();
        const storageConfig = multerOptions.storage;

        storageConfig.getFilename(
          {} as Request,
          mockFile,
          mockCallback,
        );

        expect(mockCallback).toHaveBeenCalledWith(
          null,
          expect.stringMatching(/^[0-9a-f-]{36}$/),
        );
      });
    });

    describe('storage destination', () => {
      it('should have storage configuration', () => {
        const storageConfig = multerOptions.storage;
        
        expect(storageConfig).toBeDefined();
        // The storage is configured with diskStorage, so we can't directly test destination
        // but we can verify it's properly configured
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work with multiple file operations', () => {
      const filenames = [
        'file1.jpg',
        'file2.png',
        'file3.gif',
      ];

      const urls = filenames.map((filename) => service.getFileUrl(filename));

      expect(urls).toEqual([
        '/uploads/books/file1.jpg',
        '/uploads/books/file2.png',
        '/uploads/books/file3.gif',
      ]);
    });

    it('should handle concurrent file URL generation', () => {
      const results = Array.from({ length: 10 }, (_, i) => 
        service.getFileUrl(`file${i}.jpg`)
      );

      results.forEach((url, index) => {
        expect(url).toBe(`/uploads/books/file${index}.jpg`);
      });
    });

    it('should maintain consistency across multiple calls', () => {
      const filename = 'consistent-test.jpg';
      
      const url1 = service.getFileUrl(filename);
      const url2 = service.getFileUrl(filename);
      const url3 = service.getFileUrl(filename);

      expect(url1).toBe(url2);
      expect(url2).toBe(url3);
      expect(url1).toBe('/uploads/books/consistent-test.jpg');
    });
  });
});
