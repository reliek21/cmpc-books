// import { config } from 'dotenv';

// config();

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   host: process.env.POSTGRES_HOST,
//   port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
//   username: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD,
//   // database: process.env.POSTGRES_DB,
//   entities: ['dist/src/**/*.entity.js'],
//   migrations: ['dist/src/migrations/*.js'],
//   migrationsTableName: 'migrations',
//   ssl:
//     process.env.NODE_ENV === 'production'
//       ? { rejectUnauthorized: false }
//       : false,
// });
