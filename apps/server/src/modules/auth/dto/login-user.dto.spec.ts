import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginUserDto } from './login-user.dto';

describe('LoginUserDto', () => {
  describe('Valid input', () => {
    it('should pass validation with valid email and password', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.email).toBe('test@example.com');
      expect(dto.password).toBe('password123');
    });

    it('should pass validation with different valid email formats', async () => {
      const validEmails = [
        'user@domain.com',
        'test.email@example.org',
        'user+tag@example.net',
        'user123@subdomain.example.com',
        'a@b.co',
      ];

      for (const email of validEmails) {
        const dto = plainToClass(LoginUserDto, {
          email,
          password: 'validPassword123',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.email).toBe(email);
      }
    });

    it('should pass validation with different valid passwords', async () => {
      const validPasswords = [
        'password123',
        'P@ssw0rd!',
        'simplepass',
        'a'.repeat(50),
        '12345678',
      ];

      for (const password of validPasswords) {
        const dto = plainToClass(LoginUserDto, {
          email: 'test@example.com',
          password,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.password).toBe(password);
      }
    });
  });

  describe('Invalid email', () => {
    it('should fail validation when email is missing', async () => {
      const dto = plainToClass(LoginUserDto, {
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when email is undefined', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: undefined,
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when email is null', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: null,
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when email is empty string', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: '',
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation when email is not a string', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 123,
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with invalid email formats', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user.example.com',
        'user@.com',
        'user@domain.',
        'user @example.com',
        'user@ex ample.com',
      ];

      for (const email of invalidEmails) {
        const dto = plainToClass(LoginUserDto, {
          email,
          password: 'password123',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints).toHaveProperty('isEmail');
      }
    });
  });

  describe('Invalid password', () => {
    it('should fail validation when password is missing', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when password is undefined', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: undefined,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when password is null', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: null,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when password is not a string', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: 123,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should pass validation with empty string password', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: '',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.password).toBe('');
    });
  });

  describe('Multiple validation errors', () => {
    it('should fail validation when both email and password are missing', async () => {
      const dto = plainToClass(LoginUserDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(2);

      const emailError = errors.find((error) => error.property === 'email');
      const passwordError = errors.find(
        (error) => error.property === 'password',
      );

      expect(emailError).toBeDefined();
      expect(emailError?.constraints).toHaveProperty('isDefined');

      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when email is invalid and password is missing', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'invalid-email',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(2);

      const emailError = errors.find((error) => error.property === 'email');
      const passwordError = errors.find(
        (error) => error.property === 'password',
      );

      expect(emailError).toBeDefined();
      expect(emailError?.constraints).toHaveProperty('isEmail');

      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when email is not string and password is not string', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 123,
        password: 456,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(2);

      const emailError = errors.find((error) => error.property === 'email');
      const passwordError = errors.find(
        (error) => error.property === 'password',
      );

      expect(emailError).toBeDefined();
      expect(emailError?.constraints).toHaveProperty('isString');

      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('isString');
    });
  });

  describe('Edge cases', () => {
    it('should handle extra properties gracefully', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: 'password123',
        extraProperty: 'should be ignored',
        anotherExtra: 123,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.email).toBe('test@example.com');
      expect(dto.password).toBe('password123');
      expect((dto as any).extraProperty).toBe('should be ignored');
    });

    it('should handle very long email', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const dto = plainToClass(LoginUserDto, {
        email: longEmail,
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.email).toBe(longEmail);
    });

    it('should handle very long password', async () => {
      const longPassword = 'a'.repeat(1000);
      const dto = plainToClass(LoginUserDto, {
        email: 'test@example.com',
        password: longPassword,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.password).toBe(longPassword);
    });

    it('should handle unicode characters in email and password', async () => {
      const dto = plainToClass(LoginUserDto, {
        email: 'tëst@éxåmplé.com',
        password: 'påsswörd123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.email).toBe('tëst@éxåmplé.com');
      expect(dto.password).toBe('påsswörd123');
    });
  });
});
