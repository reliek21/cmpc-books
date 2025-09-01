import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { FilterBooksDto } from './filter-books.dto';

describe('FilterBooksDto', () => {
  describe('Valid input', () => {
    it('should pass validation with all valid optional fields', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 'Hemingway',
        genre: 'Fiction',
        publisher: 'Scribner',
        author: 'Ernest Hemingway',
        available: true,
        sort: 'title:asc,author:desc',
        page: 1,
        per_page: 10,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('Hemingway');
      expect(dto.genre).toBe('Fiction');
      expect(dto.publisher).toBe('Scribner');
      expect(dto.author).toBe('Ernest Hemingway');
      expect(dto.available).toBe(true);
      expect(dto.sort).toBe('title:asc,author:desc');
      expect(dto.page).toBe(1);
      expect(dto.per_page).toBe(10);
    });

    it('should pass validation with no fields provided', async () => {
      const dto = plainToClass(FilterBooksDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.per_page).toBe(10);
    });

    it('should pass validation with only search field', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 'test search',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('test search');
    });

    it('should transform string booleans to actual booleans', async () => {
      const dtoTrue = plainToClass(FilterBooksDto, {
        available: 'true',
      });

      const dtoFalse = plainToClass(FilterBooksDto, {
        available: 'false',
      });

      const errorsTrue = await validate(dtoTrue);
      const errorsFalse = await validate(dtoFalse);

      expect(errorsTrue).toHaveLength(0);
      expect(errorsFalse).toHaveLength(0);
      expect(dtoTrue.available).toBe(true);
      expect(dtoFalse.available).toBe(false);
    });

    it('should transform string numbers to integers for page and per_page', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: '5',
        per_page: '25',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(5);
      expect(dto.per_page).toBe(25);
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.per_page).toBe('number');
    });

    it('should pass validation with minimum valid page values', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: 1,
        per_page: 1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.per_page).toBe(1);
    });

    it('should pass validation with large page values', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: 1000,
        per_page: 100,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1000);
      expect(dto.per_page).toBe(100);
    });
  });

  describe('Invalid input', () => {
    it('should fail validation when search is not a string', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 123,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('search');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when genre is not a string', async () => {
      const dto = plainToClass(FilterBooksDto, {
        genre: 123,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('genre');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when publisher is not a string', async () => {
      const dto = plainToClass(FilterBooksDto, {
        publisher: true,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('publisher');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when author is not a string', async () => {
      const dto = plainToClass(FilterBooksDto, {
        author: [],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('author');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when available is not a boolean', async () => {
      const dto = plainToClass(FilterBooksDto, {
        available: 'invalid',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('available');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when sort is not a string', async () => {
      const dto = plainToClass(FilterBooksDto, {
        sort: 123,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sort');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when page is less than 1', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when page is negative', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: -1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when per_page is less than 1', async () => {
      const dto = plainToClass(FilterBooksDto, {
        per_page: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('per_page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when page is not an integer', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: 1.5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when per_page is not an integer', async () => {
      const dto = plainToClass(FilterBooksDto, {
        per_page: 2.7,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('per_page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('Multiple validation errors', () => {
    it('should fail validation with multiple invalid fields', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 123,
        genre: true,
        page: 0,
        per_page: -5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(4);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('search');
      expect(properties).toContain('genre');
      expect(properties).toContain('page');
      expect(properties).toContain('per_page');
    });

    it('should validate mixed valid and invalid fields', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 'valid search',
        genre: 123, // invalid
        available: true,
        page: 0, // invalid
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(2);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('genre');
      expect(properties).toContain('page');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings for string fields', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: '',
        genre: '',
        publisher: '',
        author: '',
        sort: '',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('');
      expect(dto.genre).toBe('');
      expect(dto.publisher).toBe('');
      expect(dto.author).toBe('');
      expect(dto.sort).toBe('');
    });

    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(1000);
      const dto = plainToClass(FilterBooksDto, {
        search: longString,
        genre: longString,
        publisher: longString,
        author: longString,
        sort: longString,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe(longString);
      expect(dto.genre).toBe(longString);
    });

    it('should handle special characters in string fields', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 'café & résumé',
        genre: 'Sci-Fi/Fantasy',
        publisher: 'O\'Reilly & Associates',
        author: 'José María García-López',
        sort: 'title:asc,author:desc',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('café & résumé');
      expect(dto.author).toBe('José María García-López');
    });

    it('should handle large page numbers', async () => {
      const dto = plainToClass(FilterBooksDto, {
        page: 999999,
        per_page: 1000,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(999999);
      expect(dto.per_page).toBe(1000);
    });

    it('should ignore extra properties', async () => {
      const dto = plainToClass(FilterBooksDto, {
        search: 'test',
        extraProperty: 'should be ignored',
        anotherExtra: 123,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('test');
      expect((dto as any).extraProperty).toBe('should be ignored');
    });

    it('should handle boolean available field properly', async () => {
      const dtoTrue = plainToClass(FilterBooksDto, {
        available: true,
      });

      const dtoFalse = plainToClass(FilterBooksDto, {
        available: false,
      });

      const errorsTrue = await validate(dtoTrue);
      const errorsFalse = await validate(dtoFalse);

      expect(errorsTrue).toHaveLength(0);
      expect(errorsFalse).toHaveLength(0);
      expect(dtoTrue.available).toBe(true);
      expect(dtoFalse.available).toBe(false);
    });
  });
});
