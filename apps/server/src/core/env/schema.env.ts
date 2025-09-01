import { config } from 'dotenv';
import * as process from 'node:process';
config();

export const envLoader = () => {
  return {
    SERVER: {
      ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
    DATABASE: {
      HOST: process.env.DATABASE_HOST,
      PORT: process.env.DATABASE_PORT,
      USER: process.env.DATABASE_USER,
      NAME: process.env.DATABASE_NAME,
      PASSWORD: process.env.DATABASE_PASSWORD,
    },
    SECURITY: {
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES: process.env.JWT_EXPIRES,
    },
  };
};

export enum NodeEnvType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}
