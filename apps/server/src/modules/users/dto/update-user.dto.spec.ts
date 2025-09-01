import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  describe('Validation', () => {
    it('should pass validation with all fields valid', async () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
        updated_at: new Date(),
        deleted_at: new Date(),
      };

      const dtoInstance = plainToInstance(UpdateUserDto, validData);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with only required fields', async () => {
      const minimalData = {};

      const dtoInstance = plainToInstance(UpdateUserDto, minimalData);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial fields', async () => {
      const partialData = {
        first_name: 'John',
        email: 'john.doe@example.com',
      };

      const dtoInstance = plainToInstance(UpdateUserDto, partialData);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
    });
  });

  describe('first_name', () => {
    it('should accept valid first_name', async () => {
      const data = { first_name: 'John' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.first_name).toBe('John');
    });

    it('should accept empty string for first_name', async () => {
      const data = { first_name: '' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.first_name).toBe('');
    });

    it('should reject non-string first_name', async () => {
      const data = { first_name: 123 };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('last_name', () => {
    it('should accept valid last_name', async () => {
      const data = { last_name: 'Doe' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.last_name).toBe('Doe');
    });

    it('should accept empty string for last_name', async () => {
      const data = { last_name: '' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.last_name).toBe('');
    });

    it('should reject non-string last_name', async () => {
      const data = { last_name: 456 };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('email', () => {
    it('should accept valid email', async () => {
      const data = { email: 'john.doe@example.com' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.email).toBe('john.doe@example.com');
    });

    it('should accept valid email with subdomain', async () => {
      const data = { email: 'user@sub.domain.com' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.email).toBe('user@sub.domain.com');
    });

    it('should reject invalid email format', async () => {
      const data = { email: 'invalid-email' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should reject email without domain', async () => {
      const data = { email: 'user@' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should reject non-string email', async () => {
      const data = { email: 123 };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('password', () => {
    it('should accept valid password', async () => {
      const data = { password: 'StrongPass123!' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.password).toBe('StrongPass123!');
    });

    it('should accept empty string for password', async () => {
      const data = { password: '' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.password).toBe('');
    });

    it('should reject non-string password', async () => {
      const data = { password: 789 };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('updated_at', () => {
    it('should accept valid Date object', async () => {
      const testDate = new Date();
      const data = { updated_at: testDate };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.updated_at).toEqual(testDate);
    });

    it('should reject valid date string (IsDate only accepts Date objects)', async () => {
      const dateString = '2023-01-01T00:00:00.000Z';
      const data = { updated_at: dateString };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });

    it('should accept undefined for updated_at', async () => {
      const data = { updated_at: undefined };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.updated_at).toBeUndefined();
    });

    it('should reject invalid date', async () => {
      const data = { updated_at: 'invalid-date' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });

    it('should reject non-date value', async () => {
      const data = { updated_at: 123 };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('deleted_at', () => {
    it('should accept valid Date object', async () => {
      const testDate = new Date();
      const data = { deleted_at: testDate };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.deleted_at).toEqual(testDate);
    });

    it('should reject valid date string (IsDate only accepts Date objects)', async () => {
      const dateString = '2023-01-01T00:00:00.000Z';
      const data = { deleted_at: dateString };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });

    it('should accept undefined for deleted_at', async () => {
      const data = { deleted_at: undefined };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.deleted_at).toBeUndefined();
    });

    it('should reject invalid date', async () => {
      const data = { deleted_at: 'invalid-date' };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });

    it('should reject non-date value', async () => {
      const data = { deleted_at: 456 };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('Inheritance from CreateUserDto', () => {
    it('should inherit all fields from CreateUserDto as optional', async () => {
      const data = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        updated_at: new Date(),
        deleted_at: new Date(),
      };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.first_name).toBe('John');
      expect(dtoInstance.last_name).toBe('Doe');
      expect(dtoInstance.email).toBe('john@example.com');
      expect(dtoInstance.password).toBe('password123');
      expect(dtoInstance.updated_at).toBeInstanceOf(Date);
      expect(dtoInstance.deleted_at).toBeInstanceOf(Date);
    });

    it('should allow empty object (all fields optional)', async () => {
      const data = {};

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values for optional fields', async () => {
      const data = {
        first_name: null,
        last_name: null,
        email: null,
        password: null,
        updated_at: null,
        deleted_at: null,
      };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      // Null values should be accepted for optional fields
      expect(errors.length).toBe(0);
    });

    it('should handle mixed valid and invalid values', async () => {
      const data = {
        first_name: 'John',
        email: 'invalid-email',
        updated_at: 'invalid-date',
      };

      const dtoInstance = plainToInstance(UpdateUserDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      // Should have errors for email and updated_at
      const errorFields = errors.map((error) => error.property);
      expect(errorFields).toContain('email');
      expect(errorFields).toContain('updated_at');
    });
  });
});