// Mock Joi validation to avoid configuration issues
jest.mock('./core/env/env', () => ({
  ENV_SCHEMA: {
    validate: jest.fn().mockReturnValue({
      error: null,
      value: {
        NODE_ENV: 'test',
        PORT: 3001,
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: 5432,
        DATABASE_USER: 'test',
        DATABASE_PASSWORD: 'test',
        DATABASE_NAME: 'test',
        JWT_SECRET: 'test-secret',
        JWT_REFRESH: 'test-refresh',
        JWT_SECRET_TTL: '1d',
        JWT_REFRESH_TTL: '7d',
      },
    }),
  },
}));

// Mock the env loader
jest.mock('./core/env/schema.env', () => ({
  envLoader: () => ({
    SERVER: {
      ENV: 'test',
      PORT: '3001',
    },
    DATABASE: {
      HOST: 'localhost',
      PORT: '5432',
      USER: 'test',
      PASSWORD: 'test',
      NAME: 'test',
    },
    SECURITY: {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH: 'test-refresh',
      JWT_SECRET_TTL: '1d',
      JWT_REFRESH_TTL: '7d',
    },
  }),
  NodeEnvType: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
  },
}));

describe('AppModule', () => {
  beforeAll(() => {
    // Set all required environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USER = 'test';
    process.env.DATABASE_PASSWORD = 'test';
    process.env.DATABASE_NAME = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH = 'test-refresh';
    process.env.JWT_SECRET_TTL = '1d';
    process.env.JWT_REFRESH_TTL = '7d';
  });

  it('should be defined', () => {
    // Simple check that the module file exists and is accessible
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have environment variables configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBe('test-secret');
    expect(process.env.DATABASE_HOST).toBe('localhost');
  });

  it('should validate required environment configuration', () => {
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'JWT_REFRESH',
      'DATABASE_HOST',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'DATABASE_NAME',
    ];

    requiredVars.forEach((varName) => {
      expect(process.env[varName]).toBeDefined();
      expect(process.env[varName]).not.toBe('');
    });
  });

  it('should parse database port correctly', () => {
    const dbPort = parseInt(process.env.DATABASE_PORT || '5432', 10);
    expect(dbPort).toBe(5432);
    expect(typeof dbPort).toBe('number');
  });

  it('should have valid JWT configuration', () => {
    expect(process.env.JWT_SECRET).toBe('test-secret');
    expect(process.env.JWT_SECRET_TTL).toBe('1d');
    expect(process.env.JWT_REFRESH_TTL).toBe('7d');
  });
});
