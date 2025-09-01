import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';

describe('UploadService', () => {
	let service: UploadService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UploadService],
		}).compile();

		service = module.get<UploadService>(UploadService);
	});

	describe('getFileUrl', () => {
		it('should return correct file URL', () => {
			const filename = 'test-image.jpg';
			const expectedUrl = '/uploads/books/test-image.jpg';

			const result = service.getFileUrl(filename);

			expect(result).toBe(expectedUrl);
		});

		it('should handle different file extensions', () => {
			const testCases = [
				{ filename: 'image.png', expected: '/uploads/books/image.png' },
				{ filename: 'photo.jpeg', expected: '/uploads/books/photo.jpeg' },
				{ filename: 'picture.gif', expected: '/uploads/books/picture.gif' },
				{
					filename: 'uuid-123-456.jpg',
					expected: '/uploads/books/uuid-123-456.jpg',
				},
			];

			testCases.forEach(({ filename, expected }) => {
				expect(service.getFileUrl(filename)).toBe(expected);
			});
		});
	});

	describe('getMulterOptions', () => {
		let multerOptions: any;

		beforeEach(() => {
			multerOptions = UploadService.getMulterOptions();
		});

		it('should return multer configuration object', () => {
			expect(multerOptions).toBeDefined();
			expect(multerOptions.storage).toBeDefined();
			expect(multerOptions.fileFilter).toBeDefined();
			expect(multerOptions.limits).toBeDefined();
		});

		it('should have correct file size limit', () => {
			expect(multerOptions.limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
		});

		describe('fileFilter', () => {
			let fileFilter: Function;
			let mockCallback: jest.Mock;

			beforeEach(() => {
				fileFilter = multerOptions.fileFilter;
				mockCallback = jest.fn();
			});

			it('should accept valid image files', () => {
				const validMimeTypes = [
					'image/jpg',
					'image/jpeg',
					'image/png',
					'image/gif',
				];

				validMimeTypes.forEach((mimetype) => {
					const mockFile = { mimetype, originalname: 'test.jpg' };
					fileFilter(null, mockFile, mockCallback);

					expect(mockCallback).toHaveBeenCalledWith(null, true);
					mockCallback.mockClear();
				});
			});

			it('should reject invalid file types', () => {
				const invalidMimeTypes = [
					'application/pdf',
					'text/plain',
					'video/mp4',
					'audio/mp3',
					'application/zip',
				];

				invalidMimeTypes.forEach((mimetype) => {
					const mockFile = { mimetype, originalname: 'test.pdf' };
					fileFilter(null, mockFile, mockCallback);

					expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), false);
					expect(mockCallback.mock.calls[0][0].message).toBe(
						'Only image files are allowed!',
					);
					mockCallback.mockClear();
				});
			});
		});

		describe('storage', () => {
			it('should generate unique filename with UUID', () => {
				const storage = multerOptions.storage;
				const mockCallback = jest.fn();
				const mockFile = {
					originalname: 'test-image.jpg',
					mimetype: 'image/jpeg',
				};

				// Access the filename function from storage configuration
				const filenameFunction = storage.getFilename || storage._getFilename;

				if (filenameFunction) {
					filenameFunction(null, mockFile, mockCallback);

					expect(mockCallback).toHaveBeenCalled();
					const generatedFilename = mockCallback.mock.calls[0][1];

					// Should end with the original extension
					expect(generatedFilename).toMatch(/\.jpg$/);
					// Should contain UUID format (36 characters + extension)
					expect(generatedFilename.length).toBeGreaterThan(36);
				}
			});
		});
	});
});
