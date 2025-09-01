/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import * as Joi from 'joi';
const joi = Joi as any;

export const ENV_SCHEMA: Joi.ObjectSchema<any> = joi.object({
  PORT: joi.number().integer().min(1).max(65535).default(3001),
  NODE_ENV: joi.string().valid('development', 'production', 'test'),
  DATABASE_HOST: joi.string(),
  DATABASE_PORT: joi.number().integer().min(1).max(65535),
  DATABASE_USER: joi.string(),
  DATABASE_PASSWORD: joi.string(),
  DATABASE_NAME: joi.string(),
  JWT_SECRET: joi.string(),
  JWT_REFRESH: joi.string(),
  JWT_SECRET_TTL: joi.string(),
  JWT_REFRESH_TTL: joi.string(),
});
